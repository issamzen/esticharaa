import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { QuestionCard } from "@/components/site/question-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { questions } from "@/data/platform";

type Search = { category?: string | undefined };

const filters = ["newest", "trending", "most answered", "premium", "unresolved"] as const;

export const Route = createFileRoute("/questions/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse Questions — Estichara.ma" },
      {
        name: "description",
        content:
          "Search thousands of questions answered by verified Moroccan professionals. Filter by newest, trending, premium or unresolved.",
      },
      { property: "og:title", content: "Browse Questions — Estichara.ma" },
      {
        property: "og:description",
        content: "Search real questions and expert answers across twenty categories.",
      },
    ],
  }),
  component: QuestionsPage,
});

function QuestionsPage() {
  const { category } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("newest");

  const visible = useMemo(() => {
    let list = questions.filter(
      (q) =>
        (!category || q.categorySlug === category) &&
        (q.title.toLowerCase().includes(query.toLowerCase()) ||
          q.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))),
    );
    if (filter === "trending") list = list.filter((q) => q.trending);
    if (filter === "premium") list = list.filter((q) => q.tokens > 0);
    if (filter === "unresolved") list = list.filter((q) => !q.resolved);
    if (filter === "most answered") list = [...list].sort((a, b) => b.answers - a.answers);
    if (filter === "newest")
      list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return list;
  }, [category, query, filter]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Questions"
        title="What Morocco is asking right now"
        description="Every question shows a free preview of its best answer. Unlock the full text with tokens when it matters."
      >
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions, tags, keywords…"
            className="h-12 rounded-full pl-10"
          />
        </div>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              className="rounded-full capitalize"
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {visible.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No questions match this filter yet.
          </p>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Showing {visible.length} of {questions.length} questions
          </p>
        )}
      </section>
    </SiteLayout>
  );
}