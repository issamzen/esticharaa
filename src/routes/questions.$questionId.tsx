import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BadgeCheck, Coins, Eye, Lock, MessageSquare, Star } from "lucide-react";
import { SiteLayout } from "@/components/site/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/site/question-card";
import { ExpertCard } from "@/components/site/expert-card";
import { questions, experts } from "@/data/platform";

export const Route = createFileRoute("/questions/$questionId")({
  loader: ({ params }) => {
    const question = questions.find((q) => q.id === params.questionId);
    if (!question) throw notFound();
    return { question };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Question not found — Estichara.ma" }, { name: "robots", content: "noindex" }],
      };
    }
    const { question } = loaderData;
    return {
      meta: [
        { title: `${question.title} — Estichara.ma` },
        { name: "description", content: question.body.slice(0, 155) },
        { property: "og:title", content: question.title },
        { property: "og:description", content: question.body.slice(0, 155) },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="text-2xl font-semibold">This question no longer exists</h1>
        <Button asChild className="mt-6">
          <Link to="/questions">Browse questions</Link>
        </Button>
      </div>
    </SiteLayout>
  ),
  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="text-2xl font-semibold">This question didn&apos;t load</h1>
      </div>
    </SiteLayout>
  ),
  component: QuestionDetail,
});

function QuestionDetail() {
  const { question } = Route.useLoaderData();
  const [unlocked, setUnlocked] = useState(question.tokens === 0);
  const expert = experts[0]!;
  const related = questions.filter((q) => q.id !== question.id).slice(0, 2);

  return (
    <SiteLayout>
      <article className="mx-auto max-w-6xl px-4 py-10 lg:grid lg:grid-cols-[1fr_320px] lg:gap-10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{question.category}</Badge>
            {question.tokens > 0 ? (
              <Badge className="bg-accent text-accent-foreground">Premium</Badge>
            ) : (
              <Badge variant="outline">Free</Badge>
            )}
            <span className="text-xs text-muted-foreground">{question.createdAt}</span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="size-3.5" /> {question.views.toLocaleString()}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
            {question.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{question.body}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>

          <h2 className="mt-12 flex items-center gap-2 text-lg font-semibold">
            <MessageSquare className="size-4 text-primary" /> {question.answers} answers
          </h2>

          <div className="mt-4 rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-brand font-semibold text-primary-foreground">
                {expert.initials}
              </span>
              <div>
                <div className="flex items-center gap-1.5 font-medium">
                  {expert.name}
                  {expert.verified ? <BadgeCheck className="size-4 text-secondary" /> : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {expert.title} · {expert.rating} <Star className="inline size-3 text-accent" /> (
                  {expert.reviews} reviews)
                </p>
              </div>
            </div>

            <div className="relative mt-5">
              <p className="whitespace-pre-line text-sm leading-relaxed">{question.preview}</p>

              {!unlocked ? (
                <>
                  <p
                    aria-hidden
                    className="mt-3 select-none whitespace-pre-line text-sm leading-relaxed blur-[6px]"
                  >
                    {LOCKED_SAMPLE}
                  </p>
                  <div className="absolute inset-x-0 bottom-0 top-16 flex items-end justify-center rounded-xl bg-gradient-to-t from-card via-card/85 to-transparent">
                    <div className="glass w-full rounded-2xl p-5 text-center shadow-lift">
                      <Lock className="mx-auto size-5 text-accent" />
                      <p className="mt-2 font-medium">
                        Unlock the full answer for {question.tokens} tokens
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        One-time unlock. Stays in your purchased answers forever.
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <Button onClick={() => setUnlocked(true)}>
                          <Coins className="size-4" /> Unlock answer
                        </Button>
                        <Button asChild variant="outline">
                          <Link to="/tokens">Buy tokens</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{LOCKED_SAMPLE}</p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
              <span>Knowledge 5.0</span>
              <span>Clarity 4.9</span>
              <span>Helpfulness 4.8</span>
              <span>Speed 5.0</span>
            </div>
          </div>

          <h2 className="mt-12 text-lg font-semibold">Related questions</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        </div>

        <aside className="mt-12 space-y-4 lg:mt-0">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recommended experts
          </h2>
          {experts.slice(1, 3).map((e) => (
            <ExpertCard key={e.slug} expert={e} />
          ))}
        </aside>
      </article>
    </SiteLayout>
  );
}

const LOCKED_SAMPLE = `The full answer walks through each administrative step, the exact documents to bring, the office that processes them, and the delays you should expect at every stage.
It also covers the two mistakes that send most files back to the start, and what to do if your case falls outside the standard procedure.
Finally it includes the references to the applicable texts so you can defend your position at the counter.`;