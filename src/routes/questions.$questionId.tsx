import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  BadgeCheck,
  Coins,
  Eye,
  Lock,
  MessageSquare,
  Star,
} from "lucide-react";
import { SiteLayout } from "@/components/site/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/site/question-card";
import { ExpertCard } from "@/components/site/expert-card";
import { questions, experts } from "@/data/platform";
import { usePageCopy } from "@/i18n/page-copy";
import { formatDate, formatNumber } from "@/i18n/format";
import { localizeExpert, localizeQuestion } from "@/i18n/platform";
import { useLocale } from "@/i18n/use-locale";

export const Route = createFileRoute("/questions/$questionId")({
  loader: ({ params, context }) => {
    const base = questions.find((item) => item.id === params.questionId);
    if (!base) throw notFound();
    const question = localizeQuestion(base, context.localeRouting.getLocale());
    return { question };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.question.title} — Estichara.ma` },
          {
            name: "description",
            content: loaderData.question.body.slice(0, 155),
          },
        ]
      : [{ title: "Estichara.ma" }],
  }),
  notFoundComponent: QuestionNotFound,
  errorComponent: QuestionLoadError,
  component: QuestionDetail,
});

function QuestionNotFound() {
  const copy = usePageCopy().question;
  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="text-3xl font-semibold">{copy.notFound}</h1>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/questions">{copy.back}</Link>
        </Button>
      </div>
    </SiteLayout>
  );
}

function QuestionLoadError() {
  const copy = usePageCopy().question;
  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="text-3xl font-semibold">{copy.loadError}</h1>
      </div>
    </SiteLayout>
  );
}

function QuestionDetail() {
  const { question } = Route.useLoaderData();
  const copy = usePageCopy().question;
  const locale = useLocale();
  const [unlocked, setUnlocked] = useState(question.tokens === 0);
  const expert = localizeExpert(experts[0]!, locale);
  const related = questions
    .filter((item) => item.id !== question.id)
    .slice(0, 2);

  return (
    <SiteLayout>
      <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:grid lg:grid-cols-[1fr_330px] lg:gap-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              {question.category}
            </Badge>
            <Badge
              variant={question.tokens > 0 ? "default" : "outline"}
              className={
                question.tokens > 0
                  ? "rounded-full bg-accent text-accent-foreground"
                  : "rounded-full"
              }
            >
              {question.tokens > 0 ? copy.premium : copy.free}
            </Badge>
            <time
              className="text-xs text-muted-foreground"
              dateTime={question.createdAt}
            >
              {formatDate(question.createdAt, locale)}
            </time>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="size-3.5" />{" "}
              {formatNumber(question.views, locale)}
            </span>
          </div>

          <h1 className="mt-5 text-balance text-3xl font-semibold leading-tight sm:text-5xl">
            {question.title}
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            {question.body}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-full">
                #{tag}
              </Badge>
            ))}
          </div>

          <h2 className="mt-12 flex items-center gap-2 text-xl font-semibold">
            <MessageSquare className="size-5 text-secondary" />
            {copy.answers.replace(
              "{{count}}",
              formatNumber(question.answers, locale),
            )}
          </h2>

          <section className="premium-card relative mt-5 overflow-hidden p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="bg-brand grid size-12 place-items-center rounded-2xl font-semibold text-primary-foreground">
                {expert.initials}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold">
                  <span className="truncate">{expert.name}</span>
                  {expert.verified ? (
                    <BadgeCheck className="size-4 text-secondary" />
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {expert.title} · {expert.rating}{" "}
                  <Star className="inline size-3 fill-accent text-accent" /> (
                  {copy.reviews.replace(
                    "{{count}}",
                    formatNumber(expert.reviews, locale),
                  )}
                  )
                </p>
              </div>
            </div>

            <div className="relative mt-6">
              <p className="whitespace-pre-line text-sm leading-7">
                {question.preview}
              </p>
              {!unlocked ? (
                <>
                  <p
                    aria-hidden
                    className="mt-3 select-none text-sm leading-7 blur-[6px]"
                  >
                    {copy.lockedSample}
                  </p>
                  <div className="absolute inset-x-0 bottom-0 top-14 flex items-end rounded-2xl bg-gradient-to-t from-card via-card/90 to-transparent">
                    <div className="glass w-full rounded-2xl p-5 text-center shadow-lift sm:p-6">
                      <Lock className="mx-auto size-5 text-accent" />
                      <p className="mt-3 font-semibold">
                        {copy.unlockTitle.replace(
                          "{{count}}",
                          String(question.tokens),
                        )}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {copy.unlockText}
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <Button
                          className="rounded-xl"
                          onClick={() => setUnlocked(true)}
                        >
                          <Coins className="size-4" /> {copy.unlock}
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="rounded-xl bg-background"
                        >
                          <Link to="/tokens">{copy.buy}</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="mt-3 whitespace-pre-line text-sm leading-7">
                  {copy.lockedSample}
                </p>
              )}
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-border/60 pt-5 text-xs text-muted-foreground sm:grid-cols-4">
              {[
                [copy.knowledge, "5.0"],
                [copy.clarity, "4.9"],
                [copy.helpfulness, "4.8"],
                [copy.speed, "5.0"],
              ].map(([label, value]) => (
                <span
                  key={label}
                  className="rounded-xl bg-muted/45 px-3 py-2 text-center"
                >
                  {label} <strong className="text-foreground">{value}</strong>
                </span>
              ))}
            </div>
          </section>

          <h2 className="mt-12 text-2xl font-semibold">{copy.related}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {related.map((item) => (
              <QuestionCard key={item.id} question={item} />
            ))}
          </div>
        </div>

        <aside className="mt-12 space-y-5 lg:mt-0">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {copy.recommended}
          </h2>
          {experts.slice(1, 3).map((item) => (
            <ExpertCard key={item.slug} expert={item} />
          ))}
        </aside>
      </article>
    </SiteLayout>
  );
}
