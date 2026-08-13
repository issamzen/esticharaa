import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, ShieldCheck } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { ExpertCard } from "@/components/site/expert-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { experts } from "@/data/platform";
import { usePageCopy } from "@/i18n/page-copy";
import { createPageSeo, pageHead } from "@/i18n/route-meta";
import { localizeExpert } from "@/i18n/platform";
import { useLocale } from "@/i18n/use-locale";

export const Route = createFileRoute("/experts/")({
  loader: ({ context }) => ({
    seo: createPageSeo(context.localeRouting.getLocale(), "experts"),
  }),
  head: ({ loaderData }) => pageHead(loaderData?.seo),
  component: ExpertsPage,
});

function ExpertsPage() {
  const copy = usePageCopy().experts;
  const locale = useLocale();
  const localized = useMemo(
    () => experts.map((item) => localizeExpert(item, locale)),
    [locale],
  );
  const professions = useMemo(
    () => [copy.all, ...new Set(localized.map((item) => item.specialization))],
    [copy.all, localized],
  );
  const [query, setQuery] = useState("");
  const [profession, setProfession] = useState(copy.all);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => setProfession(copy.all), [copy.all]);

  const visible = useMemo(() => {
    const needle = query.toLocaleLowerCase();
    return localized.filter(
      (item) =>
        (profession === copy.all || item.specialization === profession) &&
        (!verifiedOnly || item.verified) &&
        [item.name, item.title, item.city].some((value) =>
          value.toLocaleLowerCase().includes(needle),
        ),
    );
  }, [copy.all, localized, profession, query, verifiedOnly]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      >
        <div className="relative max-w-xl">
          <Search className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setQuery(event.target.value)
            }
            placeholder={copy.search}
            className="h-12 rounded-full bg-background/80 ps-11 shadow-soft"
          />
        </div>
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-wrap gap-2">
          {professions.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={profession === item ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setProfession(item)}
            >
              {item}
            </Button>
          ))}
          <Button
            size="sm"
            variant={verifiedOnly ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setVerifiedOnly((value) => !value)}
          >
            <ShieldCheck className="size-3.5" /> {copy.verifiedOnly}
          </Button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((expert) => (
            <ExpertCard key={expert.slug} expert={expert} />
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="premium-card mt-8 py-16 text-center text-sm text-muted-foreground">
            {copy.empty}
          </div>
        ) : null}
      </section>
    </SiteLayout>
  );
}
