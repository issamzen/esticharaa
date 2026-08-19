import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Coins,
  Eye,
  Loader2,
  Lock,
  MessageSquare,
  Star,
  Users,
  CheckCircle2,
  AlertTriangle,
  Send,
  Flag,
  EyeOff,
  FileText,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "@/components/site/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePageCopy } from "@/i18n/page-copy";
import { formatDate, formatNumber } from "@/i18n/format";
import { useLocale } from "@/i18n/use-locale";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useSiteSettings } from "@/lib/site-settings";
import { RichTextContent } from "@/components/site/question-composer";

function decodeQuestionRef(value:string){try{return decodeURIComponent(value)}catch{return value}}

export const Route=createFileRoute("/questions/$questionId")({
 loader:async({params})=>{const questionRef=decodeQuestionRef(params.questionId);let seoQuestion:null|{title:string;description:string;slug:string}=null;try{const{data}=await supabase.rpc("get_question_seo_by_ref",{p_question_ref:questionRef});const seo=data as {title?:string;description?:string;slug?:string}|null;if(seo?.title)seoQuestion={title:seo.title,description:seo.description??"",slug:seo.slug??questionRef}}catch{}return{seoQuestion,questionId:questionRef}},
 head:({loaderData})=>{const item=loaderData?.seoQuestion;return{meta:item?[{title:`${item.title} — Estichara.ma`},{name:"description",content:item.description.slice(0,155)},{property:"og:title",content:`${item.title} — Estichara.ma`},{property:"og:description",content:item.description.slice(0,155)}]:[{title:"Estichara.ma"}]}},
 component:QuestionDetail,
});

// ---------- Types for real database questions ----------
type DbAnswer = {
  id: string;
  body: string | null; // null = locked (server refused to send it)
  preview: string;
  is_best: boolean;
  created_at: string;
  expert_name: string;
  expert_title: string | null;
  expert_verified: boolean | null;
  expert_rating: number | null;
  expert_reviews: number | null;
};

type Audience = {
  id: string;
  label_ar: string;
  label_fr: string;
  label_en: string;
  active: boolean;
};

type ExpertAccess = {
  status: "pending" | "approved" | "rejected" | "suspended";
  audience_ids: string[];
};

type DbQuestion = {
  id: string;
  slug: string;
  title: string;
  body: string;
  tokens: number;
  unlock_cost: number;
  question_locked: boolean;
  is_anonymous:boolean;
  is_owner:boolean;
  target_audience_id: string | null;
  attachments:{id:string;file_name:string;storage_path:string;mime_type:string;file_size:number}[];
  views: number;
  tags: string[];
  created_at: string;
  category_name: string | null;
  asker_name: string | null;
  unlocked: boolean;
  answers: DbAnswer[];
};

function QuestionDetail(){const{questionId}=Route.useLoaderData();return <DbQuestionDetail questionId={questionId}/>;}

// ============================================================
// REAL QUESTIONS (from your Supabase database)
// ============================================================
function DbQuestionDetail({ questionId }: { questionId: string }) {
  const copy = usePageCopy().question;
  const { t } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const site=useSiteSettings();
  const [q, setQ] = useState<DbQuestion | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "notfound">("loading");
  const [unlocking, setUnlocking] = useState(false);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [expertAccess, setExpertAccess] = useState<ExpertAccess | null>(null);
  const [myAnswerStatus, setMyAnswerStatus] = useState<string | null>(null);
  const [answerBody, setAnswerBody] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [reportTarget,setReportTarget]=useState<{type:"question"|"answer";id:string;label:string}|null>(null);
  const [reportCategory,setReportCategory]=useState("spam");
  const [reportDetails,setReportDetails]=useState("");
  const [reportBusy,setReportBusy]=useState(false);
  const [reviewAnswer,setReviewAnswer]=useState<{id:string;name:string}|null>(null);
  const [reviewRating,setReviewRating]=useState(5);
  const [reviewComment,setReviewComment]=useState("");
  const [reviewBusy,setReviewBusy]=useState(false);
  const [selectingBestId,setSelectingBestId]=useState<string|null>(null);

  async function load() {
    const { data, error } = await supabase.rpc("get_question_page_by_ref", {
      p_question_ref: questionId,
    });
    if (error || !data) {
      setState("notfound");
      return;
    }
    const loaded=data as DbQuestion;
    setQ(loaded);
    setState("ready");
    supabase.rpc("increment_question_views",{p_question_id:loaded.id});
  }

  useEffect(() => {
    load().then(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId, user?.id]);
  useEffect(()=>{if(q?.slug&&questionId!==q.slug)navigate({to:"/questions/$questionId",params:{questionId:q.slug},replace:true})},[q?.slug,questionId,navigate]);

  useEffect(() => {
    supabase.from("settings").select("value").eq("key", "expert_audiences").single()
      .then(({ data }) => setAudiences(((data?.value as Audience[]) ?? []).filter((item) => item.active)));

    if(!user){setExpertAccess(null);setMyAnswerStatus(null);return}
    if(q?.id)supabase.from("answers").select("status").eq("question_id",q.id).eq("expert_id",user.id).maybeSingle().then(({data})=>setMyAnswerStatus(data?.status??null));
    if(profile?.role==="expert")supabase.from("expert_profiles").select("status,audience_ids").eq("user_id",user.id).single().then(({data})=>setExpertAccess(data as ExpertAccess|null));else setExpertAccess(null);
  }, [questionId,user,profile?.role,q?.id]);

  async function submitAnswer() {
    const clean = answerBody.trim();
    if (clean.length < 20) {
      toast.error(locale === "ar" ? "يجب أن تتكون الإجابة من 20 حرفًا على الأقل" : locale === "fr" ? "La réponse doit contenir au moins 20 caractères." : "Your answer must be at least 20 characters.");
      return;
    }
    setSubmittingAnswer(true);
    const{data,error}=await supabase.rpc("submit_community_answer",{p_question_id:q!.id,p_body:clean,p_preview:clean.slice(0,220)});
    setSubmittingAnswer(false);
    if(error){toast.error(error.message.includes("CANNOT_ANSWER_OWN_QUESTION")?(locale==="ar"?"لا يمكنك الإجابة عن سؤالك الخاص":"You cannot answer your own question"):error.message);return}
    const published=(data as {status?:string}|null)?.status==="approved";setAnswerBody("");setMyAnswerStatus(published?"approved":"pending");if(published)await load();
    toast.success(published?(locale==="ar"?"نُشرت إجابتك مباشرة لأنك خبير معتمد":"Your approved-expert answer was published immediately"):(locale==="ar"?"تم إرسال إجابتك للمراجعة الإدارية":locale==="fr"?"Votre réponse a été envoyée pour validation.":"Your answer was submitted for admin review."));
  }

  async function openAttachment(path:string){const{data,error}=await supabase.storage.from("question-attachments").createSignedUrl(path,300);if(error||!data){toast.error(locale==="ar"?"تعذر فتح المرفق":"Could not open attachment");return}window.open(data.signedUrl,"_blank","noopener,noreferrer")}
  async function submitReport(){if(!reportTarget||!user){navigate({to:"/auth"});return}if(reportDetails.trim().length<5){toast.error(locale==="ar"?"أضف تفاصيل قصيرة عن سبب البلاغ":"Please add a short explanation");return}setReportBusy(true);const{error}=await supabase.rpc("create_content_report",{p_target_type:reportTarget.type,p_target_id:reportTarget.id,p_category:reportCategory,p_details:reportDetails.trim()});setReportBusy(false);if(error){toast.error(error.message.includes("REPORT_ALREADY_OPEN")?(locale==="ar"?"لديك بلاغ مفتوح بالفعل حول هذا المحتوى":"You already have an open report for this content"):error.message);return}setReportTarget(null);setReportDetails("");toast.success(locale==="ar"?"تم إرسال البلاغ إلى فريق المراجعة":"Report sent to moderation")}
  async function submitReview(){if(!reviewAnswer||!user)return;if(reviewComment.trim().length>0&&reviewComment.trim().length<5){toast.error(locale==="ar"?"اكتب تعليقًا أوضح أو اتركه فارغًا":"Write a clearer comment or leave it empty");return}setReviewBusy(true);const{error}=await supabase.rpc("submit_expert_review",{p_answer_id:reviewAnswer.id,p_rating:reviewRating,p_comment:reviewComment.trim()});setReviewBusy(false);if(error){toast.error(error.message.includes("UNLOCK_REQUIRED")?(locale==="ar"?"يجب فتح الإجابة قبل تقييمها":"Unlock the answer before reviewing it"):error.message);return}setReviewAnswer(null);setReviewComment("");toast.success(locale==="ar"?"شكرًا، تم حفظ تقييمك":"Thank you, your review was saved")}

  async function selectBestAnswer(answerId:string){
    if(!q?.is_owner||selectingBestId)return;
    const confirmed=window.confirm(locale==="ar"?"هل تريد اختيار هذه الإجابة كأفضل إجابة؟ لا يمكن تغيير الاختيار بعد منح المكافأة.":locale==="fr"?"Choisir cette réponse comme meilleure réponse ? Ce choix devient définitif après attribution de la récompense.":"Select this as the best answer? The choice becomes final after the reward is granted.");
    if(!confirmed)return;
    setSelectingBestId(answerId);
    const{data,error}=await supabase.rpc("select_best_answer",{p_answer_id:answerId});
    setSelectingBestId(null);
    if(error){
      const message=error.message.includes("BEST_ANSWER_ALREADY_SELECTED")?(locale==="ar"?"تم اختيار أفضل إجابة لهذا السؤال بالفعل":"A best answer has already been selected for this question"):error.message.includes("QUESTION_OWNER_ONLY")?(locale==="ar"?"صاحب السؤال فقط يمكنه اختيار أفضل إجابة":"Only the question owner can select the best answer"):error.message;
      toast.error(message);return;
    }
    await load();
    const tokens=Number((data as {tokens_awarded?:number}|null)?.tokens_awarded??0);
    toast.success(tokens>0?(locale==="ar"?`تم اختيار أفضل إجابة ومنح صاحبها ${tokens} توكن`:`Best answer selected and ${tokens} tokens awarded`):(locale==="ar"?"تم اختيار أفضل إجابة":"Best answer selected"));
  }

  async function unlock() {
    if (!user) {
      toast.info(t("auth.signInDescription"));
      navigate({ to: "/auth" });
      return;
    }
    if ((profile?.tokens_balance ?? 0) < effectiveUnlockCost) {
      toast.error(
        t("question.notEnoughTokens", "رصيدك غير كافٍ — اشترِ توكن أولًا"),
      );
      navigate({ to: "/tokens" });
      return;
    }
    setUnlocking(true);
    const { error } = await supabase.rpc("unlock_question", {
      p_question_id: q!.id,
    });
    setUnlocking(false);
    if (error) {
      toast.error(error.message.includes("INSUFFICIENT_TOKENS")
        ? t("question.notEnoughTokens", "رصيدك غير كافٍ")
        : error.message);
      return;
    }
    await refreshProfile();
    await load();
    toast.success(t("question.unlockedNow", "تم فتح الإجابات الكاملة! 🎉"));
  }

  if (state === "loading") {
    return (
      <SiteLayout>
        <div className="grid min-h-[50vh] place-items-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </SiteLayout>
    );
  }

  if (state === "notfound" || !q) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-32 text-center">
          <h1 className="text-3xl font-semibold">{copy.notFound}</h1>
          <Button asChild className="mt-6 rounded-xl">
            <Link to="/questions">{copy.back}</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const effectiveUnlockCost=site.tokenProgram.mode==="full"?q.unlock_cost:0;
  const targetAudience = audiences.find((item) => item.id === q.target_audience_id);
  const targetLabel = targetAudience
    ? locale === "fr" ? targetAudience.label_fr : locale === "en" ? targetAudience.label_en : targetAudience.label_ar
    : null;
  const assignedLabels = audiences
    .filter((item) => expertAccess?.audience_ids?.includes(item.id))
    .map((item) => locale === "fr" ? item.label_fr : locale === "en" ? item.label_en : item.label_ar);
  const isEligibleExpert=expertAccess?.status==="approved"&&(site.tokenProgram.mode!=="full"||!q.target_audience_id||expertAccess.audience_ids?.includes(q.target_audience_id));

  return (
    <SiteLayout>
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-wrap items-center gap-2">
          {q.category_name ? (
            <Badge variant="secondary" className="rounded-full">
              {q.category_name}
            </Badge>
          ) : null}
          {q.is_anonymous&&<Badge variant="outline" className="rounded-full border-violet-300 bg-violet-50 text-violet-700"><EyeOff className="size-3"/>{locale==="ar"?"سؤال مجهول":locale==="fr"?"Question anonyme":"Anonymous question"}</Badge>}
          <Badge variant="outline" className="rounded-full border-secondary/40 bg-secondary/5">
            <Users className="size-3" />
            {targetLabel ?? (locale === "ar" ? "كل الخبراء المؤهلين" : locale === "fr" ? "Tous les experts qualifiés" : "All qualified experts")}
          </Badge>
          <Badge
            variant={effectiveUnlockCost > 0 ? "default" : "outline"}
            className={
              effectiveUnlockCost > 0
                ? "rounded-full bg-accent text-accent-foreground"
                : "rounded-full"
            }
          >
            {effectiveUnlockCost > 0 ? (
              <>
                <Lock className="size-3" /> {effectiveUnlockCost} {t("common.tokens")}
              </>
            ) : (
              copy.free
            )}
          </Badge>
          <time className="text-xs text-muted-foreground" dateTime={q.created_at}>
            {formatDate(q.created_at, locale)}
          </time>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="size-3.5" /> {formatNumber(q.views, locale)}
          </span>
        </div>

        <h1 className="mt-5 text-balance text-3xl font-semibold leading-tight sm:text-4xl">
          {q.title}
        </h1>
        {q.asker_name ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {t("question.askedBy", "سأل")}: {q.asker_name}
          </p>
        ) : null}
        <RichTextContent text={q.body} className="mt-5 text-base leading-8 text-muted-foreground"/>
        {q.question_locked && (
          <div className="mt-5 rounded-2xl border border-accent/30 bg-accent/5 p-5 text-center">
            <Lock className="mx-auto size-5 text-accent" />
            <p className="mt-2 font-semibold">{t("question.signInForFullQuestion", "سجّل الدخول لقراءة السؤال كاملًا")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("question.guestPreviewOnly", "يظهر للزوار مقتطف فقط، بما في ذلك الأسئلة المجانية.")}</p>
            <Button asChild className="mt-3 rounded-xl"><Link to="/auth">{t("nav.signIn")}</Link></Button>
          </div>
        )}
        {q.attachments?.length>0&&<div className="mt-5 rounded-2xl border border-border/60 bg-muted/20 p-4"><p className="flex items-center gap-2 text-xs font-semibold"><Paperclip className="size-4 text-secondary"/>{locale==="ar"?"المرفقات":locale==="fr"?"Pièces jointes":"Attachments"}</p><div className="mt-3 flex flex-wrap gap-2">{q.attachments.map(file=><button key={file.id} onClick={()=>openAttachment(file.storage_path)} className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2 text-xs transition hover:border-primary/30 hover:text-primary"><FileText className="size-4"/><span className="max-w-48 truncate">{file.file_name}</span><span className="text-[9px] text-muted-foreground">{(file.file_size/1024/1024).toFixed(1)}MB</span></button>)}</div></div>}

        {q.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {q.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-full">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-end"><button onClick={()=>user?setReportTarget({type:"question",id:q.id,label:q.title}):navigate({to:"/auth"})} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground transition hover:bg-destructive/8 hover:text-destructive"><Flag className="size-3.5"/>{locale==="ar"?"الإبلاغ عن السؤال":locale==="fr"?"Signaler la question":"Report question"}</button></div>

        {profile?.role === "expert" && expertAccess && (
          <section className={`mt-8 overflow-hidden rounded-3xl border shadow-soft ${
            myAnswerStatus
              ? "border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/20"
              : isEligibleExpert
                ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20"
                : "border-amber-200 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/20"
          }`}>
            <div className="flex items-start gap-4 p-5 sm:p-6">
              <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                myAnswerStatus ? "bg-blue-100 text-blue-700" : isEligibleExpert ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}>
                {myAnswerStatus ? <CheckCircle2 className="size-5" /> : isEligibleExpert ? <CheckCircle2 className="size-5" /> : <AlertTriangle className="size-5" />}
              </span>
              <div className="min-w-0 flex-1">
                {myAnswerStatus ? (
                  <>
                    <h2 className="font-semibold">
                      {locale === "ar" ? "لقد أرسلت إجابتك" : locale === "fr" ? "Vous avez déjà envoyé votre réponse" : "You already submitted your answer"}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {myAnswerStatus === "pending"
                        ? (locale === "ar" ? "الإجابة قيد مراجعة فريق الإشراف." : locale === "fr" ? "La réponse est en attente de modération." : "Your answer is awaiting moderation.")
                        : (locale === "ar" ? "حالة الإجابة: " : locale === "fr" ? "Statut de la réponse : " : "Answer status: ") + myAnswerStatus}
                    </p>
                  </>
                ) : expertAccess.status !== "approved" ? (
                  <>
                    <h2 className="font-semibold">{locale === "ar" ? "حساب الخبير غير مفعّل للإجابة" : locale === "fr" ? "Votre profil expert ne peut pas encore répondre" : "Your expert profile cannot answer yet"}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {locale === "ar" ? `حالة ملفك الحالية: ${expertAccess.status}` : locale === "fr" ? `Statut actuel : ${expertAccess.status}` : `Current status: ${expertAccess.status}`}
                    </p>
                  </>
                ) : isEligibleExpert ? (
                  <>
                    <h2 className="font-semibold">{site.tokenProgram.mode!=="full"?(locale==="ar"?"أنت خبير معتمد — ستُنشر إجابتك مباشرة":locale==="fr"?"Expert approuvé — votre réponse sera publiée immédiatement":"Approved expert — your answer will publish immediately"):(locale==="ar"?"أنت مؤهل للإجابة عن هذا السؤال":locale==="fr"?"Vous êtes autorisé à répondre":"You are eligible to answer")}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{site.tokenProgram.mode!=="full"?(locale==="ar"?"لا تحتاج إجابتك إلى مراجعة الإدارة. حافظ على الدقة والجودة المهنية.":"No admin review is required. Please maintain professional quality."):targetLabel?(locale==="ar"?`الفئة المطلوبة: ${targetLabel}`:`Requested group: ${targetLabel}`):(locale==="ar"?"هذا السؤال مفتوح لكل الخبراء المعتمدين.":"Open to all approved experts.")}</p>
                  </>
                ) : (
                  <>
                    <h2 className="font-semibold">{locale === "ar" ? "هذا السؤال موجّه إلى فئة مهنية أخرى" : locale === "fr" ? "Cette question est destinée à un autre groupe professionnel" : "This question targets another professional group"}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {locale === "ar" ? `المطلوب: ${targetLabel ?? q.target_audience_id}. الفئات المسندة إليك: ${assignedLabels.join("، ") || "لم تُسند لك فئة بعد"}.` : locale === "fr" ? `Demandé : ${targetLabel ?? q.target_audience_id}. Vos groupes : ${assignedLabels.join(", ") || "aucun groupe attribué"}.` : `Requested: ${targetLabel ?? q.target_audience_id}. Your groups: ${assignedLabels.join(", ") || "no group assigned"}.`}
                    </p>
                    <p className="mt-2 text-xs font-medium text-amber-800 dark:text-amber-300">
                      {locale === "ar" ? "يمكن للمشرف تعديل فئاتك من لوحة التحكم إذا كان التصنيف غير صحيح." : locale === "fr" ? "Un administrateur peut corriger vos groupes depuis le tableau de bord." : "An administrator can correct your groups from the dashboard."}
                    </p>
                  </>
                )}
              </div>
            </div>

            {isEligibleExpert && !myAnswerStatus && (
              <div className="border-t border-emerald-200/70 bg-background/70 p-5 sm:p-6">
                <label htmlFor="expert-answer" className="text-sm font-semibold">
                  {locale === "ar" ? "اكتب إجابتك المهنية" : locale === "fr" ? "Rédigez votre réponse professionnelle" : "Write your professional answer"}
                </label>
                <Textarea id="expert-answer" value={answerBody} onChange={(event) => setAnswerBody(event.target.value)}
                  maxLength={12000} className="mt-2 min-h-40 rounded-2xl bg-background" placeholder={locale === "ar" ? "قدّم جوابًا واضحًا ومفيدًا مع الخطوات والتفاصيل اللازمة…" : locale === "fr" ? "Donnez une réponse claire et utile…" : "Provide a clear, useful answer…"} />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">{answerBody.length} / 12000</span>
                  <Button onClick={submitAnswer} disabled={submittingAnswer || answerBody.trim().length < 20} className="rounded-xl">
                    {submittingAnswer ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    {site.tokenProgram.mode!=="full"?(locale==="ar"?"نشر الإجابة":"Publish answer"):(locale==="ar"?"إرسال الإجابة للمراجعة":locale==="fr"?"Envoyer pour validation":"Submit for review")}
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}

        {site.tokenProgram.mode!=="full"&&site.features["community_answers"]!==false&&profile?.role==="user"&&(
          <section className="mt-8 overflow-hidden rounded-3xl border border-secondary/25 bg-secondary/[.035] shadow-soft"><div className="flex items-start gap-4 p-5 sm:p-6"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary/10 text-secondary"><MessageSquare className="size-5"/></span><div className="min-w-0 flex-1"><h2 className="font-semibold">{locale==="ar"?"شارك معرفتك وأجب عن السؤال":locale==="fr"?"Partagez votre expérience":"Share your knowledge"}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{myAnswerStatus==="pending"?(locale==="ar"?"إجابتك قيد مراجعة الإدارة.":"Your answer is awaiting admin review."):myAnswerStatus==="approved"?(locale==="ar"?"تم نشر إجابتك.":"Your answer is published."):(locale==="ar"?"يمكن لأي عضو تقديم إجابة مفيدة. ستظهر إجابتك بعد موافقة الإدارة.":"Any member can contribute. Your answer will appear after admin approval.")}</p></div></div>{!myAnswerStatus&&<div className="border-t border-border/60 bg-background/70 p-5 sm:p-6"><Textarea value={answerBody} onChange={e=>setAnswerBody(e.target.value)} maxLength={12000} className="min-h-40 rounded-2xl" placeholder={locale==="ar"?"اكتب إجابة واضحة ومفيدة…":"Write a clear and useful answer…"}/><div className="mt-3 flex items-center justify-between"><span className="text-xs text-muted-foreground">{answerBody.length} / 12000</span><Button onClick={submitAnswer} disabled={submittingAnswer||answerBody.trim().length<20} className="rounded-xl">{submittingAnswer?<Loader2 className="size-4 animate-spin"/>:<Send className="size-4"/>}{locale==="ar"?"إرسال للمراجعة":"Submit for review"}</Button></div></div>}</section>
        )}
        {site.tokenProgram.mode!=="full"&&site.features["community_answers"]!==false&&!user&&<div className="mt-8 rounded-2xl border border-dashed border-secondary/30 bg-secondary/[.025] p-5 text-center"><p className="font-semibold">{locale==="ar"?"لديك إجابة مفيدة؟":"Have a helpful answer?"}</p><p className="mt-1 text-xs text-muted-foreground">{locale==="ar"?"سجّل الدخول وشارك معرفتك مع المجتمع.":"Sign in and share your knowledge with the community."}</p><Button asChild size="sm" className="mt-3 rounded-xl"><Link to="/auth">{t("nav.signIn")}</Link></Button></div>}

        <h2 className="mt-12 flex items-center gap-2 text-xl font-semibold">
          <MessageSquare className="size-5 text-secondary" />
          {copy.answers.replace(
            "{{count}}",
            formatNumber(q.answers.length, locale),
          )}
        </h2>

        {q.answers.length === 0 && (
          <div className="premium-card mt-5 p-8 text-center text-sm text-muted-foreground">
            {t("question.noAnswers", "لا توجد إجابات معتمدة بعد — سيجيب الخبراء قريبًا")}
          </div>
        )}

        {q.answers.map((a) => (
          <section
            key={a.id}
            className={`premium-card relative mt-5 overflow-hidden p-5 sm:p-7 ${
              a.is_best ? "border-accent/60" : ""
            }`}
          >
            {a.is_best && (
              <Badge className="absolute -top-0 start-5 rounded-b-xl rounded-t-none bg-accent text-accent-foreground">
                <Star className="size-3" /> {t("question.bestAnswer", "أفضل إجابة")}
              </Badge>
            )}
            <div className="mt-2 flex items-center gap-3">
              <span className="bg-brand grid size-12 place-items-center rounded-2xl font-semibold text-primary-foreground">
                {a.expert_name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold">
                  <span className="truncate">{a.expert_name}</span>
                  {a.expert_verified ? (
                    <BadgeCheck className="size-4 text-secondary" />
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {a.expert_title}
                  {a.expert_rating ? (
                    <>
                      {" "}
                      · {a.expert_rating}{" "}
                      <Star className="inline size-3 fill-accent text-accent" />
                    </>
                  ) : null}
                </p>
              </div>
            </div>

            <div className="relative mt-6">
              {a.body ? (
                /* Free / unlocked → full answer */
                <p className="whitespace-pre-line text-sm leading-7">{a.body}</p>
              ) : (
                /* Locked → preview + paywall */
                <>
                  <p className="whitespace-pre-line text-sm leading-7">
                    {a.preview}
                  </p>
                  <p
                    aria-hidden
                    className="mt-3 select-none text-sm leading-7 blur-[6px]"
                  >
                    {copy.lockedSample}
                  </p>
                  <div className="absolute inset-x-0 bottom-0 top-10 flex items-end rounded-2xl bg-gradient-to-t from-card via-card/90 to-transparent">
                    <div className="glass w-full rounded-2xl p-5 text-center shadow-lift sm:p-6">
                      <Lock className="mx-auto size-5 text-accent" />
                      <p className="mt-3 font-semibold">
                        {copy.unlockTitle.replace("{{count}}", String(effectiveUnlockCost))}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {copy.unlockText}
                      </p>
                      {user && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {t("question.yourBalance", "رصيدك")}:{" "}
                          <b className="text-foreground">
                            {profile?.tokens_balance ?? 0}
                          </b>{" "}
                          {t("common.tokens")}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <Button
                          className="rounded-xl"
                          disabled={unlocking}
                          onClick={unlock}
                        >
                          {unlocking ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <>
                              <Coins className="size-4" /> {copy.unlock}
                            </>
                          )}
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="rounded-xl bg-background"
                        >
                          <Link to="/tokens">{copy.buy}</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-border/50 pt-4">
              {q.is_owner&&!q.answers.some(answer=>answer.is_best)&&<Button size="sm" className="rounded-xl bg-amber-500 text-white hover:bg-amber-600" disabled={selectingBestId!==null} onClick={()=>selectBestAnswer(a.id)}>{selectingBestId===a.id?<Loader2 className="size-3.5 animate-spin"/>:<Star className="size-3.5 fill-current"/>}{locale==="ar"?"اختيار كأفضل إجابة":locale==="fr"?"Choisir comme meilleure":"Select as best answer"}</Button>}
              {a.body&&user&&<Button size="sm" variant="outline" className="rounded-xl" onClick={()=>{setReviewAnswer({id:a.id,name:a.expert_name});setReviewRating(5);setReviewComment("")}}><Star className="size-3.5 text-accent"/>{locale==="ar"?"قيّم الإجابة":locale==="fr"?"Évaluer":"Review answer"}</Button>}
              <button onClick={()=>user?setReportTarget({type:"answer",id:a.id,label:`${a.expert_name}` }):navigate({to:"/auth"})} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground transition hover:bg-destructive/8 hover:text-destructive"><Flag className="size-3.5"/>{locale==="ar"?"الإبلاغ":locale==="fr"?"Signaler":"Report"}</button>
            </div>
          </section>
        ))}
        {reportTarget&&<div className="fixed inset-0 z-[80] grid place-items-center bg-foreground/25 p-4 backdrop-blur-sm" onMouseDown={e=>e.target===e.currentTarget&&setReportTarget(null)}><div className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold">{locale==="ar"?"إرسال بلاغ":locale==="fr"?"Envoyer un signalement":"Submit a report"}</h2><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{reportTarget.label}</p></div><button onClick={()=>setReportTarget(null)} className="rounded-lg bg-muted p-2">×</button></div><div className="mt-5 grid grid-cols-2 gap-2">{[{id:"spam",ar:"إعلان أو إزعاج",en:"Spam"},{id:"harassment",ar:"إساءة أو مضايقة",en:"Harassment"},{id:"misinformation",ar:"معلومات خطرة",en:"Misinformation"},{id:"privacy",ar:"بيانات شخصية",en:"Privacy"},{id:"impersonation",ar:"انتحال صفة",en:"Impersonation"},{id:"illegal",ar:"محتوى غير قانوني",en:"Illegal content"},{id:"off_topic",ar:"خارج الموضوع",en:"Off topic"},{id:"other",ar:"سبب آخر",en:"Other"}].map(item=><button key={item.id} onClick={()=>setReportCategory(item.id)} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${reportCategory===item.id?"border-destructive bg-destructive/8 text-destructive":"border-border text-muted-foreground"}`}>{locale==="ar"?item.ar:item.en}</button>)}</div><Textarea value={reportDetails} onChange={e=>setReportDetails(e.target.value)} maxLength={2000} className="mt-4 min-h-28 rounded-xl" placeholder={locale==="ar"?"اشرح المشكلة باختصار…":"Briefly explain the problem…"}/><div className="mt-4 flex justify-end gap-2"><Button variant="outline" className="rounded-xl" onClick={()=>setReportTarget(null)}>{locale==="ar"?"إلغاء":"Cancel"}</Button><Button variant="destructive" className="rounded-xl" disabled={reportBusy} onClick={submitReport}>{reportBusy?<Loader2 className="size-4 animate-spin"/>:<Flag className="size-4"/>}{locale==="ar"?"إرسال البلاغ":"Submit"}</Button></div></div></div>}
        {reviewAnswer&&<div className="fixed inset-0 z-[80] grid place-items-center bg-foreground/25 p-4 backdrop-blur-sm" onMouseDown={e=>e.target===e.currentTarget&&setReviewAnswer(null)}><div className="w-full max-w-md rounded-3xl border border-border bg-background p-6 text-center shadow-2xl"><h2 className="text-xl font-semibold">{locale==="ar"?"تقييم الإجابة":locale==="fr"?"Évaluer la réponse":"Review this answer"}</h2><p className="mt-1 text-xs text-muted-foreground">{reviewAnswer.name}</p><div className="mt-5 flex justify-center gap-2" dir="ltr">{[1,2,3,4,5].map(value=><button key={value} onClick={()=>setReviewRating(value)} className="p-1 transition hover:scale-110"><Star className={`size-8 ${value<=reviewRating?"fill-amber-400 text-amber-400":"text-muted"}`}/></button>)}</div><p dir="ltr" className="mt-2 text-sm font-semibold">{reviewRating} / 5</p><Textarea value={reviewComment} onChange={e=>setReviewComment(e.target.value)} maxLength={2000} className="mt-4 min-h-28 rounded-xl text-start" placeholder={locale==="ar"?"ما الذي كان مفيدًا في الإجابة؟ (اختياري)":"What was helpful? (optional)"}/><div className="mt-4 flex justify-center gap-2"><Button variant="outline" className="rounded-xl" onClick={()=>setReviewAnswer(null)}>{locale==="ar"?"إلغاء":"Cancel"}</Button><Button className="rounded-xl" disabled={reviewBusy} onClick={submitReview}>{reviewBusy?<Loader2 className="size-4 animate-spin"/>:<Star className="size-4"/>}{locale==="ar"?"حفظ التقييم":"Save review"}</Button></div></div></div>}
      </article>
    </SiteLayout>
  );
}
