import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Check, CreditCard, Landmark, Wallet } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tokenPacks } from "@/data/platform";

export const Route = createFileRoute("/tokens")({
  head: () => ({
    meta: [
      { title: "Token Shop — Estichara.ma" },
      {
        name: "description",
        content:
          "Buy token packs from 100 to 5,000 tokens. Pay by card, Stripe, PayPal, Moroccan gateway or bank transfer.",
      },
      { property: "og:title", content: "Token Shop — Estichara.ma" },
      { property: "og:description", content: "Token packs with bonus tokens on larger bundles." },
    ],
  }),
  component: TokensPage,
});

const methods = [
  { name: "Credit card", icon: CreditCard },
  { name: "Stripe", icon: Wallet },
  { name: "PayPal", icon: Wallet },
  { name: "Moroccan gateway (CMI)", icon: Landmark },
  { name: "Bank transfer", icon: Building2 },
];

function TokensPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Token shop"
        title="Buy once, spend where it matters"
        description="Tokens never expire. Use them to publish premium questions, unlock full answers or contact an expert privately."
      />

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tokenPacks.map((pack) => (
            <div
              key={pack.name}
              className={`relative flex flex-col rounded-2xl border p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift ${
                pack.popular ? "border-secondary bg-card" : "border-border/70 bg-card"
              }`}
            >
              {pack.popular ? (
                <Badge className="absolute -top-3 left-6 bg-accent text-accent-foreground">
                  Most popular
                </Badge>
              ) : null}
              <h2 className="font-semibold">{pack.name}</h2>
              <p className="mt-4 text-4xl font-semibold text-brand">
                {pack.tokens.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">tokens</p>
              <p className="mt-4 text-2xl font-semibold">{pack.price} MAD</p>
              <p className="text-xs text-muted-foreground">
                {pack.perToken.toFixed(2)} MAD per token
              </p>
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <Check className="size-4 text-secondary" /> Never expires
                </li>
                <li className="flex gap-2">
                  <Check className="size-4 text-secondary" /> Invoice included
                </li>
                {pack.bonus > 0 ? (
                  <li className="flex gap-2 font-medium text-foreground">
                    <Check className="size-4 text-accent" /> +{pack.bonus} bonus tokens
                  </li>
                ) : null}
              </ul>
              <Button className="mt-6 w-full" variant={pack.popular ? "default" : "outline"}>
                Buy {pack.name}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
          <h2 className="font-semibold">Payment methods</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {methods.map((m) => (
              <span
                key={m.name}
                className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground"
              >
                <m.icon className="size-4 text-secondary" /> {m.name}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Need a custom volume for your company or association?{" "}
            <Link to="/contact" className="text-primary underline underline-offset-4">
              Talk to us
            </Link>
            .
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}