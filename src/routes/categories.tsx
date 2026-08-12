import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { categories } from "@/data/platform";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Browse Categories — Estichara.ma" },
      {
        name: "description",
        content:
          "Twenty categories from health and legal to immigration and real estate, each with active questions and verified Moroccan experts.",
      },
      { property: "og:title", content: "Browse Categories — Estichara.ma" },
      {
        property: "og:description",
        content: "Find the right category and the experts already answering in it.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Categories"
        title="Every question has a home"
        description="Twenty categories covering the questions Moroccans actually ask — administration, health, law, property and more."
      />
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = (Icons[category.icon as keyof typeof Icons] ??
              Icons.Sparkles) as Icons.LucideIcon;
            return (
              <Link
                key={category.slug}
                to="/questions"
                search={{ category: category.slug }}
                className="group rounded-2xl border border-border/70 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-brand group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-4 font-semibold">{category.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {category.questions.toLocaleString()} questions ·{" "}
                  {category.answers.toLocaleString()} answers
                </p>
                <p className="mt-3 text-xs font-medium text-secondary">
                  {category.experts} experts available
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}