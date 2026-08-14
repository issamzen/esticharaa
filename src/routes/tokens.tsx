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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  name_fr: string;
  name_en: string;
  tokens: number;
  bonus: number;
  price_mad: number;
  promo_price_mad: number | null;
  promo_ends_at: string | null;
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
  const [payingPack, setPayingPack] = useState<DbPack | null>(null);
  const [chosenMethod, setChosenMethod] = useState<string>("");

  useEffect(() => {
    supabase
      .from("token_packs")
      .select("id, name_ar, name_fr, name_en, tokens, bonus, price_mad, promo_price_mad, promo_ends_at, popular")
      .eq("active", true)
      .order("sort")
      .then(({ data }) => {
        if (data && data.length > 0) setDbPacks(data as DbPack[]);
      });
  }, []);

  // Payment methods controlled from admin dashboard (fallback = page copy)
  const activeMethods = site.loaded && site.paymentMethods.length > 0
    ? site.paymentMethods.filter((m) => m.active)
    : null;

  function effectivePrice(pack: DbPack) {
    return pack.promo_price_mad !== null && (!pack.promo_ends_at || new Date(pack.promo_ends_at) > new Date()) ? pack.promo_price_mad : pack.price_mad;
  }
  function localizedName(pack: DbPack) {
    return locale === "fr" && pack.name_fr ? pack.name_fr : locale === "en" && pack.name_en ? pack.name_en : pack.name_ar;
  }

  // Step 1: user clicks "buy" → open the payment-method chooser
  function orderPack(pack: DbPack) {
    if (site.features.token_purchases === false) { toast.info("شراء التوكن متوقف مؤقتًا"); return; }
    if (!user) {
      toast.info(t("auth.signInDescription"));
      navigate({ to: "/auth" });
      return;
    }
    setChosenMethod(activeMethods?.[0]?.id ?? "bank_transfer");
    setPayingPack(pack);
  }

  // Step 2: user confirmed a method → create the order
  async function confirmOrder() {
    if (!user || !payingPack) return;
    const methodLabel =
      activeMethods?.find((m) => m.id === chosenMethod)?.label ?? chosenMethod;
    setOrdering(payingPack.id);
    const { error } = await supabase.rpc("create_token_order", {
      p_pack_id: payingPack.id,
      p_method: methodLabel,
    });
    setOrdering(null);
    setPayingPack(null);
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
                    {localizedName(pack)}
                  </h2>
                  <p className="mt-5 text-4xl font-semibold text-brand">
                    {formatNumber(pack.tokens, locale)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("common.tokens")}
                  </p>
                  <div className="mt-4 flex items-baseline gap-2">
                    {effectivePrice(pack) !== pack.price_mad && <span className="text-sm text-muted-foreground line-through">{formatNumber(pack.price_mad, locale)}</span>}
                    <p className="text-xl font-semibold">{formatNumber(effectivePrice(pack), locale)} {t("common.mad")}</p>
                  </div>
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
                      copy.buy.replace("{{name}}", localizedName(pack))
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

      {/* Payment method chooser */}
      <Dialog open={!!payingPack} onOpenChange={(o) => !o && setPayingPack(null)}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-start text-xl">
              {t("tokens.choosePayment", "اختر وسيلة الدفع")}
            </DialogTitle>
            <DialogDescription className="text-start">
              {payingPack && (
                <>
                  {formatNumber(payingPack.tokens + payingPack.bonus, locale)}{" "}
                  {t("common.tokens")} —{" "}
                  <span className="font-semibold text-foreground">
                    {formatNumber(effectivePrice(payingPack), locale)} {t("common.mad")}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-2">
            {(activeMethods ?? []).map((method) => {
              const Icon = ICONS[method.icon] ?? CreditCard;
              const selected = chosenMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setChosenMethod(method.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-start transition ${
                    selected
                      ? "border-primary bg-primary/[0.06] ring-2 ring-primary/20"
                      : "border-border/70 hover:border-primary/30"
                  }`}
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-4.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{method.label}</span>
                    {selected && method.details ? (
                      <span className="mt-2 block whitespace-pre-wrap rounded-lg bg-background/80 p-2.5 text-xs leading-5 text-muted-foreground" dir="auto">
                        {method.details}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${
                      selected ? "border-primary" : "border-border"
                    }`}
                  >
                    {selected && <span className="size-2.5 rounded-full bg-primary" />}
                  </span>
                </button>
              );
            })}
            {(activeMethods ?? []).length === 0 && (
              <p className="rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground">
                {t("tokens.noMethods", "لا توجد وسائل دفع متاحة حاليًا — تواصل معنا")}
              </p>
            )}
          </div>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {t(
              "tokens.paymentNote",
              "بعد إرسال الطلب ستجد تعليمات إتمام الدفع في حسابك، ويُضاف الرصيد فور تأكيد فريقنا للدفع.",
            )}
          </p>

          <Button
            size="lg"
            className="mt-2 w-full rounded-xl"
            disabled={!chosenMethod || ordering !== null || (activeMethods ?? []).length === 0}
            onClick={confirmOrder}
          >
            {ordering ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              t("tokens.confirmOrder", "تأكيد الطلب")
            )}
          </Button>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
