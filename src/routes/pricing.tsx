import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Coins, TrendingUp, Wallet } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePageCopy } from "@/i18n/page-copy";
import { createPageSeo, pageHead } from "@/i18n/route-meta";
import { getHomeFaqs } from "@/i18n/home-content";
import { formatNumber } from "@/i18n/format";
import { useLocale } from "@/i18n/use-locale";
import { useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/pricing")({
  loader: ({ context }) => ({
    seo: createPageSeo(context.localeRouting.getLocale(), "pricing"),
  }),
  head: ({ loaderData }) => pageHead(loaderData?.seo),
  component: PricingPage,
});

type DbPack = {
  id: string;
  name_ar: string;
  tokens: number;
  price_mad: number;
};

function PricingPage() {
  const copy = usePageCopy().pricing;
  const { t } = useTranslation();
  const[dbPacks,setDbPacks]=useState<DbPack[]>([]);

  useEffect(() => {
    supabase
      .from("token_packs")
      .select("id, name_ar, tokens, price_mad")
      .eq("active", true)
      .order("sort")
      .then(({ data }) => {
        if (data && data.length > 0) setDbPacks(data as DbPack[]);
      });
  }, []);
  const locale = useLocale();
  const site=useSiteSettings();
  const faqs = getHomeFaqs(t);
  if(site.loaded&&site.tokenProgram.mode!=="full")return <SiteLayout><div className="mx-auto max-w-xl px-4 py-32 text-center"><Coins className="mx-auto size-12 text-primary"/><h1 className="mt-5 text-3xl font-semibold">{locale==="ar"?"Estichara.ma مجانية حاليًا":locale==="fr"?"Estichara.ma est actuellement gratuite":"Estichara.ma is currently free"}</h1><p className="mt-3 text-muted-foreground">{locale==="ar"?"تم إيقاف الشراء وفتح الإجابات بالتوكن. يمكنك استخدام المنصة مجانًا وجمع توكن المكافآت.":"Purchases and paid answer unlocking are disabled. You can use the platform for free and collect reward tokens."}</p><Button asChild className="mt-6 rounded-xl"><Link to="/questions">{locale==="ar"?"تصفح الأسئلة":"Browse questions"}</Link></Button></div></SiteLayout>;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-5 lg:grid-cols-3">
          <article className="premium-card p-6 sm:p-7">
            <Coins className="size-6 text-secondary" />
            <h2 className="mt-5 text-xl font-semibold">{copy.spendTitle}</h2>
            <ul className="mt-5 space-y-4 text-sm">
              {copy.spend.map(([label, value]) => (
                <li
                  key={label}
                  className="flex items-start justify-between gap-4 border-b border-border/50 pb-3 last:border-0"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="shrink-0 font-semibold">{value}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="premium-card border-secondary/25 bg-secondary text-secondary-foreground p-6 sm:p-7">
            <TrendingUp className="size-6 text-accent" />
            <h2 className="mt-5 text-xl font-semibold">{copy.earnTitle}</h2>
            <ul className="mt-5 space-y-4 text-sm">
              {copy.earn.map(([label, value]) => (
                <li
                  key={label}
                  className="flex items-start justify-between gap-4 border-b border-white/15 pb-3 last:border-0"
                >
                  <span className="text-secondary-foreground/75">{label}</span>
                  <span className="shrink-0 font-semibold text-white">
                    {value}
                  </span>
                </li>
              ))}
            </ul>
          </article>

          <article className="premium-card p-6 sm:p-7">
            <Wallet className="size-6 text-accent" />
            <h2 className="mt-5 text-xl font-semibold">{copy.payoutsTitle}</h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              {copy.payoutsText}
            </p>
          </article>
        </div>

        <div className="premium-card mt-12 p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold">{copy.packs}</h2>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/tokens">
                {copy.shop} <ArrowRight data-directional className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dbPacks.map((pack)=><article key={pack.id} className="rounded-2xl border border-border/70 bg-background/60 p-5"><p className="text-sm font-semibold text-muted-foreground">{pack.name_ar}</p><p className="mt-3 text-3xl font-semibold">{formatNumber(pack.tokens,locale)}</p><p className="mt-2 text-sm text-muted-foreground">{formatNumber(pack.price_mad,locale)} {t("common.mad")}</p></article>)}
            {dbPacks.length===0&&<p className="col-span-full py-8 text-center text-sm text-muted-foreground">No active token packs.</p>}
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-3xl font-semibold">{copy.faq}</h2>
          <Accordion type="single" collapsible className="mt-5">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.q} value={`faq-${index}`}>
                <AccordionTrigger className="text-start hover:no-underline hover:text-primary">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="leading-7 text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </SiteLayout>
  );
}
