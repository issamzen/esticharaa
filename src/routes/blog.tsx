import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Guides for Life in Morocco | Estichara.ma" },
      {
        name: "description",
        content:
          "Practical guides on Moroccan administration, health, law, property and entrepreneurship, written with verified experts.",
      },
      { property: "og:title", content: "Estichara.ma Blog" },
      { property: "og:description", content: "Practical guides written with verified experts." },
    ],
  }),
  component: BlogPage,
});

const posts = [
  {
    title: "The complete 2026 guide to the auto-entrepreneur status",
    category: "Administration",
    excerpt:
      "Thresholds, taxes, CNSS coverage and the exact forms — everything a Moroccan freelancer needs before registering.",
    date: "2026-08-04",
  },
  {
    title: "Reading a Moroccan employment contract before you sign",
    category: "Legal",
    excerpt:
      "Trial periods, non-compete clauses and notice periods: the five lines that decide how your job ends.",
    date: "2026-07-22",
  },
  {
    title: "Melkia versus titre foncier, explained simply",
    category: "Real Estate",
    excerpt: "Why the same apartment can cost 30% less, and what you are really buying.",
    date: "2026-07-09",
  },
  {
    title: "How Schengen refusal codes actually work",
    category: "Immigration",
    excerpt: "Decoding codes 2, 3 and 9, and what changes between an appeal and a new application.",
    date: "2026-06-28",
  },
];

function BlogPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Blog"
        title="Guides written with the people who know"
        description="Long-form answers to the questions that come back every week, reviewed by verified experts."
      />
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.title}
              className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <Badge variant="secondary">{post.category}</Badge>
              <h2 className="mt-3 text-lg font-semibold leading-snug">{post.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
              <p className="mt-4 text-xs text-muted-foreground">{post.date}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}