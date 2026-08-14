import { useEffect, useState, type ChangeEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

  const categoryMinimum = dbCategories.find((item) => item.slug === category)?.min_reward_tokens ?? 0;
  const targetingAvailable = askRules.targeting_enabled
    && site.features.expert_targeting !== false
    && (profile?.tokens_balance ?? 0) >= askRules.audience_min_token_balance
    && (!askRules.targeting_requires_paid_question || reward > 0);

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
    const canTarget = askRules.targeting_enabled
      && (profile?.tokens_balance ?? 0) >= askRules.audience_min_token_balance
      && (!askRules.targeting_requires_paid_question || rewardTokens > 0);
    // The database repeats every check and deducts the reward atomically.
    const { error } = await supabase.rpc("create_question", {
      p_title: result.data.title,
      p_body: result.data.body,
      p_category_id: cat?.id ?? null,
      p_tokens: rewardTokens,
      p_target_audience_id: canTarget && targetAudience !== "all" ? targetAudience : null,
    });
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
              <Textarea
                id="body"
                value={body}
                maxLength={4000}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setBody(event.target.value)
                }
                placeholder={copy.detailsPlaceholder}
                className="mt-2 min-h-44 rounded-xl"
              />
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

            <div>
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
            </div>

            {askRules.targeting_enabled && site.features.expert_targeting !== false && audiences.length > 0 && (
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

            <Button size="lg" className="w-full rounded-xl" disabled={submitting} onClick={submit}>
              {copy.publish}
            </Button>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {[copy.suggestion, copy.assistant].map((text, index) => (
            <div key={text} className="premium-card p-5">
              {index === 0 ? (
                <Wand2 className="size-5 text-secondary" />
              ) : (
                <ShieldCheck className="size-5 text-accent" />
              )}
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {text}
              </p>
            </div>
          ))}
        </aside>
      </section>
    </SiteLayout>
  );
}
