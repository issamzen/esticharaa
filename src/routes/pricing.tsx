import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Coins, TrendingUp, Wallet } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs, tokenPacks } from "@/data/platform";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing & How Tokens Work — Estichara.ma" },
      {
        name: "description",
        content:
          "How the Estichara token economy works: what you spend, how experts earn, and how payouts are processed from 1,000 tokens.",
      },
      { property: "og:title", content: "Pricing & How Tokens Work — Estichara.ma" },
      {
        property: "og:description",
        content: "Transparent token pricing for askers and experts.",
      },
    ],
  }),
  component: PricingPage,
});

const spend = [
  { label: "Ask a free public question", cost: "0 tokens" },
  { label: "Ask a premium question", cost: "5 – 20 tokens" },
  { label: "Unlock a full answer", cost: "5 tokens average" },
  { label: "Contact an expert privately", cost: "10 tokens" },
];

const earn = [
  { label: "Approved answer", value: "+8 tokens" },
  { label: "Selected as best answer", value: "+15 bonus tokens" },
  { label: "Monthly top contributor", value: "+250 tokens" },
  { label: "Referral signup", value: "+50 tokens" },
];

function PricingPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Pricing"
        title="One currency, no subscription"
        description="You buy tokens. You spend them only on the answers you actually want. Experts are paid for the value they create."
      />

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
            <Coins className="size-5 text-secondary" />
            <h2 className="mt-4 font-semibold">What you spend</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {spend.map((row) => (
                <li key={row.label} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">{row.cost}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
            <TrendingUp className="size-5 text-secondary" />
            <h2 className="mt-4 font-semibold">How experts earn</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {earn.map((row) => (
                <li key={row.label} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium text-secondary">{row.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
            <Wallet className="size-5 text-secondary" />
            <h2 className="mt-4 font-semibold">How payouts work</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Once an expert wallet reaches the 1,000 token threshold, a withdrawal can be requested
              by bank transfer, PayPal or local transfer. The conversion rate is configured by the
              platform and shown before you confirm. Requests are reviewed within 72 hours and every
              movement is logged in the wallet history.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
          <h2 className="font-semibold">Token packs</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tokenPacks.map((pack) => (
              <div key={pack.name} className="rounded-xl border border-border/70 p-4">
                <p className="text-sm text-muted-foreground">{pack.name}</p>
                <p className="mt-1 text-2xl font-semibold">{pack.tokens.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{pack.price} MAD</p>
              </div>
            ))}
          </div>
          <Button asChild className="mt-6">
            <Link to="/tokens">
              Go to token shop <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="mt-4">
            {faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </SiteLayout>
  );
}