import { useEffect, useState, type ChangeEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Paperclip, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
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

export const Route = createFileRoute("/ask")({
  loader: ({ context }) => ({
    seo: createPageSeo(context.localeRouting.getLocale(), "ask"),
  }),
  head: ({ loaderData }) => pageHead(loaderData?.seo),
  component: AskPage,
});

const rewards = [0, 5, 10, 20, -1] as const;

function AskPage() {
  const copy = usePageCopy().ask;
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const locale = useLocale();
  const localizedCategories = categories.map((item) =>
    localizeCategory(item, locale),
  );
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [reward, setReward] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [dbCategories, setDbCategories] = useState<
    { id: string; slug: string; name_ar: string; name_fr: string; name_en: string }[]
  >([]);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, slug, name_ar, name_fr, name_en")
      .eq("active", true)
      .order("sort")
      .then(({ data }) => setDbCategories(data ?? []));
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

  function rewardLabel(value: number) {
    if (value === 0) return copy.free;
    if (value === -1) return copy.custom;
    return `${value} ${t("common.tokens")}`;
  }

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
    setSubmitting(true);

    // Find the category's database id from its slug
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", result.data.category)
      .maybeSingle();

    const { error } = await supabase.from("questions").insert({
      user_id: user!.id,
      category_id: cat?.id ?? null,
      title: result.data.title,
      body: result.data.body,
      tokens: reward > 0 ? reward : 0,
      status: "pending",
      tags: [],
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      t("ask.savedTitle", "تم إرسال سؤالك بنجاح! ✅"),
      {
        description: t(
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

            <div className="grid gap-5 sm:grid-cols-2">
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
              <div>
                <Label>{copy.visibility}</Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger className="mt-2 h-11 w-full rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">{copy.public}</SelectItem>
                    <SelectItem value="private">{copy.private}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{copy.answerPrice}</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {rewards.map((value) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={reward === value ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setReward(value)}
                  >
                    {rewardLabel(value)}
                  </Button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="w-full rounded-2xl border border-dashed border-secondary/35 bg-secondary/[0.04] p-7 text-center text-sm text-muted-foreground transition hover:border-secondary hover:bg-secondary/[0.07]"
            >
              <Paperclip className="mx-auto size-5 text-secondary" />
              <span className="mt-2 block">{copy.attach}</span>
            </button>

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
