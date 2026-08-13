import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BookOpen } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { Badge } from "@/components/ui/badge";
import { usePageCopy } from "@/i18n/page-copy";
import { createPageSeo, pageHead } from "@/i18n/route-meta";

export const Route = createFileRoute("/blog")({
  loader: ({ context }) => ({
    seo: createPageSeo(context.localeRouting.getLocale(), "blog"),
  }),
  head: ({ loaderData }) => pageHead(loaderData?.seo),
  component: BlogPage,
});

function BlogPage() {
  const copy = usePageCopy().blog;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2">
          {copy.posts.map((post, index) => (
            <article
              key={post.title}
              className={`group relative min-h-72 overflow-hidden rounded-3xl border p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-8 ${
                index === 0
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-card"
              }`}
            >
              <div className="absolute -end-20 -top-20 size-56 rounded-full bg-accent/15 blur-3xl" />
              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between gap-3">
                  <Badge
                    variant={index === 0 ? "outline" : "secondary"}
                    className={index === 0 ? "border-white/20 text-white" : ""}
                  >
                    {post.category}
                  </Badge>
                  <BookOpen
                    className={`size-5 ${index === 0 ? "text-accent" : "text-secondary"}`}
                  />
                </div>
                <h2 className="mt-8 text-balance text-xl font-semibold leading-snug sm:text-2xl">
                  {post.title}
                </h2>
                <p
                  className={`mt-3 text-sm leading-6 ${index === 0 ? "text-white/70" : "text-muted-foreground"}`}
                >
                  {post.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-8 text-xs">
                  <time
                    className={
                      index === 0 ? "text-white/55" : "text-muted-foreground"
                    }
                  >
                    {post.date}
                  </time>
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    {copy.read}{" "}
                    <ArrowRight data-directional className="size-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
