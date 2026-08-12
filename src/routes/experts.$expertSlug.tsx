import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BadgeCheck, Clock, Coins, MessageSquare, Star } from "lucide-react";
import { SiteLayout } from "@/components/site/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/site/question-card";
import { experts, questions } from "@/data/platform";

export const Route = createFileRoute("/experts/$expertSlug")({
  loader: ({ params }) => {
    const expert = experts.find((e) => e.slug === params.expertSlug);
    if (!expert) throw notFound();
    return { expert };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Expert not found — Estichara.ma" }, { name: "robots", content: "noindex" }],
      };
    }
    const { expert } = loaderData;
    return {
      meta: [
        { title: `${expert.name}, ${expert.title} — Estichara.ma` },
        { name: "description", content: expert.bio.slice(0, 155) },
        { property: "og:title", content: `${expert.name} — ${expert.title}` },
        { property: "og:description", content: expert.bio.slice(0, 155) },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="text-2xl font-semibold">Expert not found</h1>
        <Button asChild className="mt-6">
          <Link to="/experts">Back to directory</Link>
        </Button>
      </div>
    </SiteLayout>
  ),
  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="text-2xl font-semibold">This profile didn&apos;t load</h1>
      </div>
    </SiteLayout>
  ),
  component: ExpertProfile,
});

const achievements = ["Top contributor 2026", "100 answers milestone", "5-star streak ×12"];

function ExpertProfile() {
  const { expert } = Route.useLoaderData();
  const answered = questions.slice(0, 3);

  return (
    <SiteLayout>
      <section className="bg-hero border-b border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:flex-row sm:items-center">
          <span className="grid size-24 shrink-0 place-items-center rounded-3xl bg-brand text-3xl font-semibold text-primary-foreground shadow-lift">
            {expert.initials}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold">{expert.name}</h1>
              {expert.verified ? (
                <Badge className="bg-secondary text-secondary-foreground">
                  <BadgeCheck className="size-3.5" /> Verified level 2
                </Badge>
              ) : (
                <Badge variant="outline">Pending verification</Badge>
              )}
            </div>
            <p className="mt-1 text-muted-foreground">
              {expert.title} · {expert.specialization} · {expert.city}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button>
                <MessageSquare className="size-4" /> Contact for 10 tokens
              </Button>
              <Button asChild variant="outline">
                <Link to="/ask">Ask this expert</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Rating", value: `${expert.rating} / 5`, icon: Star },
            { label: "Answers delivered", value: expert.answered, icon: MessageSquare },
            { label: "Tokens earned", value: expert.tokens.toLocaleString(), icon: Coins },
            { label: "Response time", value: expert.responseTime, icon: Clock },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft"
            >
              <stat.icon className="size-4 text-secondary" />
              <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="text-lg font-semibold">Biography</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{expert.bio}</p>

            <h2 className="mt-10 text-lg font-semibold">Recent answers</h2>
            <div className="mt-4 grid gap-4">
              {answered.map((q) => (
                <QuestionCard key={q.id} question={q} />
              ))}
            </div>

            <h2 className="mt-10 text-lg font-semibold">Reviews ({expert.reviews})</h2>
            <div className="mt-4 space-y-4">
              {[
                "Clear, structured and referenced. Saved me two trips to the administration.",
                "Answered in under an hour and followed up on my second question for free.",
              ].map((review) => (
                <div
                  key={review}
                  className="rounded-2xl border border-border/70 bg-card p-5 text-sm shadow-soft"
                >
                  <div className="flex gap-0.5 text-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="mt-2 text-muted-foreground">{review}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
              <h3 className="text-sm font-semibold">Certificates</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>State diploma verified</li>
                <li>Professional order registration</li>
                <li>Identity document verified</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
              <h3 className="text-sm font-semibold">Achievements</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {achievements.map((a) => (
                  <Badge key={a} variant="outline">
                    {a}
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