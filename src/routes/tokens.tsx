import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Check, CreditCard, Landmark, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tokenPacks } from "@/data/platform";
import { usePageCopy } from "@/i18n/page-copy";
import { createPageSeo, pageHead } from "@/i18n/route-meta";
import { formatNumber } from "@/i18n/format";
import { tokenPackName } from "@/i18n/platform";
import { useLocale } from "@/i18n/use-locale";

export const Route = createFileRoute("/tokens")({
  loader: ({ context }) => ({
    seo: createPageSeo(context.localeRouting.getLocale(), "tokens"),
  }),
  head: ({ loaderData }) => pageHead(loaderData?.seo),
  component: TokensPage,
});

const methodIcons = [CreditCard, Wallet, Wallet, Landmark, Building2];

function TokensPage() {
  const copy = usePageCopy().tokens;
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-start">
          {tokenPacks.map((pack) => {
            const name = tokenPackName(pack.name, locale);
            return (
              <article
                key={pack.name}
                className={`premium-card relative flex flex-col p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift ${
                  pack.popular
                    ? "border-accent shadow-lift lg:-translate-y-3"
                    : ""
                }`}
              >
                {pack.popular ? (
                  <Badge className="absolute -top-3 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent text-accent-foreground">
                    {copy.mostPopular}
                  </Badge>
                ) : null}
                <h2 className="font-semibold text-muted-foreground">{name}</h2>
                <p className="mt-5 text-4xl font-semibold text-brand">
                  {formatNumber(pack.tokens, locale)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("common.tokens")}
                </p>
                <p className="mt-5 text-2xl font-semibold">
                  {formatNumber(pack.price, locale)} {t("common.mad")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {copy.perToken.replace(
                    "{{value}}",
                    formatNumber(pack.perToken, locale),
                  )}
                </p>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-secondary" />{" "}
                    {copy.neverExpires}
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-secondary" />{" "}
                    {copy.invoice}
                  </li>
                  {pack.bonus > 0 ? (
                    <li className="flex items-start gap-2 font-semibold text-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      {copy.bonus.replace(
                        "{{count}}",
                        formatNumber(pack.bonus, locale),
                      )}
                    </li>
                  ) : null}
                </ul>
                <Button
                  className="mt-7 w-full rounded-xl"
                  variant={pack.popular ? "default" : "outline"}
                >
                  {copy.buy.replace("{{name}}", name)}
                </Button>
              </article>
            );
          })}
        </div>

        <div className="premium-card mt-12 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">{copy.paymentMethods}</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {copy.methods.map((method, index) => {
              const Icon = methodIcons[index] ?? CreditCard;
              return (
                <span
                  key={method}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/55 px-4 py-2.5 text-sm text-muted-foreground"
                >
                  <Icon className="size-4 text-secondary" /> {method}
                </span>
              );
            })}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            {copy.custom}{" "}
            <Link
              to="/contact"
              className="font-semibold text-primary underline underline-offset-4"
            >
              {copy.talk}
            </Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
