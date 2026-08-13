import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock3,
  Coins,
  Lock,
  MessageSquare,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
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
import {
  categories,
  experts,
  faqs,
  questions,
  stories,
  tokenPacks,
} from "@/data/platform";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estichara.ma — Trusted answers from real experts" },
      {
        name: "description",
        content:
          "Morocco's trusted question and answer marketplace. Get practical answers from verified professionals and people with real-life experience.",
      },
      {
        property: "og:title",
        content: "Estichara.ma — Trusted answers from real experts",
      },
      {
        property: "og:description",
        content:
          "Ask with confidence. Get clear, practical answers from verified Moroccan experts.",
      },
    ],
  }),
  component: Index,
});

const features = [
  {
    icon: BadgeCheck,
    eyebrow: "Trust",
    title: "Expertise you can verify",
    text: "Every professional badge is backed by identity, credentials, and a human review — never a self-declared title.",
    span: "lg:col-span-3",
  },
  {
    icon: Coins,
    eyebrow: "Fair pricing",
    title: "Only pay for useful answers",
    text: "Preview every response first. Unlock only the answers that are relevant to you, with no recurring subscription.",
    span: "lg:col-span-3",
  },
  {
    icon: Zap,
    eyebrow: "Fast",
    title: "Qualified answers in hours",
    text: "Most premium questions receive their first expert response in under four hours.",
    span: "lg:col-span-2",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Protected",
    title: "A safer place to ask",
    text: "Content is moderated before publication. Private details stay private, and every review comes from a real unlock.",
    span: "lg:col-span-4",
  },
];

const steps = [
  {
    number: "01",
    title: "Describe what you need",
    text: "Add context, choose a category, and attach any helpful files.",
  },
  {
    number: "02",
    title: "Get matched with experts",
    text: "Relevant, qualified professionals are invited to answer your question.",
  },
  {
    number: "03",
    title: "Preview, then unlock",
    text: "Compare answer previews and spend tokens only on what looks useful.",
  },
  {
    number: "04",
    title: "Rate your experience",
    text: "Review the expert on clarity, knowledge, helpfulness, and speed.",
  },
];

const stats = [
  { value: "12.4k+", label: "answers published" },
  { value: "640+", label: "verified experts" },
  { value: "3h 12m", label: "median response" },
  { value: "4.9/5", label: "average rating" },
];

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-xl text-pretty leading-7 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

type HomeTextLink = "/questions" | "/experts" | "/categories" | "/pricing";

function TextLink({ to, children }: { to: HomeTextLink; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
    >
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

function Index() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-border/60">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 opacity-45 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute -left-40 -top-40 -z-10 size-[32rem] rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -right-40 top-10 -z-10 size-[34rem] rounded-full bg-accent/15 blur-3xl"
        />

        <div className="mx-auto grid max-w-6xl gap-14 px-4 py-16 sm:py-24 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-16 lg:py-28">
          <div>
            <Badge
              variant="outline"
              className="rounded-full border-primary/20 bg-background/70 px-3 py-1.5 shadow-sm backdrop-blur-md"
            >
              <span className="mr-1.5 inline-flex size-5 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="size-3 text-primary" />
              </span>
              Morocco&apos;s trusted knowledge marketplace
            </Badge>

            <h1 className="mt-7 max-w-3xl text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.035em] sm:text-6xl lg:text-[4.25rem]">
              A better answer starts with the{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                right person.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Ask with confidence. Get clear, practical guidance from verified
              professionals and people with real-world experience.
            </p>

            <div className="mt-8 max-w-xl rounded-2xl border border-border/70 bg-background/85 p-2 shadow-xl shadow-primary/5 backdrop-blur-xl">
              <div className="flex items-center gap-3 rounded-xl pl-3">
                <Search className="size-5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground sm:text-base">
                  What would you like expert help with?
                </span>
                <Button asChild size="lg" className="shrink-0 rounded-xl px-5">
                  <Link to="/ask">
                    Ask now <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <Link
                to="/questions"
                className="group inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-primary"
              >
                Browse real questions
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/become-expert"
                className="font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Join as an expert
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {[
                "No subscription",
                "Private by design",
                "Human-verified experts",
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" /> {item}
                </span>
              ))}
            </div>
          </div>

          {/* Product preview */}
          <div className="relative mx-auto w-full max-w-lg lg:mx-0">
            <div
              aria-hidden="true"
              className="absolute inset-x-8 inset-y-10 -z-10 rounded-[2rem] bg-primary/20 blur-3xl"
            />

            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-background/90 p-3 shadow-2xl shadow-foreground/10 backdrop-blur-xl dark:border-white/10">
              <div className="rounded-[1.25rem] border border-border/70 bg-card">
                <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <span className="size-2.5 rounded-full bg-destructive/55" />
                    <span className="size-2.5 rounded-full bg-accent/65" />
                    <span className="size-2.5 rounded-full bg-primary/55" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Expert online
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary" className="rounded-full">
                      Business &amp; Legal
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Asked 18 min ago
                    </span>
                  </div>

                  <h2 className="mt-4 text-balance text-xl font-semibold leading-snug sm:text-2xl">
                    What is the best legal structure for starting a small agency
                    in Morocco?
                  </h2>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MessageSquare className="size-3.5" /> 3 answers
                    </span>
                    <span className="size-1 rounded-full bg-border" />
                    <span>Premium question</span>
                  </div>

                  <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground shadow-sm">
                        NB
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-semibold">
                            Nadia Berrada
                          </p>
                          <BadgeCheck className="size-4 shrink-0 fill-primary text-primary-foreground" />
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          Corporate lawyer · Casablanca
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs font-medium">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />{" "}
                        4.9
                      </div>
                    </div>

                    <div className="relative mt-4 overflow-hidden">
                      <p className="text-sm leading-6 text-foreground/80">
                        For a small service agency, an SARL AU is often the most
                        practical choice because it separates personal and
                        company liability while…
                      </p>
                      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card/95 to-transparent" />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Full expert answer
                        </p>
                        <p className="text-sm font-semibold">24 tokens</p>
                      </div>
                      <Button asChild size="sm" className="rounded-lg">
                        <Link to="/questions">
                          Preview answer <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -left-7 top-20 hidden items-center gap-2 rounded-xl border border-border/70 bg-background/90 px-3 py-2.5 shadow-lg backdrop-blur-xl sm:flex">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-4" />
              </span>
              <div>
                <p className="text-xs font-semibold">640+ verified</p>
                <p className="text-[10px] text-muted-foreground">
                  professionals
                </p>
              </div>
            </div>

            <div className="absolute -bottom-5 right-5 hidden items-center gap-2 rounded-xl border border-border/70 bg-background/90 px-3 py-2.5 shadow-lg backdrop-blur-xl sm:flex">
              <span className="grid size-8 place-items-center rounded-lg bg-accent/15 text-accent-foreground">
                <Clock3 className="size-4" />
              </span>
              <div>
                <p className="text-xs font-semibold">Fast response</p>
                <p className="text-[10px] text-muted-foreground">
                  median 3h 12m
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-12 sm:pb-16">
          <div className="grid grid-cols-2 divide-x divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-background/60 backdrop-blur-md sm:grid-cols-4 sm:divide-y-0">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 py-5 text-center sm:px-6">
                <p className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value proposition */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Why Estichara"
          title="Built for decisions that deserve a trustworthy answer"
          description="The speed of the internet, with the confidence of knowing exactly who is answering you."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-6">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={`${feature.span} group relative min-h-64 overflow-hidden rounded-3xl border border-border/70 bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5 sm:p-8`}
            >
              <div
                aria-hidden="true"
                className={`absolute -right-16 -top-16 size-48 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-100 ${
                  index % 2 === 0 ? "bg-primary/10" : "bg-accent/10"
                }`}
              />
              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl border border-primary/10 bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {feature.eyebrow}
                  </span>
                </div>
                <div className="mt-auto pt-10">
                  <h3 className="text-xl font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                    {feature.text}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <SectionHeading
            eyebrow="How it works"
            title="From question to clarity in four simple steps"
            description="No complicated plans or long-term commitment. Start free and unlock only what helps."
            action={<TextLink to="/questions">See how others ask</TextLink>}
          />

          <div className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <div
              aria-hidden="true"
              className="absolute left-[12.5%] right-[12.5%] top-6 hidden border-t border-dashed border-primary/30 lg:block"
            />
            {steps.map((step) => (
              <article key={step.number} className="relative">
                <div className="relative z-10 grid size-12 place-items-center rounded-full border border-primary/20 bg-background text-xs font-semibold text-primary shadow-sm">
                  {step.number}
                </div>
                <h3 className="mt-6 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.text}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl">
              <Link to="/ask">
                Ask your first question <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-xl bg-background"
            >
              <Link to="/pricing">Explore token pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trending questions */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Explore"
          title="Questions people are asking now"
          description="Discover practical conversations across business, law, health, careers, technology, and everyday life."
          action={<TextLink to="/questions">View all questions</TextLink>}
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {questions.slice(0, 4).map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      </section>

      {/* Experts */}
      <section className="relative overflow-hidden border-y border-border/60 bg-card/40">
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 size-80 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <SectionHeading
            eyebrow="Meet the experts"
            title="Real people. Proven experience."
            description="Profiles show credentials, specialties, response times, and reviews so you can choose with confidence."
            action={<TextLink to="/experts">Browse the directory</TextLink>}
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {experts.slice(0, 3).map((expert) => (
              <ExpertCard key={expert.slug} expert={expert} />
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 backdrop-blur sm:w-fit">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">
                Verification is handled by people, not algorithms.
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Identity and credentials are reviewed before a professional
                badge is issued.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Categories"
          title="Find expertise for every part of life"
          action={
            <TextLink to="/categories">Explore all 20 categories</TextLink>
          }
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => {
            const Icon = (Icons[category.icon as keyof typeof Icons] ??
              Icons.Sparkles) as Icons.LucideIcon;

            return (
              <Link
                key={category.slug}
                to="/questions"
                search={{ category: category.slug }}
                className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {category.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {category.questions.toLocaleString()} questions
                  </span>
                </span>
                <ArrowRight className="size-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <SectionHeading
            eyebrow="Success stories"
            title="Useful answers create real momentum"
            description="A trusted perspective can save hours of research, prevent an expensive mistake, or simply make the next step clearer."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {stories.map((story, index) => (
              <figure
                key={story.name}
                className={`relative flex min-h-64 flex-col overflow-hidden rounded-3xl border p-7 sm:p-8 ${
                  index === 0
                    ? "border-primary/20 bg-primary text-primary-foreground"
                    : "border-border/70 bg-card"
                }`}
              >
                <Quote
                  className={`size-7 ${index === 0 ? "text-primary-foreground/55" : "text-primary/50"}`}
                />
                <blockquote className="mt-6 text-base leading-7">
                  {story.quote}
                </blockquote>
                <figcaption
                  className={`mt-auto pt-8 text-xs ${
                    index === 0
                      ? "text-primary-foreground/75"
                      : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`font-semibold ${
                      index === 0
                        ? "text-primary-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {story.name}
                  </span>{" "}
                  — {story.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Simple pricing"
          title="Buy tokens once. Use them whenever you need."
          description="No monthly fee and no expiring plan. Choose a pack, preview answers, and unlock only what helps."
          action={<TextLink to="/pricing">How tokens work</TextLink>}
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-start">
          {tokenPacks.map((pack) => (
            <article
              key={pack.name}
              className={`relative rounded-3xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                pack.popular
                  ? "border-primary shadow-xl shadow-primary/10 lg:-translate-y-3"
                  : "border-border/70 shadow-sm"
              }`}
            >
              {pack.popular ? (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 shadow-sm">
                  <Sparkles className="mr-1 size-3" /> Most popular
                </Badge>
              ) : null}
              <h3 className="text-sm font-semibold text-muted-foreground">
                {pack.name}
              </h3>
              <div className="mt-5 flex items-end gap-2">
                <p className="text-4xl font-semibold tracking-tight">
                  {pack.tokens.toLocaleString()}
                </p>
                <p className="pb-1 text-sm text-muted-foreground">tokens</p>
              </div>
              <p className="mt-5 text-xl font-semibold">{pack.price} MAD</p>
              <p className="mt-1 text-xs text-muted-foreground">
                One-time payment
              </p>
              <div className="my-5 h-px bg-border/70" />
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary" /> Never expires
                </p>
                <p className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary" /> Secure checkout
                </p>
              </div>
              <Button
                asChild
                variant={pack.popular ? "default" : "outline"}
                className="mt-6 w-full rounded-xl"
              >
                <Link to="/tokens">Choose this pack</Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:py-28 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              FAQ
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Questions about Estichara?
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Everything you need to know before asking your first question.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-7 rounded-xl bg-background"
            >
              <Link to="/questions">Browse all questions</Link>
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.q}
                value={`faq-${index}`}
                className="border-border/70"
              >
                <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline hover:text-primary">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="max-w-2xl pb-5 leading-7 text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-20 sm:pb-28">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-center text-primary-foreground shadow-2xl shadow-primary/20 sm:px-12 sm:py-20">
          <div
            aria-hidden="true"
            className="absolute -left-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-40 -right-20 size-96 rounded-full bg-accent/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              maskImage: "linear-gradient(to bottom, black, transparent)",
            }}
          />

          <div className="relative mx-auto max-w-2xl">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
              <Lock className="size-5" />
            </span>
            <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              The clarity you need could be one question away.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty leading-7 text-primary-foreground/75">
              Post for free, or add tokens to reach a verified expert faster.
              You stay in control from question to answer.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-xl"
              >
                <Link to="/ask">
                  <MessageSquare className="size-4" /> Ask a question
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              >
                <Link to="/become-expert">Become an expert</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
