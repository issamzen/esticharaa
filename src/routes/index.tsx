import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Coins,
  Lock,
  MessageSquare,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { SiteLayout } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { QuestionCard } from "@/components/site/question-card";
import { ExpertCard } from "@/components/site/expert-card";
import { categories, experts, faqs, questions, stories, tokenPacks } from "@/data/platform";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estichara.ma — Ask Anything. Learn From Real Experts." },
      {
        name: "description",
        content:
          "Morocco's question and answer marketplace. Get trusted answers from verified professionals and people with real-life experience, one token at a time.",
      },
      { property: "og:title", content: "Estichara.ma — Ask Anything. Learn From Real Experts." },
      {
        property: "og:description",
        content:
          "Trusted answers from verified Moroccan professionals. Pay with tokens, only for what helps.",
      },
    ],
  }),
  component: Index,
});

const features = [
  {
    icon: BadgeCheck,
    title: "Verified expertise",
    text: "Every badge is backed by an ID, a diploma and a human review — not a self-declared title.",
  },
  {
    icon: Coins,
    title: "Pay per answer",
    text: "No subscription. Buy tokens once and spend them only on the answers you actually open.",
  },
  {
    icon: Zap,
    title: "Answers in hours",
    text: "Most premium questions receive their first qualified answer in under four hours.",
  },
  {
    icon: ShieldCheck,
    title: "Moderated content",
    text: "Answers pass moderation before publication, and every review is tied to a real unlock.",
  },
];

const steps = [
  { title: "Ask your question", text: "Add context, category and attachments. Free or premium." },
  { title: "Experts answer", text: "Qualified professionals compete to give the clearest answer." },
  { title: "Unlock what helps", text: "Read the preview, then spend tokens on the full answer." },
  { title: "Rate the expert", text: "Knowledge, clarity, helpfulness and speed — on five stars." },
];

function Index() {
  return (
    <SiteLayout>
      <section className="bg-hero relative overflow-hidden border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <Badge variant="outline" className="glass rounded-full px-3 py-1.5">
            <Sparkles className="size-3.5 text-accent" /> 12,000+ answers from verified Moroccan
            experts
          </Badge>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-6xl">
            Ask Anything.{" "}
            <span className="text-brand">Learn From Real Experts.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Get trusted answers from professionals and people with real-life experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/ask">
                Ask a question <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/questions">
                <Search className="size-4" /> Browse questions
              </Link>
            </Button>
          </div>

          <div className="mt-14 grid max-w-2xl grid-cols-3 gap-4">
            {[
              { value: "12.4k", label: "Answers published" },
              { value: "640", label: "Verified experts" },
              { value: "3h 12m", label: "Median response" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-4">
                <p className="text-2xl font-semibold sm:text-3xl">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-semibold sm:text-4xl">Built for answers you can act on</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-3xl font-semibold sm:text-4xl">How it works</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="rounded-2xl border border-border/70 bg-card p-6">
                <span className="grid size-9 place-items-center rounded-full bg-brand text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold sm:text-4xl">Trending questions</h2>
          <Link
            to="/questions"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            See all questions <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {questions.slice(0, 4).map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-semibold sm:text-4xl">Featured experts</h2>
            <Link
              to="/experts"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              Expert directory <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {experts.slice(0, 3).map((expert) => (
              <ExpertCard key={expert.slug} expert={expert} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold sm:text-4xl">Popular categories</h2>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            All 20 categories <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => {
            const Icon = (Icons[category.icon as keyof typeof Icons] ??
              Icons.Sparkles) as Icons.LucideIcon;
            return (
              <Link
                key={category.slug}
                to="/questions"
                search={{ category: category.slug }}
                className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-brand group-hover:text-primary-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{category.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {category.questions.toLocaleString()} questions
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-3xl font-semibold sm:text-4xl">Success stories</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {stories.map((story) => (
              <figure
                key={story.name}
                className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft"
              >
                <Quote className="size-5 text-accent" />
                <blockquote className="mt-4 text-sm leading-relaxed">{story.quote}</blockquote>
                <figcaption className="mt-4 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{story.name}</span> — {story.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold sm:text-4xl">Simple token pricing</h2>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            How tokens work <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tokenPacks.map((pack) => (
            <div
              key={pack.name}
              className={`rounded-2xl border p-6 shadow-soft ${
                pack.popular ? "border-secondary" : "border-border/70"
              } bg-card`}
            >
              {pack.popular ? (
                <Badge className="mb-3 bg-accent text-accent-foreground">Most popular</Badge>
              ) : null}
              <h3 className="font-semibold">{pack.name}</h3>
              <p className="mt-3 text-3xl font-semibold">{pack.tokens.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">tokens</p>
              <p className="mt-3 text-lg font-medium">{pack.price} MAD</p>
              <Button asChild variant={pack.popular ? "default" : "outline"} className="mt-4 w-full">
                <Link to="/tokens">Buy pack</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20">
        <h2 className="text-3xl font-semibold sm:text-4xl">Questions about the platform</h2>
        <Accordion type="single" collapsible className="mt-6">
          {faqs.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q}>
              <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="bg-brand relative overflow-hidden rounded-3xl p-10 text-center text-primary-foreground shadow-lift sm:p-16">
          <Lock className="mx-auto size-6 opacity-80" />
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Your next answer is one question away
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm opacity-90">
            Post it for free, or attach tokens to reach a verified expert faster.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/ask">
                <MessageSquare className="size-4" /> Ask a question
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/become-expert">Become an expert</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
