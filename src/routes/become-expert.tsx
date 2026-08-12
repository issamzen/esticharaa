import { createFileRoute, Link } from "@tanstack/react-router";
import { FileCheck2, IdCard, ShieldCheck, Upload } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/become-expert")({
  head: () => ({
    meta: [
      { title: "Become a Verified Expert — Estichara.ma" },
      {
        name: "description",
        content:
          "Answer questions in your field, earn tokens for every approved answer and withdraw from 1,000 tokens.",
      },
      { property: "og:title", content: "Become a Verified Expert — Estichara.ma" },
      { property: "og:description", content: "Turn your expertise into recurring income." },
    ],
  }),
  component: BecomeExpertPage,
});

const steps = [
  { icon: IdCard, title: "Create your profile", text: "Profession, specialisation, city and bio." },
  { icon: Upload, title: "Upload documents", text: "ID, diplomas, certificates and resume." },
  { icon: FileCheck2, title: "Human review", text: "A reviewer checks every document within 72h." },
  { icon: ShieldCheck, title: "Get verified", text: "Your badge unlocks premium questions." },
];

function BecomeExpertPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Experts"
        title="Turn what you know into income"
        description="Answer questions between appointments. Earn tokens for every approved answer, bonuses for best answers, and withdraw from 1,000 tokens."
      >
        <Button size="lg" asChild>
          <Link to="/contact">Start the application</Link>
        </Button>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="size-5" />
              </span>
              <p className="mt-4 text-xs font-semibold text-muted-foreground">Step {i + 1}</p>
              <h2 className="mt-1 font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}