import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  FileCheck2,
  IdCard,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { usePageCopy } from "@/i18n/page-copy";
import { createPageSeo, pageHead } from "@/i18n/route-meta";

export const Route = createFileRoute("/become-expert")({
  loader: ({ context }) => ({
    seo: createPageSeo(context.localeRouting.getLocale(), "becomeExpert"),
  }),
  head: ({ loaderData }) => pageHead(loaderData?.seo),
  component: BecomeExpertPage,
});

const icons = [IdCard, Upload, FileCheck2, ShieldCheck];

function BecomeExpertPage() {
  const copy = usePageCopy().becomeExpert;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      >
        <Button size="lg" asChild className="rounded-xl">
          <Link to="/contact">
            {copy.start} <ArrowRight data-directional className="size-4" />
          </Link>
        </Button>
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute start-[12.5%] end-[12.5%] top-7 hidden border-t border-dashed border-secondary/35 lg:block" />
          {copy.steps.map((step, index) => {
            const Icon = icons[index] ?? ShieldCheck;
            return (
              <article
                key={step.title}
                className="premium-card relative p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="relative z-10 grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/15">
                  <Icon className="size-5" />
                </span>
                <p className="mt-6 text-xs font-bold text-secondary">
                  {copy.step.replace("{{number}}", String(index + 1))}
                </p>
                <h2 className="mt-2 text-lg font-semibold">{step.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {step.text}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}
