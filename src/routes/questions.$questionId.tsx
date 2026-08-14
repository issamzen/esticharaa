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
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "@/components/site/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuestionCard } from "@/components/site/question-card";
import { ExpertCard } from "@/components/site/expert-card";
import { questions, experts } from "@/data/platform";
import { usePageCopy } from "@/i18n/page-copy";
import { formatDate, formatNumber } from "@/i18n/format";
import { localizeExpert, localizeQuestion } from "@/i18n/platform";
import { useLocale } from "@/i18n/use-locale";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

function decodeQuestionRef(value:string){try{return decodeURIComponent(value)}catch{return value}}

export const Route = createFileRoute("/questions/$questionId")({
  loader: async ({ params, context }) => {
    const questionRef=decodeQuestionRef(params.questionId);
    const base=questions.find(item=>item.id===questionRef);
    const question=base?localizeQuestion(base,context.localeRouting.getLocale()):null;
    let seoQuestion:null|{title:string;description:string;slug:string}=null;
    if(!question){try{const{data}=await supabase.rpc("get_question_seo_by_ref",{p_question_ref:questionRef});const seo=data as {title?:string;description?:string;slug?:string}|null;if(seo?.title)seoQuestion={title:seo.title,description:seo.description??"",slug:seo.slug??questionRef}}catch{seoQuestion=null}}
    return{question,seoQuestion,questionId:questionRef};
  },
  head:({loaderData})=>{const item=loaderData?.question??loaderData?.seoQuestion;return{meta:item?[{title:`${item.title} — Estichara.ma`},{name:"description",content:("body" in item?item.body:item.description).slice(0,155)},{property:"og:title",content:`${item.title} — Estichara.ma`},{property:"og:description",content:("body" in item?item.body:item.description).slice(0,155)}]:[{title:"Estichara.ma"}]}},
  component: QuestionDetail,
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
  target_audience_id: string | null;
  views: number;
  tags: string[];
  created_at: string;
  category_name: string | null;
  asker_name: string | null;
  unlocked: boolean;
  answers: DbAnswer[];
};

function QuestionDetail() {
  const { question: demoQuestion, questionId } = Route.useLoaderData();
  if (demoQuestion) return <DemoQuestionDetail />;
  return <DbQuestionDetail questionId={questionId} />;
}

// ============================================================
// REAL QUESTIONS (from your Supabase database)
// ============================================================
function DbQuestionDetail({ questionId }: { questionId: string }) {
  const copy = usePageCopy().question;
  const { t } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
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

    if (!user || profile?.role !== "expert") {
      setExpertAccess(null);
      setMyAnswerStatus(null);
      return;
    }
    supabase.from("expert_profiles").select("status, audience_ids").eq("user_id", user.id).single()
      .then(({ data }) => setExpertAccess(data as ExpertAccess | null));
    if(q?.id) supabase.from("answers").select("status").eq("question_id",q.id).eq("expert_id",user.id).maybeSingle()
      .then(({ data })=>setMyAnswerStatus(data?.status??null));
  }, [questionId,user,profile?.role,q?.id]);

  async function submitAnswer() {
    const clean = answerBody.trim();
    if (clean.length < 20) {
      toast.error(locale === "ar" ? "يجب أن تتكون الإجابة من 20 حرفًا على الأقل" : locale === "fr" ? "La réponse doit contenir au moins 20 caractères." : "Your answer must be at least 20 characters.");
      return;
    }
    setSubmittingAnswer(true);
    const { error } = await supabase.from("answers").insert({
      question_id: q!.id,
      expert_id: user!.id,
      body: clean,
      preview: clean.slice(0, 220),
      status: "pending",
    });
    setSubmittingAnswer(false);
    if (error) {
      toast.error(locale === "ar" ? "لا يمكنك الإجابة عن هذا السؤال. تحقق من الفئة المهنية المطلوبة." : locale === "fr" ? "Vous ne pouvez pas répondre à cette question. Vérifiez le groupe professionnel demandé." : "You cannot answer this question. Check its required professional group.");
      return;
    }
    setAnswerBody("");
    setMyAnswerStatus("pending");
    toast.success(locale === "ar" ? "تم إرسال إجابتك للمراجعة" : locale === "fr" ? "Votre réponse a été envoyée pour validation." : "Your answer was submitted for review.");
  }

  async function submitReport(){if(!reportTarget||!user){navigate({to:"/auth"});return}if(reportDetails.trim().length<5){toast.error(locale==="ar"?"أضف تفاصيل قصيرة عن سبب البلاغ":"Please add a short explanation");return}setReportBusy(true);const{error}=await supabase.rpc("create_content_report",{p_target_type:reportTarget.type,p_target_id:reportTarget.id,p_category:reportCategory,p_details:reportDetails.trim()});setReportBusy(false);if(error){toast.error(error.message.includes("REPORT_ALREADY_OPEN")?(locale==="ar"?"لديك بلاغ مفتوح بالفعل حول هذا المحتوى":"You already have an open report for this content"):error.message);return}setReportTarget(null);setReportDetails("");toast.success(locale==="ar"?"تم إرسال البلاغ إلى فريق المراجعة":"Report sent to moderation")}
  async function submitReview(){if(!reviewAnswer||!user)return;if(reviewComment.trim().length>0&&reviewComment.trim().length<5){toast.error(locale==="ar"?"اكتب تعليقًا أوضح أو اتركه فارغًا":"Write a clearer comment or leave it empty");return}setReviewBusy(true);const{error}=await supabase.rpc("submit_expert_review",{p_answer_id:reviewAnswer.id,p_rating:reviewRating,p_comment:reviewComment.trim()});setReviewBusy(false);if(error){toast.error(error.message.includes("UNLOCK_REQUIRED")?(locale==="ar"?"يجب فتح الإجابة قبل تقييمها":"Unlock the answer before reviewing it"):error.message);return}setReviewAnswer(null);setReviewComment("");toast.success(locale==="ar"?"شكرًا، تم حفظ تقييمك":"Thank you, your review was saved")}

  async function unlock() {
    if (!user) {
      toast.info(t("auth.signInDescription"));
      navigate({ to: "/auth" });
      return;
    }
    if ((profile?.tokens_balance ?? 0) < (q?.unlock_cost ?? 0)) {
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

  const targetAudience = audiences.find((item) => item.id === q.target_audience_id);
  const targetLabel = targetAudience
    ? locale === "fr" ? targetAudience.label_fr : locale === "en" ? targetAudience.label_en : targetAudience.label_ar
    : null;
  const assignedLabels = audiences
    .filter((item) => expertAccess?.audience_ids?.includes(item.id))
    .map((item) => locale === "fr" ? item.label_fr : locale === "en" ? item.label_en : item.label_ar);
  const isEligibleExpert = expertAccess?.status === "approved"
    && (!q.target_audience_id || expertAccess.audience_ids?.includes(q.target_audience_id));

  return (
    <SiteLayout>
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-wrap items-center gap-2">
          {q.category_name ? (
            <Badge variant="secondary" className="rounded-full">
              {q.category_name}
            </Badge>
          ) : null}
          <Badge variant="outline" className="rounded-full border-secondary/40 bg-secondary/5">
            <Users className="size-3" />
            {targetLabel ?? (locale === "ar" ? "كل الخبراء المؤهلين" : locale === "fr" ? "Tous les experts qualifiés" : "All qualified experts")}
          </Badge>
          <Badge
            variant={q.unlock_cost > 0 ? "default" : "outline"}
            className={
              q.unlock_cost > 0
                ? "rounded-full bg-accent text-accent-foreground"
                : "rounded-full"
            }
          >
            {q.unlock_cost > 0 ? (
              <>
                <Lock className="size-3" /> {q.unlock_cost} {t("common.tokens")}
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
        <p className="mt-5 whitespace-pre-line text-base leading-8 text-muted-foreground">
          {q.body}
        </p>
        {q.question_locked && (
          <div className="mt-5 rounded-2xl border border-accent/30 bg-accent/5 p-5 text-center">
            <Lock className="mx-auto size-5 text-accent" />
            <p className="mt-2 font-semibold">{t("question.signInForFullQuestion", "سجّل الدخول لقراءة السؤال كاملًا")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("question.guestPreviewOnly", "يظهر للزوار مقتطف فقط، بما في ذلك الأسئلة المجانية.")}</p>
            <Button asChild className="mt-3 rounded-xl"><Link to="/auth">{t("nav.signIn")}</Link></Button>
          </div>
        )}

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
                    <h2 className="font-semibold">{locale === "ar" ? "أنت مؤهل للإجابة عن هذا السؤال" : locale === "fr" ? "Vous êtes autorisé à répondre à cette question" : "You are eligible to answer this question"}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {targetLabel
                        ? (locale === "ar" ? `الفئة المطلوبة: ${targetLabel}` : locale === "fr" ? `Groupe demandé : ${targetLabel}` : `Requested group: ${targetLabel}`)
                        : (locale === "ar" ? "هذا السؤال مفتوح لكل الخبراء المعتمدين." : locale === "fr" ? "Cette question est ouverte à tous les experts approuvés." : "This question is open to all approved experts.")}
                    </p>
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
                    {locale === "ar" ? "إرسال الإجابة للمراجعة" : locale === "fr" ? "Envoyer pour validation" : "Submit for review"}
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}

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
                        {copy.unlockTitle.replace("{{count}}", String(q.unlock_cost))}
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
              {a.body&&user&&<Button size="sm" variant="outline" className="rounded-xl" onClick={()=>{setReviewAnswer({id:a.id,name:a.expert_name});setReviewRating(5);setReviewComment("")}}><Star className="size-3.5 text-accent"/>{locale==="ar"?"قيّم الإجابة":locale==="fr"?"Évaluer":"Review answer"}</Button>}
              <button onClick={()=>user?setReportTarget({type:"answer",id:a.id,label:`${a.expert_name}` }):navigate({to:"/auth"})} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground transition hover:bg-destructive/8 hover:text-destructive"><Flag className="size-3.5"/>{locale==="ar"?"الإبلاغ":locale==="fr"?"Signaler":"Report"}</button>
            </div>
          </section>
        ))}
        {reportTarget&&<div className="fixed inset-0 z-[80] grid place-items-center bg-foreground/25 p-4 backdrop-blur-sm" onMouseDown={e=>e.target===e.currentTarget&&setReportTarget(null)}><div className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold">{locale==="ar"?"إرسال بلاغ":locale==="fr"?"Envoyer un signalement":"Submit a report"}</h2><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{reportTarget.label}</p></div><button onClick={()=>setReportTarget(null)} className="rounded-lg bg-muted p-2">×</button></div><div className="mt-5 grid grid-cols-2 gap-2">{[{id:"spam",ar:"إعلان أو إزعاج",en:"Spam"},{id:"harassment",ar:"إساءة أو مضايقة",en:"Harassment"},{id:"misinformation",ar:"معلومات خطرة",en:"Misinformation"},{id:"privacy",ar:"بيانات شخصية",en:"Privacy"},{id:"impersonation",ar:"انتحال صفة",en:"Impersonation"},{id:"illegal",ar:"محتوى غير قانوني",en:"Illegal content"},{id:"off_topic",ar:"خارج الموضوع",en:"Off topic"},{id:"other",ar:"سبب آخر",en:"Other"}].map(item=><button key={item.id} onClick={()=>setReportCategory(item.id)} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${reportCategory===item.id?"border-destructive bg-destructive/8 text-destructive":"border-border text-muted-foreground"}`}>{locale==="ar"?item.ar:item.en}</button>)}</div><Textarea value={reportDetails} onChange={e=>setReportDetails(e.target.value)} maxLength={2000} className="mt-4 min-h-28 rounded-xl" placeholder={locale==="ar"?"اشرح المشكلة باختصار…":"Briefly explain the problem…"}/><div className="mt-4 flex justify-end gap-2"><Button variant="outline" className="rounded-xl" onClick={()=>setReportTarget(null)}>{locale==="ar"?"إلغاء":"Cancel"}</Button><Button variant="destructive" className="rounded-xl" disabled={reportBusy} onClick={submitReport}>{reportBusy?<Loader2 className="size-4 animate-spin"/>:<Flag className="size-4"/>}{locale==="ar"?"إرسال البلاغ":"Submit"}</Button></div></div></div>}
        {reviewAnswer&&<div className="fixed inset-0 z-[80] grid place-items-center bg-foreground/25 p-4 backdrop-blur-sm" onMouseDown={e=>e.target===e.currentTarget&&setReviewAnswer(null)}><div className="w-full max-w-md rounded-3xl border border-border bg-background p-6 text-center shadow-2xl"><h2 className="text-xl font-semibold">{locale==="ar"?"تقييم الإجابة":locale==="fr"?"Évaluer la réponse":"Review this answer"}</h2><p className="mt-1 text-xs text-muted-foreground">{reviewAnswer.name}</p><div className="mt-5 flex justify-center gap-2" dir="ltr">{[1,2,3,4,5].map(value=><button key={value} onClick={()=>setReviewRating(value)} className="p-1 transition hover:scale-110"><Star className={`size-8 ${value<=reviewRating?"fill-amber-400 text-amber-400":"text-muted"}`}/></button>)}</div><p className="mt-2 text-sm font-semibold">{reviewRating} / 5</p><Textarea value={reviewComment} onChange={e=>setReviewComment(e.target.value)} maxLength={2000} className="mt-4 min-h-28 rounded-xl text-start" placeholder={locale==="ar"?"ما الذي كان مفيدًا في الإجابة؟ (اختياري)":"What was helpful? (optional)"}/><div className="mt-4 flex justify-center gap-2"><Button variant="outline" className="rounded-xl" onClick={()=>setReviewAnswer(null)}>{locale==="ar"?"إلغاء":"Cancel"}</Button><Button className="rounded-xl" disabled={reviewBusy} onClick={submitReview}>{reviewBusy?<Loader2 className="size-4 animate-spin"/>:<Star className="size-4"/>}{locale==="ar"?"حفظ التقييم":"Save review"}</Button></div></div></div>}
      </article>
    </SiteLayout>
  );
}

// ============================================================
// DEMO QUESTIONS (original page, kept for the sample content)
// ============================================================
function DemoQuestionDetail() {
  const { question } = Route.useLoaderData() as {
    question: NonNullable<ReturnType<typeof localizeDemo>>;
  };
  const copy = usePageCopy().question;
  const locale = useLocale();
  const { user } = useAuth();
  const expert = localizeExpert(experts[0]!, locale);
  const related = questions
    .filter((item) => item.id !== question.id)
    .slice(0, 2);

  return (
    <SiteLayout>
      <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:grid lg:grid-cols-[1fr_330px] lg:gap-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              {question.category}
            </Badge>
            <Badge variant="outline" className="rounded-full border-amber-400 text-amber-700">
              مثال تجريبي
            </Badge>
            <time
              className="text-xs text-muted-foreground"
              dateTime={question.createdAt}
            >
              {formatDate(question.createdAt, locale)}
            </time>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="size-3.5" /> {formatNumber(question.views, locale)}
            </span>
          </div>

          <h1 className="mt-5 text-balance text-3xl font-semibold leading-tight sm:text-5xl">
            {question.title}
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            {user ? question.body : `${question.body.slice(0, 180)}${question.body.length > 180 ? "…" : ""}`}
          </p>
          {!user && (
            <div className="mt-5 rounded-2xl border border-accent/30 bg-accent/5 p-5 text-center">
              <Lock className="mx-auto size-5 text-accent" />
              <p className="mt-2 font-semibold">سجّل الدخول لقراءة السؤال كاملًا</p>
              <Button asChild className="mt-3 rounded-xl"><Link to="/auth">تسجيل الدخول</Link></Button>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-full">
                #{tag}
              </Badge>
            ))}
          </div>

          <h2 className="mt-12 flex items-center gap-2 text-xl font-semibold">
            <MessageSquare className="size-5 text-secondary" />
            {copy.answers.replace(
              "{{count}}",
              formatNumber(question.answers, locale),
            )}
          </h2>

          <section className="premium-card relative mt-5 overflow-hidden p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="bg-brand grid size-12 place-items-center rounded-2xl font-semibold text-primary-foreground">
                {expert.initials}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold">
                  <span className="truncate">{expert.name}</span>
                  {expert.verified ? (
                    <BadgeCheck className="size-4 text-secondary" />
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {expert.title} · {expert.rating}{" "}
                  <Star className="inline size-3 fill-accent text-accent" /> (
                  {copy.reviews.replace(
                    "{{count}}",
                    formatNumber(expert.reviews, locale),
                  )}
                  )
                </p>
              </div>
            </div>

            <div className="relative mt-6">
              <p className="whitespace-pre-line text-sm leading-7">
                {question.preview}
              </p>
              <>
                <p
                  aria-hidden
                  className="mt-3 select-none text-sm leading-7 blur-[6px]"
                >
                  {copy.lockedSample}
                </p>
                <div className="absolute inset-x-0 bottom-0 top-14 flex items-end rounded-2xl bg-gradient-to-t from-card via-card/90 to-transparent">
                  <div className="glass w-full rounded-2xl p-5 text-center shadow-lift sm:p-6">
                    <Lock className="mx-auto size-5 text-accent" />
                    <p className="mt-3 font-semibold">سؤال توضيحي — غير متاح للشراء</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      هذا محتوى تجريبي ثابت وليس سؤالًا من قاعدة البيانات، لذلك لن يتم خصم أي توكن.
                    </p>
                    <Button asChild className="mt-4 rounded-xl">
                      <Link to="/questions">تصفح الأسئلة الحقيقية</Link>
                    </Button>
                  </div>
                </div>
              </>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-border/60 pt-5 text-xs text-muted-foreground sm:grid-cols-4">
              {[
                [copy.knowledge, "5.0"],
                [copy.clarity, "4.9"],
                [copy.helpfulness, "4.8"],
                [copy.speed, "5.0"],
              ].map(([label, value]) => (
                <span
                  key={label}
                  className="rounded-xl bg-muted/45 px-3 py-2 text-center"
                >
                  {label} <strong className="text-foreground">{value}</strong>
                </span>
              ))}
            </div>
          </section>

          <h2 className="mt-12 text-2xl font-semibold">{copy.related}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {related.map((item) => (
              <QuestionCard key={item.id} question={item} />
            ))}
          </div>
        </div>

        <aside className="mt-12 space-y-5 lg:mt-0">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {copy.recommended}
          </h2>
          {experts.slice(1, 3).map((item) => (
            <ExpertCard key={item.slug} expert={item} />
          ))}
        </aside>
      </article>
    </SiteLayout>
  );
}

function localizeDemo() {
  return questions[0] ? localizeQuestion(questions[0], "ar") : null;
}
