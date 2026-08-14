import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Lock, MessageSquare, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/i18n/format";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { QuestionCard } from "@/components/site/question-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { questions } from "@/data/platform";
import { usePageCopy } from "@/i18n/page-copy";
import { createPageSeo, pageHead } from "@/i18n/route-meta";
import { localizeQuestion } from "@/i18n/platform";
import { useLocale } from "@/i18n/use-locale";
import { formatNumber } from "@/i18n/format";

type SearchParams = { category?: string };
type Filter = "newest" | "trending" | "mostAnswered" | "premium" | "unresolved";
const filters: Filter[] = [
  "newest",
  "trending",
  "mostAnswered",
  "premium",
  "unresolved",
];

export const Route = createFileRoute("/questions/")({
  loader: ({ context }) => ({
    seo: createPageSeo(context.localeRouting.getLocale(), "questions"),
  }),
  head: ({ loaderData }) => pageHead(loaderData?.seo),
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  component: QuestionsPage,
});

type LiveQuestion = {
  id: string;
  title: string;
  body: string;
  tokens: number;
  unlock_cost: number;
  views: number;
  answers_count: number;
  created_at: string;
  category_slug: string | null;
  category_name_ar: string | null;
  target_audience_id: string | null;
};
type Audience = { id: string; label_ar: string; label_fr: string; label_en: string; active: boolean };

function QuestionsPage() {
  const { category } = Route.useSearch();
  const copy = usePageCopy().questions;
  const locale = useLocale();
  const { t } = useTranslation();
  const [live, setLive] = useState<LiveQuestion[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);

  useEffect(() => {
    supabase
      .rpc("get_public_questions", { p_limit: 50 })
      .then(({ data }) => setLive((data as unknown as LiveQuestion[]) ?? []));
    supabase.from("settings").select("value").eq("key", "expert_audiences").single()
      .then(({ data }) => setAudiences(((data?.value as Audience[]) ?? []).filter((item) => item.active)));
  }, []);

  const liveVisible = useMemo(
    () => live.filter((q) => !category || q.category_slug === category),
    [live, category],
  );
  const localized = useMemo(
    () => questions.map((item) => localizeQuestion(item, locale)),
    [locale],
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("newest");

  function audienceLabel(id: string | null) {
    if (!id) return locale === "ar" ? "كل الخبراء" : locale === "fr" ? "Tous les experts" : "All experts";
    const item = audiences.find((audience) => audience.id === id);
    return item ? (locale === "fr" ? item.label_fr : locale === "en" ? item.label_en : item.label_ar) : id;
  }

  const visible = useMemo(() => {
    const needle = query.toLocaleLowerCase();
    let list = localized.filter(
      (item) =>
        (!category || item.categorySlug === category) &&
        (item.title.toLocaleLowerCase().includes(needle) ||
          item.tags.some((tag) => tag.toLocaleLowerCase().includes(needle))),
    );
    if (filter === "trending") list = list.filter((item) => item.trending);
    if (filter === "premium") list = list.filter((item) => item.tokens > 0);
    if (filter === "unresolved") list = list.filter((item) => !item.resolved);
    if (filter === "mostAnswered")
      list = [...list].sort((a, b) => b.answers - a.answers);
    if (filter === "newest") {
      list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return list;
  }, [category, filter, localized, query]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      >
        <div className="relative max-w-xl">
          <Search className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setQuery(event.target.value)
            }
            placeholder={copy.search}
            className="h-12 rounded-full bg-background/80 ps-11 shadow-soft"
          />
        </div>
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={filter === item ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setFilter(item)}
            >
              {copy.filters[item]}
            </Button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {/* Real questions from the community (database) */}
          {liveVisible.map((q) => (
            <Link
              key={q.id}
              to="/questions/$questionId"
              params={{ questionId: q.id }}
              className="group relative block overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-secondary/35 hover:shadow-lift sm:p-6"
            >
              <div className="absolute inset-x-0 top-0 h-0.5 origin-start scale-x-0 bg-gradient-to-r from-secondary to-accent transition-transform duration-300 group-hover:scale-x-100" />
              <div className="flex flex-wrap items-center gap-2">
                {q.category_name_ar ? (
                  <Badge variant="secondary" className="rounded-full">
                    {q.category_name_ar}
                  </Badge>
                ) : null}
                <Badge variant="outline" className="rounded-full border-secondary/35 bg-secondary/5">
                  <Users className="size-3" /> {audienceLabel(q.target_audience_id)}
                </Badge>
                {q.unlock_cost > 0 ? (
                  <Badge className="rounded-full bg-accent text-accent-foreground">
                    <Lock className="size-3" /> {q.unlock_cost} {t("common.tokens")}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="rounded-full">
                    {t("common.free")}
                  </Badge>
                )}
              </div>
              <h3 className="mt-4 text-lg font-semibold leading-snug transition-colors group-hover:text-primary sm:text-xl">
                {q.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {q.body}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-secondary" />
                  {q.answers_count}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="size-3.5" /> {q.views}
                </span>
                <span className="ms-auto">{formatDate(q.created_at, locale)}</span>
              </div>
            </Link>
          ))}
          {/* Sample questions — shown only while there is no real content yet */}
          {liveVisible.length === 0 &&
            visible.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border/60 bg-muted/35 px-4 py-5 text-center text-sm text-muted-foreground">
          {visible.length === 0
            ? copy.empty
            : copy.showing
                .replace("{{visible}}", formatNumber(visible.length, locale))
                .replace("{{total}}", formatNumber(questions.length, locale))}
        </div>
      </section>
    </SiteLayout>
  );
}
