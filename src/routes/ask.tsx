import { useEffect, useState, type ChangeEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, EyeOff, Loader2, Mail, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription } from "@/components/ui/dialog";
import { QuestionComposer,RichTextContent } from "@/components/site/question-composer";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/data/platform";
import { usePageCopy } from "@/i18n/page-copy";
import { createPageSeo, pageHead } from "@/i18n/route-meta";
import { localizeCategory } from "@/i18n/platform";
import { useLocale } from "@/i18n/use-locale";
import { useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/ask")({
  loader: ({ context }) => ({
    seo: createPageSeo(context.localeRouting.getLocale(), "ask"),
  }),
  head: ({ loaderData }) => pageHead(loaderData?.seo),
  component: AskPage,
});

const rewards = [0, 5, 10, 20] as const;

type Audience = { id: string; label_ar: string; label_fr: string; label_en: string; active: boolean };
type AskRules = {
  allow_free_questions: boolean;
  targeting_enabled: boolean;
  targeting_requires_paid_question: boolean;
  audience_min_token_balance: number;
};
const DEFAULT_ASK_RULES: AskRules = {
  allow_free_questions: true,
  targeting_enabled: true,
  targeting_requires_paid_question: true,
  audience_min_token_balance: 1,
};

function AskPage() {
  const copy = usePageCopy().ask;
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const locale = useLocale();
  const site = useSiteSettings();
  const localizedCategories = categories.map((item) =>
    localizeCategory(item, locale),
  );
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [reward, setReward] = useState<number>(0);
  const [targetAudience, setTargetAudience] = useState("all");
  const [anonymous,setAnonymous]=useState(false);
  const [notifyByEmail,setNotifyByEmail]=useState(true);
  const [files,setFiles]=useState<File[]>([]);
  const [previewOpen,setPreviewOpen]=useState(false);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [askRules, setAskRules] = useState<AskRules>(DEFAULT_ASK_RULES);
  const [submitting, setSubmitting] = useState(false);
  const [dbCategories, setDbCategories] = useState<
    { id: string; slug: string; name_ar: string; name_fr: string; name_en: string; min_reward_tokens: number }[]
  >([]);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, slug, name_ar, name_fr, name_en, min_reward_tokens")
      .eq("active", true)
      .order("sort")
      .then(({ data }) => setDbCategories(data ?? []));
    supabase
      .from("settings")
      .select("key, value")
      .in("key", ["content_access_rules", "expert_audiences"])
      .then(({ data }) => {
        for (const row of data ?? []) {
          if (row.key === "content_access_rules")
            setAskRules({ ...DEFAULT_ASK_RULES, ...(row.value as Partial<AskRules>) });
          if (row.key === "expert_audiences")
            setAudiences(((row.value as Audience[]) ?? []).filter((item) => item.active));
        }
      });
  }, []);

  // Not logged in → go to register/login first
  useEffect(() => {
    if (!loading && !user) {
      toast.info(t("auth.signInDescription"));
      navigate({ to: "/auth" });
    }
  }, [loading, user, navigate, t]);

  if (loading || !user) {
    return (
      <SiteLayout>
        <div className="grid min-h-[50vh] place-items-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </SiteLayout>
    );
  }

  if (site.loaded && site.features.new_questions === false) {
    return <SiteLayout><div className="mx-auto max-w-xl px-4 py-32 text-center"><ShieldCheck className="mx-auto size-12 text-primary"/><h1 className="mt-5 text-3xl font-semibold">طرح الأسئلة متوقف مؤقتًا</h1><p className="mt-3 text-muted-foreground">فعّلت الإدارة إيقاف الأسئلة الجديدة. يمكنك متابعة أسئلتك الحالية من حسابك.</p><Button className="mt-6 rounded-xl" onClick={()=>navigate({to:"/account"})}>العودة إلى حسابي</Button></div></SiteLayout>;
  }

  function rewardLabel(value: number) {
    if (value === 0) return copy.free;
    return `${value} ${t("common.tokens")}`;
  }

  const categoryMinimum=site.tokenProgram.mode==="full"?(dbCategories.find(item=>item.slug===category)?.min_reward_tokens??0):0;
  const targetingAvailable = site.tokenProgram.mode==="full"&&askRules.targeting_enabled
    && site.features.expert_targeting !== false
    && (profile?.tokens_balance ?? 0) >= askRules.audience_min_token_balance
    && (!askRules.targeting_requires_paid_question || reward > 0);

  function openPreview(){if(title.trim().length<15){toast.error(copy.validationTitle);return}if(body.trim().length<30){toast.error(copy.validationBody);return}if(!category){toast.error(copy.validationCategory);return}setPreviewOpen(true)}

  async function submit() {
    const schema = z.object({
      title: z.string().trim().min(15, copy.validationTitle).max(160),
      body: z.string().trim().min(30, copy.validationBody).max(4000),
      category: z.string().min(1, copy.validationCategory),
    });
    const result = schema.safeParse({ title, body, category });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? copy.validationGeneric);
      return;
    }
    if (reward < categoryMinimum) { toast.error(`الحد الأدنى لهذا التصنيف هو ${categoryMinimum} توكن`); return; }
    setSubmitting(true);

    // Find the category's database id from its slug
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", result.data.category)
      .maybeSingle();

    const rewardTokens = reward > 0 ? reward : 0;
    if (rewardTokens === 0 && !askRules.allow_free_questions) {
      setSubmitting(false);
      toast.error(t("ask.freeDisabled", "الأسئلة المجانية متوقفة حاليًا"));
      return;
    }
    const canTarget = site.tokenProgram.mode==="full"&&askRules.targeting_enabled
      && (profile?.tokens_balance ?? 0) >= askRules.audience_min_token_balance
      && (!askRules.targeting_requires_paid_question || rewardTokens > 0);
    // The database repeats every check and deducts the reward atomically.
    const{data:createdId,error}=await supabase.rpc("create_question_composer",{p_title:result.data.title,p_body:result.data.body,p_category_id:cat?.id??null,p_tokens:rewardTokens,p_target_audience_id:canTarget&&targetAudience!=="all"?targetAudience:null,p_is_anonymous:anonymous,p_notify_by_email:notifyByEmail});
    setSubmitting(false);
    if (error) {
      if (error.message.includes("INSUFFICIENT_TOKENS") || error.message.includes("TARGETING_REQUIRES_TOKENS")) {
        toast.error(
          t("ask.insufficient", "رصيدك غير كافٍ — اشترِ توكن أولًا"),
        );
        navigate({ to: "/tokens" });
        return;
      }
      if (error.message.includes("TARGETING_REQUIRES_PAID_QUESTION")) {
        toast.error(t("ask.targetPaidOnly", "اختر مكافأة توكن لتوجيه السؤال إلى فئة مهنية محددة"));
        return;
      }
      toast.error(error.message);
      return;
    }
    if(createdId&&files.length){let failed=0;for(const file of files){const safe=file.name.replace(/[^a-zA-Z0-9._-]+/g,"-");const path=`${user.id}/${createdId}/${crypto.randomUUID()}-${safe}`;const{error:uploadError}=await supabase.storage.from("question-attachments").upload(path,file);if(uploadError){failed++;continue}const{error:rowError}=await supabase.from("question_attachments").insert({question_id:createdId,user_id:user.id,file_name:file.name,storage_path:path,mime_type:file.type,file_size:file.size});if(rowError)failed++}if(failed)toast.warning(`${failed} attachment(s) could not be uploaded.`)}
    setPreviewOpen(false);setFiles([]);
    await refreshProfile();
    toast.success(
      t("ask.savedTitle", "تم إرسال سؤالك بنجاح! ✅"),
      {
        description:
          rewardTokens > 0
            ? t(
                "ask.savedPaidDescription",
                `خُصمت ${rewardTokens} توكن كمكافأة للخبراء. سيراجع فريقنا سؤالك وينشره قريبًا.`,
              )
            : t(
                "ask.savedDescription",
                "سيراجعه فريقنا وينشره قريبًا — تابع حالته من حسابك.",
              ),
        duration: 7000,
      },
    );
    navigate({ to: "/account" });
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <section className="mx-auto grid max-w-6xl gap-7 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_280px] lg:py-16">
        <div className="premium-card p-5 sm:p-8">
          <div className="space-y-7">
            <div>
              <Label htmlFor="title">{copy.titleLabel}</Label>
              <Input
                id="title"
                value={title}
                maxLength={160}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setTitle(event.target.value)
                }
                placeholder={copy.titlePlaceholder}
                className="mt-2 h-12 rounded-xl"
              />
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-secondary">
                <Wand2 className="size-3.5" /> {copy.suggestion}
              </p>
            </div>

            <div>
              <Label htmlFor="body">{copy.detailsLabel}</Label>
              <div className="mt-2"><QuestionComposer value={body} onChange={setBody} placeholder={copy.detailsPlaceholder} files={files} onFiles={setFiles} maxLength={4000}/></div>
            </div>

            <div className="max-w-xl">
              <div>
                <Label>{copy.category}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2 h-11 w-full rounded-xl">
                    <SelectValue placeholder={copy.selectCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    {dbCategories.length > 0
                      ? dbCategories.map((item) => (
                          <SelectItem key={item.slug} value={item.slug}>
                            {locale === "fr" && item.name_fr
                              ? item.name_fr
                              : locale === "en" && item.name_en
                                ? item.name_en
                                : item.name_ar}
                          </SelectItem>
                        ))
                      : localizedCategories.map((item) => (
                          <SelectItem key={item.slug} value={item.slug}>
                            {item.name}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <button type="button" onClick={()=>setAnonymous(!anonymous)} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-start transition ${anonymous?"border-primary bg-primary/[.055] ring-2 ring-primary/15":"border-border/70 bg-muted/20 hover:border-primary/25"}`}>
              <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${anonymous?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground"}`}><EyeOff className="size-5"/></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{locale==="ar"?"اطرح السؤال بشكل مجهول":locale==="fr"?"Poser la question anonymement":"Ask anonymously"}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{locale==="ar"?"لن يظهر اسمك للمستخدمين أو الخبراء، بينما تبقى هويتك متاحة للإدارة لأغراض الأمان والمراجعة.":locale==="fr"?"Votre nom sera masqué aux utilisateurs et aux experts, mais restera accessible à l’administration pour la sécurité.":"Your name will be hidden from users and experts, but remains available to administration for safety and moderation."}</span></span>
              <span className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${anonymous?"border-primary bg-primary text-primary-foreground":"border-border"}`}>{anonymous&&<Check className="size-3.5"/>}</span>
            </button>
            <button type="button" onClick={()=>setNotifyByEmail(!notifyByEmail)} className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-start"><span className={`grid size-8 place-items-center rounded-lg ${notifyByEmail?"bg-secondary/12 text-secondary":"bg-muted text-muted-foreground"}`}><Mail className="size-4"/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{locale==="ar"?"أخبرني عبر البريد عند وصول إجابة":locale==="fr"?"Me prévenir par e-mail":"Email me when an answer arrives"}</span><span className="text-[10px] text-muted-foreground">{user.email}</span></span><span className={`grid size-5 place-items-center rounded border ${notifyByEmail?"border-secondary bg-secondary text-secondary-foreground":"border-border"}`}>{notifyByEmail&&<Check className="size-3"/>}</span></button>

            {site.tokenProgram.mode==="full"&&<div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label>{copy.answerPrice}</Label>
                <span className="text-xs text-muted-foreground">
                  {t("ask.yourBalance", "رصيدك")}:{" "}
                  <b className="text-foreground">
                    {profile?.tokens_balance ?? 0}
                  </b>{" "}
                  {t("common.tokens")}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {rewards.map((value) => {
                  const unaffordable =
                    value > 0 && value > (profile?.tokens_balance ?? 0);
                  const disabledByRules = value < categoryMinimum || (value === 0 && (!askRules.allow_free_questions || site.features.free_questions === false)) || (value > 0 && site.features.paid_questions === false);
                  return (
                    <Button
                      key={value}
                      type="button"
                      size="sm"
                      variant={reward === value ? "default" : "outline"}
                      className={`rounded-full ${unaffordable || disabledByRules ? "opacity-40" : ""}`}
                      disabled={unaffordable || disabledByRules}
                      onClick={() => setReward(value)}
                    >
                      {rewardLabel(value)}
                    </Button>
                  );
                })}
              </div>
              {categoryMinimum > 0 && <p className="mt-2 text-xs font-medium text-secondary">الحد الأدنى لهذا التصنيف: {categoryMinimum} {t("common.tokens")}</p>}
              {reward > 0 && (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  ⚠️{" "}
                  {t(
                    "ask.escrowNote",
                    `ستُخصم ${reward} توكن من رصيدك فور الإرسال — تُسترجع تلقائيًا إذا رُفض السؤال أو حذفته قبل النشر.`,
                  )}
                </p>
              )}
            </div>}

            {site.tokenProgram.mode==="full"&&askRules.targeting_enabled && site.features.expert_targeting !== false && audiences.length > 0 && (
              <div>
                <Label>{t("ask.targetAudience", "من تريد أن يجيب؟")}</Label>
                <Select value={targetAudience} onValueChange={setTargetAudience} disabled={!targetingAvailable}>
                  <SelectTrigger className="mt-2 h-11 w-full rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("ask.allExperts", "كل الخبراء المؤهلين")}</SelectItem>
                    {audiences.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {locale === "fr" ? item.label_fr : locale === "en" ? item.label_en : item.label_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!targetingAvailable && (
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {(profile?.tokens_balance ?? 0) < askRules.audience_min_token_balance
                      ? t("ask.targetNeedsTokens", `تحتاج إلى رصيد ${askRules.audience_min_token_balance} توكن على الأقل لاختيار فئة المجيب.`)
                      : t("ask.targetPaidOnly", "الأسئلة المجانية تصل لكل الخبراء. اختر مكافأة توكن لتحديد فئة مهنية.")}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-muted/55 p-4 text-xs leading-6 text-muted-foreground">
              <Sparkles className="size-4 shrink-0 text-accent" />
              <span className="flex-1">{copy.assistant}</span>
              <Badge variant="outline" className="rounded-full">
                {copy.beta}
              </Badge>
            </div>

            <Button size="lg" className="w-full rounded-xl" disabled={submitting} onClick={openPreview}>
              {locale==="ar"?"معاينة السؤال قبل الإرسال":locale==="fr"?"Prévisualiser la question":"Preview before submitting"}
            </Button>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start"><div className="premium-card overflow-hidden"><div className="border-b border-border/60 bg-primary px-5 py-4 text-primary-foreground"><Wand2 className="size-5 text-accent"/><h2 className="mt-2 font-semibold">{locale==="ar"?"كيف تطرح سؤالًا ممتازًا؟":locale==="fr"?"Comment poser une bonne question ?":"How to ask a great question"}</h2></div><ol className="space-y-4 p-5">{(locale==="ar"?["ابحث أولًا وتجنب تكرار سؤال موجود.","اكتب عنوانًا واضحًا يصف المشكلة باختصار.","اذكر السياق وما جربته والنتيجة التي تريدها.","أخفِ البيانات الشخصية وأرفق الملفات الضرورية فقط."]:locale==="fr"?["Recherchez d’abord les questions similaires.","Rédigez un titre court et précis.","Expliquez le contexte, vos essais et le résultat attendu.","Masquez les données personnelles et joignez uniquement les fichiers utiles."]:["Search for similar questions first.","Write a short, specific title.","Explain the context, what you tried, and the result you need.","Hide personal data and attach only useful files."]).map((item,index)=><li key={item} className="flex gap-3 text-xs leading-6 text-muted-foreground"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary/12 text-[10px] font-bold text-secondary">{index+1}</span><span>{item}</span></li>)}</ol><div className="border-t border-border/60 bg-muted/25 p-4"><p className="flex items-start gap-2 text-[11px] leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-secondary"/>{locale==="ar"?"تُراجع الإدارة الأسئلة والإجابات للحفاظ على الجودة والاحترام.":"Questions and answers are moderated to maintain quality and respect."}</p></div></div></aside>
      </section>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl"><DialogHeader><DialogTitle className="text-start text-xl">{locale==="ar"?"معاينة السؤال":locale==="fr"?"Aperçu de la question":"Question preview"}</DialogTitle><DialogDescription className="text-start">{locale==="ar"?"هكذا سيظهر سؤالك بعد موافقة الإدارة.":"This is how your question will appear after moderation."}</DialogDescription></DialogHeader><article className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft sm:p-7"><div className="flex flex-wrap gap-2"><Badge variant="secondary" className="rounded-full">{dbCategories.find(c=>c.slug===category)?.name_ar??category}</Badge>{anonymous&&<Badge variant="outline" className="rounded-full"><EyeOff className="size-3"/>{locale==="ar"?"مجهول":"Anonymous"}</Badge>}</div><h1 className="mt-5 text-2xl font-semibold leading-snug">{title}</h1><RichTextContent text={body} className="mt-5 text-sm leading-7 text-muted-foreground"/>{files.length>0&&<div className="mt-5 border-t border-border/60 pt-4"><p className="text-xs font-semibold">{locale==="ar"?"المرفقات":"Attachments"} ({files.length})</p><div className="mt-2 flex flex-wrap gap-2">{files.map(file=><span key={file.name} className="rounded-full bg-muted px-3 py-1.5 text-[10px]">{file.name}</span>)}</div></div>}</article><div className="flex flex-wrap justify-end gap-2"><Button variant="outline" className="rounded-xl" onClick={()=>setPreviewOpen(false)}>{locale==="ar"?"العودة للتعديل":"Edit"}</Button><Button className="rounded-xl" disabled={submitting} onClick={submit}>{submitting?<Loader2 className="size-4 animate-spin"/>:null}{locale==="ar"?"إرسال إلى الإدارة":copy.publish}</Button></div></DialogContent></Dialog>
    </SiteLayout>
  );
}
