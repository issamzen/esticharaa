import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Check,
  CreditCard,
  Landmark,
  Loader2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tokenPacks as fallbackPacks } from "@/data/platform";
import { usePageCopy } from "@/i18n/page-copy";
import { createPageSeo, pageHead } from "@/i18n/route-meta";
import { formatNumber } from "@/i18n/format";
import { tokenPackName } from "@/i18n/platform";
import { useLocale } from "@/i18n/use-locale";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/tokens")({
  loader: ({ context }) => ({
    seo: createPageSeo(context.localeRouting.getLocale(), "tokens"),
  }),
  head: ({ loaderData }) => pageHead(loaderData?.seo),
  component: TokensPage,
});

const ICONS: Record<string, typeof CreditCard> = {
  CreditCard,
  Wallet,
  Landmark,
  Building2,
};

type DbPack = {
  id: string;
  name_ar: string;
  tokens: number;
  bonus: number;
  price_mad: number;
  popular: boolean;
};

function TokensPage() {
  const copy = usePageCopy().tokens;
  const { t } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const { user } = useAuth();
  const site = useSiteSettings();
  const [dbPacks, setDbPacks] = useState<DbPack[] | null>(null);
  const [ordering, setOrdering] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("token_packs")
      .select("id, name_ar, tokens, bonus, price_mad, popular")
      .eq("active", true)
      .order("sort")
      .then(({ data }) => {
        if (data && data.length > 0) setDbPacks(data as DbPack[]);
      });
  }, []);

  async function orderPack(pack: DbPack) {
    if (!user) {
      toast.info(t("auth.signInDescription"));
      navigate({ to: "/auth" });
      return;
    }
    setOrdering(pack.id);
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      pack_id: pack.id,
      tokens: pack.tokens,
      bonus: pack.bonus,
      price_mad: pack.price_mad,
      method: "bank_transfer",
      status: "pending",
    });
    setOrdering(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      t(
        "tokens.orderCreated",
        "تم إنشاء طلبك! ستجد تعليمات الدفع في حسابك، وسيُضاف الرصيد فور تأكيد الدفع.",
      ),
      { duration: 8000 },
    );
    navigate({ to: "/account" });
  }

  // Payment methods controlled from admin dashboard (fallback = page copy)
  const activeMethods = site.loaded && site.paymentMethods.length > 0
    ? site.paymentMethods.filter((m) => m.active)
    : null;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-start">
          {dbPacks
            ? dbPacks.map((pack) => (
                <article
                  key={pack.id}
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
                  <h2 className="font-semibold text-muted-foreground">
                    {pack.name_ar}
                  </h2>
                  <p className="mt-5 text-4xl font-semibold text-brand">
                    {formatNumber(pack.tokens, locale)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("common.tokens")}
                  </p>
                  <p className="mt-4 text-xl font-semibold">
                    {formatNumber(pack.price_mad, locale)} {t("common.mad")}
                  </p>
                  <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                    {pack.bonus > 0 ? (
                      <li className="flex items-center gap-2">
                        <Check className="size-4 text-secondary" /> +
                        {formatNumber(pack.bonus, locale)} {t("common.tokens")}
                      </li>
                    ) : null}
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-secondary" />{" "}
                      {t("home.pricing.neverExpires")}
                    </li>
                  </ul>
                  <Button
                    className="mt-7 w-full rounded-xl"
                    variant={pack.popular ? "default" : "outline"}
                    disabled={ordering === pack.id}
                    onClick={() => orderPack(pack)}
                  >
                    {ordering === pack.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      copy.buy.replace("{{name}}", pack.name_ar)
                    )}
                  </Button>
                </article>
              ))
            : fallbackPacks.map((pack) => {
                const name = tokenPackName(pack.name, locale);
                return (
                  <article
                    key={pack.name}
                    className={`premium-card relative flex flex-col p-6 ${
                      pack.popular ? "border-accent lg:-translate-y-3" : ""
                    }`}
                  >
                    <h2 className="font-semibold text-muted-foreground">
                      {name}
                    </h2>
                    <p className="mt-5 text-4xl font-semibold text-brand">
                      {formatNumber(pack.tokens, locale)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("common.tokens")}
                    </p>
                    <p className="mt-4 text-xl font-semibold">
                      {formatNumber(pack.price, locale)} {t("common.mad")}
                    </p>
                  </article>
                );
              })}
        </div>

        <div className="premium-card mt-12 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">{copy.paymentMethods}</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {activeMethods
              ? activeMethods.map((method) => {
                  const Icon = ICONS[method.icon] ?? CreditCard;
                  return (
                    <span
                      key={method.id}
                      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/55 px-4 py-2.5 text-sm text-muted-foreground"
                    >
                      <Icon className="size-4 text-secondary" /> {method.label}
                    </span>
                  );
                })
              : copy.methods.map((method, index) => {
                  const icons = [CreditCard, Wallet, Wallet, Landmark, Building2];
                  const Icon = icons[index] ?? CreditCard;
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
