import { useMemo, useState, type ChangeEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
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

function QuestionsPage() {
  const { category } = Route.useSearch();
  const copy = usePageCopy().questions;
  const locale = useLocale();
  const localized = useMemo(
    () => questions.map((item) => localizeQuestion(item, locale)),
    [locale],
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("newest");

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
          {visible.map((question) => (
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
