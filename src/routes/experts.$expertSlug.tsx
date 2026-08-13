import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BadgeCheck, Clock, Coins, MessageSquare, Star } from "lucide-react";
import { SiteLayout } from "@/components/site/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/site/question-card";
import { experts, questions } from "@/data/platform";
import { usePageCopy } from "@/i18n/page-copy";
import { formatNumber } from "@/i18n/format";
import { localizeExpert } from "@/i18n/platform";
import { useLocale } from "@/i18n/use-locale";

export const Route = createFileRoute("/experts/$expertSlug")({
  loader: ({ params, context }) => {
    const base = experts.find((item) => item.slug === params.expertSlug);
    if (!base) throw notFound();
    const expert = localizeExpert(base, context.localeRouting.getLocale());
    return { expert };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: `${loaderData.expert.name}, ${loaderData.expert.title} — Estichara.ma`,
          },
          { name: "description", content: loaderData.expert.bio.slice(0, 155) },
        ]
      : [{ title: "Estichara.ma" }],
  }),
  notFoundComponent: ExpertNotFound,
  errorComponent: ExpertLoadError,
  component: ExpertProfile,
});

function ExpertNotFound() {
  const copy = usePageCopy().expert;
  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="text-3xl font-semibold">{copy.notFound}</h1>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/experts">{copy.back}</Link>
        </Button>
      </div>
    </SiteLayout>
  );
}

function ExpertLoadError() {
  const copy = usePageCopy().expert;
  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="text-3xl font-semibold">{copy.loadError}</h1>
      </div>
    </SiteLayout>
  );
}

function ExpertProfile() {
  const { expert } = Route.useLoaderData();
  const copy = usePageCopy().expert;
  const locale = useLocale();
  const answered = questions.slice(0, 3);

  const stats = [
    { label: copy.rating, value: `${expert.rating} / 5`, icon: Star },
    {
      label: copy.answersDelivered,
      value: formatNumber(expert.answered, locale),
      icon: MessageSquare,
    },
    {
      label: copy.tokensEarned,
      value: formatNumber(expert.tokens, locale),
      icon: Coins,
    },
    { label: copy.responseTime, value: expert.responseTime, icon: Clock },
  ];

  return (
    <SiteLayout>
      <section className="bg-hero relative overflow-hidden border-b border-border/60">
        <div className="absolute -end-28 -top-28 size-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 sm:flex-row sm:items-center sm:px-6 sm:py-20">
          <span className="bg-brand grid size-24 shrink-0 place-items-center rounded-[2rem] text-3xl font-semibold text-primary-foreground shadow-lift">
            {expert.initials}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold sm:text-5xl">
                {expert.name}
              </h1>
              {expert.verified ? (
                <Badge className="rounded-full bg-secondary text-secondary-foreground">
                  <BadgeCheck className="size-3.5" /> {copy.verifiedLevel}
                </Badge>
              ) : (
                <Badge variant="outline" className="rounded-full">
                  {copy.pending}
                </Badge>
              )}
            </div>
            <p className="mt-2 text-muted-foreground">
              {expert.title} · {expert.specialization} · {expert.city}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button className="rounded-xl">
                <MessageSquare className="size-4" /> {copy.contact}
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-xl bg-background/70"
              >
                <Link to="/ask">{copy.ask}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className="premium-card p-5 sm:p-6">
              <stat.icon className="size-5 text-secondary" />
              <p className="mt-4 text-xl font-semibold sm:text-2xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="text-2xl font-semibold">{copy.biography}</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              {expert.bio}
            </p>

            <h2 className="mt-12 text-2xl font-semibold">
              {copy.recentAnswers}
            </h2>
            <div className="mt-5 grid gap-4">
              {answered.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>

            <h2 className="mt-12 text-2xl font-semibold">
              {copy.reviews} ({formatNumber(expert.reviews, locale)})
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {copy.reviewItems.map((review) => (
                <article key={review} className="premium-card p-5 text-sm">
                  <div className="flex gap-0.5 text-accent">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="size-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="mt-3 leading-6 text-muted-foreground">
                    {review}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="premium-card p-6">
              <h3 className="font-semibold">{copy.certificates}</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {copy.certificateItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 size-4 shrink-0 text-secondary" />{" "}
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="premium-card p-6">
              <h3 className="font-semibold">{copy.achievements}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {copy.achievementItems.map((item) => (
                  <Badge key={item} variant="outline" className="rounded-full">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
