import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { categories } from "@/data/platform";
import { usePageCopy } from "@/i18n/page-copy";
import { createPageSeo, pageHead } from "@/i18n/route-meta";
import { formatNumber } from "@/i18n/format";
import { localizeCategory } from "@/i18n/platform";
import { useLocale } from "@/i18n/use-locale";

export const Route = createFileRoute("/categories")({
  loader: ({ context }) => ({
    seo: createPageSeo(context.localeRouting.getLocale(), "categories"),
  }),
  head: ({ loaderData }) => pageHead(loaderData?.seo),
  component: CategoriesPage,
});

function CategoriesPage() {
  const copy = usePageCopy().categories;
  const locale = useLocale();

  function withCount(template: string, value: number) {
    return template.replace("{{count}}", formatNumber(value, locale));
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((base) => {
            const category = localizeCategory(base, locale);
            const Icon = (Icons[category.icon as keyof typeof Icons] ??
              Icons.Sparkles) as Icons.LucideIcon;

            return (
              <Link
                key={category.slug}
                to="/questions"
                search={{ category: category.slug }}
                className="premium-card group relative overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:border-secondary/35 hover:shadow-lift"
              >
                <div className="absolute -end-12 -top-12 size-36 rounded-full bg-secondary/10 blur-2xl transition group-hover:bg-secondary/20" />
                <div className="relative flex items-start justify-between gap-4">
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <ArrowRight
                    data-directional
                    className="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100"
                  />
                </div>
                <h2 className="relative mt-5 text-lg font-semibold">
                  {category.name}
                </h2>
                <p className="relative mt-2 text-sm text-muted-foreground">
                  {withCount(copy.questions, category.questions)} ·{" "}
                  {withCount(copy.answers, category.answers)}
                </p>
                <p className="relative mt-4 text-xs font-semibold text-secondary">
                  {withCount(copy.experts, category.experts)}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}
