import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Lock,
  MessageSquare,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
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
import { useLocale } from "@/i18n/use-locale";
import { formatNumber } from "@/i18n/format";
import {
  getCategoryLabel,
  getHomeFaqs,
  getHomeFeatures,
  getHomeSteps,
  getHomeStories,
  getTokenPackLabel,
} from "@/i18n/home-content";
import { categories, experts, questions, tokenPacks } from "@/data/platform";
import { useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    const locale = context.localeRouting.getLocale();
    const translate = context.i18n.getFixedT(locale);
    return {
      title: translate("meta.homeTitle"),
      description: translate("meta.homeDescription"),
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.title ?? "Estichara.ma" },
      { name: "description", content: loaderData?.description ?? "" },
      { property: "og:title", content: loaderData?.title ?? "Estichara.ma" },
      { property: "og:description", content: loaderData?.description ?? "" },
    ],
  }),
  component: Index,
});

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
      <ArrowRight
        data-directional
        className="size-4 transition-transform group-hover:translate-x-1"
      />
    </Link>
  );
}

type HomeCategory={slug:string;name_ar:string;name_fr:string;name_en:string;icon:string;question_count:number};
type HomeLiveQuestion = {
  id: string;
  slug: string;
  title: string;
  body: string;
  tokens: number;
  unlock_cost: number;
  views: number;
  answers_count: number;
  created_at: string;
  category_name_ar: string | null;
};

function Index() {
  const { t } = useTranslation();
  const site=useSiteSettings();
  const [liveQuestions,setLiveQuestions]=useState<HomeLiveQuestion[]>([]);
  const [homeCategories,setHomeCategories]=useState<HomeCategory[]>([]);
  const categoryRail=useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("@/lib/supabase").then(({ supabase }) => {
      supabase
        .rpc("get_public_questions", { p_limit: 4 })
        .then(({data})=>setLiveQuestions((data as unknown as HomeLiveQuestion[])??[]));
      supabase.rpc("get_public_categories").then(({data})=>setHomeCategories(((data as HomeCategory[])??[]).slice(0,9)));
    });
  }, []);
  const features = getHomeFeatures(t);
  const steps = getHomeSteps(t);
  const localizedStories = getHomeStories(t);
  const localizedFaqs = getHomeFaqs(t);
  const locale=useLocale();
  const expertsEnabled=site.features["expert_applications"]!==false;
  const visibleFeatures=expertsEnabled?features:features.filter((_,index)=>index!==0);
  const visibleSteps=expertsEnabled?steps:steps.map((step,index)=>index===1?{...step,title:locale==="ar"?"شارك السؤال مع المجتمع":locale==="fr"?"Partagez avec la communauté":"Share with the community",text:locale==="ar"?"يمكن لأي عضو مسجل مشاركة خبرته، وتظهر الإجابات بعد مراجعة الإدارة.":locale==="fr"?"Tout membre inscrit peut contribuer; les réponses sont publiées après modération.":"Any registered member can contribute; answers appear after moderation."}:step);
  const categoryStrip=homeCategories.length?homeCategories.map(item=>({slug:item.slug,name:locale==="fr"&&item.name_fr?item.name_fr:locale==="en"&&item.name_en?item.name_en:item.name_ar,icon:item.icon||"Sparkles",count:Number(item.question_count)||0})):categories.slice(0,9).map((item,index)=>({slug:item.slug,name:getCategoryLabel(t,index,item.name),icon:item.icon,count:item.questions}));
  function slideCategories(direction:1|-1){const amount=Math.min(420,Math.round((categoryRail.current?.clientWidth??320)*.72));categoryRail.current?.scrollBy({left:direction*amount*(locale==="ar"?-1:1),behavior:"smooth"})}
  const stats=[{value:"12.4k+",label:t("home.stats.answers")},...(expertsEnabled?[{value:"640+",label:t("home.stats.experts")}]:[]),{value:"3h 12m",label:t("home.stats.response")},{value:"4.9/5",label:t("home.stats.rating")}];

  return (
    <SiteLayout>
      {/* Featured categories directly below the header */}
      <section className="sticky top-[4.5rem] z-40 overflow-hidden border-b border-border/60 bg-background/82 shadow-[0_12px_35px_rgba(13,75,75,.08)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/72">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent"/>
        <div className="pointer-events-none absolute -start-20 -top-20 size-48 rounded-full bg-secondary/10 blur-3xl"/>
        <div className="relative mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6">
          <div className="flex shrink-0 items-center gap-2 pe-1 text-xs font-bold text-foreground sm:pe-2"><span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/20"><Sparkles className="size-3.5"/></span><span className="hidden xl:inline">{locale==="ar"?"استكشف التصنيفات":locale==="fr"?"Explorer":"Explore"}</span></div>
          <div className="relative flex min-w-0 flex-1 items-center gap-1">
            <button type="button" onClick={()=>slideCategories(-1)} aria-label={locale==="ar"?"التصنيفات السابقة":"Previous categories"} className="grid size-8 shrink-0 place-items-center rounded-xl border border-border/60 bg-background/90 text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-primary-foreground active:scale-90"><ChevronLeft className="size-4 rtl:rotate-180"/></button>
            <div className="pointer-events-none absolute inset-y-0 start-9 z-10 w-7 bg-gradient-to-e from-transparent to-background/90"/>
            <div ref={categoryRail} className="no-scrollbar flex min-w-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto px-2 py-1 scroll-smooth">{categoryStrip.map(category=>{const Icon=(Icons[category.icon as keyof typeof Icons]??Icons.Sparkles) as Icons.LucideIcon;return <Link key={category.slug} to="/questions" search={{category:category.slug}} className="group inline-flex shrink-0 snap-start items-center gap-2 rounded-2xl border border-border/60 bg-background/80 px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary hover:text-primary-foreground hover:shadow-lg"><span className="grid size-7 place-items-center rounded-lg bg-primary/8 text-primary transition group-hover:bg-white/15 group-hover:text-primary-foreground"><Icon className="size-3.5"/></span><span>{category.name}</span><span className="hidden rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-normal text-muted-foreground group-hover:bg-white/15 group-hover:text-primary-foreground/75 sm:inline">{formatNumber(category.count,locale)}</span></Link>})}</div>
            <div className="pointer-events-none absolute inset-y-0 end-9 z-10 w-7 bg-gradient-to-s from-transparent to-background/90"/>
            <button type="button" onClick={()=>slideCategories(1)} aria-label={locale==="ar"?"المزيد من التصنيفات":"More categories"} className="grid size-8 shrink-0 place-items-center rounded-xl border border-border/60 bg-background/90 text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-primary-foreground active:scale-90"><ChevronRight className="size-4 rtl:rotate-180"/></button>
          </div>
          <Link to="/categories" className="shrink-0 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-[10px] font-bold text-primary shadow-sm transition hover:bg-primary hover:text-primary-foreground">{locale==="ar"?"الكل":locale==="fr"?"Tout":"All"}</Link>
        </div>
      </section>

      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-border/60">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 opacity-45 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
          style={{
            backgroundImage:
              "radial-gradient(var(--border) 1px, transparent 1px)",
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

        <div className={`mx-auto grid max-w-6xl gap-14 px-4 py-16 sm:py-24 lg:items-center lg:gap-16 lg:py-28 ${expertsEnabled?"lg:grid-cols-[1.08fr_.92fr]":"place-items-center"}`}>
          <div className={`min-w-0 ${expertsEnabled?"":"mx-auto max-w-3xl text-center"}`}>
            <Badge
              variant="outline"
              className="rounded-full border-primary/20 bg-background/70 px-3 py-1.5 shadow-sm backdrop-blur-md"
            >
              <span className="me-1.5 inline-flex size-5 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="size-3 text-primary" />
              </span>
              {expertsEnabled?t("home.badge"):(locale==="ar"?"مجتمع مغربي للأسئلة والأجوبة":locale==="fr"?"Communauté marocaine de questions-réponses":"Moroccan question-and-answer community")}
            </Badge>

            <h1 className="mt-7 max-w-3xl text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.035em] sm:text-6xl lg:text-[4.25rem]">
              {t("home.heroTitleBefore")}{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                {t("home.heroTitleAccent")}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              {expertsEnabled?t("home.heroDescription"):(locale==="ar"?"اطرح سؤالك مجانًا، وشارك المعرفة، واحصل على إجابات مفيدة من أعضاء المجتمع بعد مراجعتها لضمان الجودة.":locale==="fr"?"Posez votre question gratuitement, partagez vos connaissances et recevez des réponses utiles de la communauté après modération.":"Ask for free, share knowledge, and receive helpful community answers after moderation.")}
            </p>

            <div className="mt-8 max-w-xl rounded-2xl border border-border/70 bg-background/85 p-2 shadow-xl shadow-primary/5 backdrop-blur-xl">
              <div className="flex items-center gap-3 rounded-xl ps-3">
                <Search className="size-5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground sm:text-base">
                  {t("home.heroPrompt")}
                </span>
                <Button asChild size="lg" className="shrink-0 rounded-xl px-5">
                  <Link to="/ask">
                    {t("home.askNow")}{" "}
                    <ArrowRight data-directional className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <Link
                to="/questions"
                className="group inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-primary"
              >
                {t("home.browseRealQuestions")}
                <ArrowRight
                  data-directional
                  className="size-4 transition-transform group-hover:translate-x-1"
                />
              </Link>
              {site.features["expert_applications"]!==false&&<Link to="/become-expert" className="font-medium text-muted-foreground transition-colors hover:text-foreground">{t("home.joinAsExpert")}</Link>}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {[t("home.assuranceNoSubscription"),t("home.assurancePrivate"),...(expertsEnabled?[t("home.assuranceVerified")]:[])].map((item)=>( 
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" /> {item}
                </span>
              ))}
            </div>
          </div>

          {/* Expert preview is hidden while the expert program is disabled. */}
          {expertsEnabled&&<div className="relative mx-auto w-full min-w-0 max-w-lg lg:mx-0">
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
                    {t("home.expertOnline")}
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary" className="rounded-full">
                      {t("home.previewCategory")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {t("home.askedMinutesAgo", { count: 18 })}
                    </span>
                  </div>

                  <h2 className="mt-4 text-balance text-xl font-semibold leading-snug sm:text-2xl">
                    {t("home.previewQuestion")}
                  </h2>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MessageSquare className="size-3.5" />{" "}
                      {t("home.answerCount", { count: 3 })}
                    </span>
                    <span className="size-1 rounded-full bg-border" />
                    <span>{t("home.premiumQuestion")}</span>
                  </div>

                  <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground shadow-sm">
                        {t("home.sampleExpertInitials")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-semibold">
                            {t("home.sampleExpertName")}
                          </p>
                          <BadgeCheck className="size-4 shrink-0 fill-primary text-primary-foreground" />
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {t("home.sampleExpertRole")}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs font-medium">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />{" "}
                        4.9
                      </div>
                    </div>

                    <div className="relative mt-4 overflow-hidden">
                      <p className="text-sm leading-6 text-foreground/80">
                        {t("home.sampleAnswer")}
                      </p>
                      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card/95 to-transparent" />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t("home.fullExpertAnswer")}
                        </p>
                        <p className="text-sm font-semibold">
                          {t("pricing.packTokens", { count: 24 })}
                        </p>
                      </div>
                      <Button asChild size="sm" className="rounded-lg">
                        <Link to="/questions">
                          {t("home.previewAnswer")}{" "}
                          <ArrowRight data-directional className="size-3.5" />
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
                <p className="text-xs font-semibold">
                  {t("home.verifiedProfessionals", { count: 640 })}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t("home.professionals")}
                </p>
              </div>
            </div>

            <div className="absolute -bottom-5 right-5 hidden items-center gap-2 rounded-xl border border-border/70 bg-background/90 px-3 py-2.5 shadow-lg backdrop-blur-xl sm:flex">
              <span className="grid size-8 place-items-center rounded-lg bg-accent/15 text-accent-foreground">
                <Clock3 className="size-4" />
              </span>
              <div>
                <p className="text-xs font-semibold">
                  {t("home.fastResponse")}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t("home.medianTime", { time: "3h 12m" })}
                </p>
              </div>
            </div>
          </div>}
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-12 sm:pb-16">
          <div className={`grid grid-cols-2 divide-x divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-background/60 backdrop-blur-md sm:divide-y-0 ${expertsEnabled?"sm:grid-cols-4":"sm:grid-cols-3"}`}>
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
          eyebrow={t("home.why.eyebrow")}
          title={t("home.why.title")}
          description={t("home.why.description")}
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-6">
          {visibleFeatures.map((feature,index)=>( 
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
            eyebrow={t("home.how.eyebrow")}
            title={t("home.how.title")}
            description={t("home.how.description")}
            action={
              <TextLink to="/questions">{t("home.how.seeOthers")}</TextLink>
            }
          />

          <div className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <div
              aria-hidden="true"
              className="absolute left-[12.5%] right-[12.5%] top-6 hidden border-t border-dashed border-primary/30 lg:block"
            />
            {visibleSteps.map((step) => (
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
                {t("home.how.firstQuestion")}{" "}
                <ArrowRight data-directional className="size-4" />
              </Link>
            </Button>
            {site.tokenProgram.mode==="full"&&<Button asChild size="lg" variant="outline" className="rounded-xl bg-background"><Link to="/pricing">{t("home.how.explorePricing")}</Link></Button>}
          </div>
        </div>
      </section>

      {/* Trending questions */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <SectionHeading
          eyebrow={t("home.explore.eyebrow")}
          title={t("home.explore.title")}
          description={t("home.explore.description")}
          action={
            <TextLink to="/questions">
              {t("home.explore.allQuestions")}
            </TextLink>
          }
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {liveQuestions.length > 0
            ? liveQuestions.map((q) => (
                <Link
                  key={q.id}
                  to="/questions/$questionId"
                  params={{ questionId: q.slug || q.id }}
                  className="group relative block overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-secondary/35 hover:shadow-xl sm:p-6"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {q.category_name_ar ? (
                      <Badge variant="secondary" className="rounded-full">
                        {q.category_name_ar}
                      </Badge>
                    ) : null}
                    {site.tokenProgram.mode==="full" && q.unlock_cost > 0 ? (
                      <Badge className="rounded-full bg-accent text-accent-foreground">
                        <Lock className="size-3" /> {q.unlock_cost}{" "}
                        {t("common.tokens")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full">
                        {t("common.free")}
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
                    {q.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {q.body}
                  </p>
                  <div className="mt-5 flex items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MessageSquare className="size-3.5 text-secondary" />{" "}
                      {q.answers_count}
                    </span>
                  </div>
                </Link>
              ))
            : questions.slice(0, 4).map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
        </div>
      </section>

      {/* Expert information follows the administration feature switch. */}
      {expertsEnabled&&<section className="relative overflow-hidden border-y border-border/60 bg-card/40">
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 size-80 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <SectionHeading
            eyebrow={t("home.expertSection.eyebrow")}
            title={t("home.expertSection.title")}
            description={t("home.expertSection.description")}
            action={
              <TextLink to="/experts">
                {t("home.expertSection.directory")}
              </TextLink>
            }
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
                {t("home.expertSection.verificationTitle")}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("home.expertSection.verificationText")}
              </p>
            </div>
          </div>
        </div>
      </section>}

      {/* Expert testimonials are hidden with the expert program. */}
      {expertsEnabled&&<section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <SectionHeading
            eyebrow={t("home.stories.eyebrow")}
            title={t("home.stories.title")}
            description={t("home.stories.description")}
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {localizedStories.map((story, index) => (
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
      </section>}

      {/* Pricing */}
      {site.tokenProgram.mode==="full"&&<section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <SectionHeading
          eyebrow={t("home.pricing.eyebrow")}
          title={t("home.pricing.title")}
          description={t("home.pricing.description")}
          action={
            <TextLink to="/pricing">{t("home.pricing.howTokensWork")}</TextLink>
          }
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-start">
          {tokenPacks.map((pack, index) => (
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
                  <Sparkles className="me-1 size-3" />{" "}
                  {t("home.pricing.mostPopular")}
                </Badge>
              ) : null}
              <h3 className="text-sm font-semibold text-muted-foreground">
                {getTokenPackLabel(t, index, pack.name)}
              </h3>
              <div className="mt-5 flex items-end gap-2">
                <p className="text-4xl font-semibold tracking-tight">
                  {formatNumber(pack.tokens, locale)}
                </p>
                <p className="pb-1 text-sm text-muted-foreground">
                  {t("common.tokens")}
                </p>
              </div>
              <p className="mt-5 text-xl font-semibold">
                {formatNumber(pack.price, locale)} {t("common.mad")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("home.pricing.oneTimePayment")}
              </p>
              <div className="my-5 h-px bg-border/70" />
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary" />{" "}
                  {t("home.pricing.neverExpires")}
                </p>
                <p className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary" />{" "}
                  {t("home.pricing.secureCheckout")}
                </p>
              </div>
              <Button
                asChild
                variant={pack.popular ? "default" : "outline"}
                className="mt-6 w-full rounded-xl"
              >
                <Link to="/tokens">{t("home.pricing.choosePack")}</Link>
              </Button>
            </article>
          ))}
        </div>
      </section>}

      {/* FAQ */}
      <section className="border-t border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:py-28 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t("home.faq.eyebrow")}
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("home.faq.title")}
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              {t("home.faq.description")}
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-7 rounded-xl bg-background"
            >
              <Link to="/questions">{t("home.faq.browse")}</Link>
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {localizedFaqs.map((faq, index) => (
              <AccordionItem
                key={faq.q}
                value={`faq-${index}`}
                className="border-border/70"
              >
                <AccordionTrigger className="py-5 text-start text-base font-medium hover:no-underline hover:text-primary">
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
              {expertsEnabled?<Lock className="size-5"/>:<MessageSquare className="size-5"/>}
            </span>
            <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              {expertsEnabled?t("home.cta.title"):(locale==="ar"?"اسأل، أجب، وساعد المجتمع على النمو.":locale==="fr"?"Posez, répondez et faites grandir la communauté.":"Ask, answer, and help the community grow.")}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty leading-7 text-primary-foreground/75">
              {expertsEnabled?t("home.cta.description"):(locale==="ar"?"المنصة مجانية حاليًا. شارك سؤالك أو خبرتك، وتظهر الإجابات بعد مراجعة الإدارة.":locale==="fr"?"La plateforme est gratuite. Partagez votre question ou votre expérience; les réponses sont modérées avant publication.":"The platform is currently free. Share a question or your experience; answers are moderated before publication.")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-xl"
              >
                <Link to="/ask">
                  <MessageSquare className="size-4" /> {t("common.askQuestion")}
                </Link>
              </Button>
              {site.features["expert_applications"]!==false&&<Button asChild size="lg" variant="outline" className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"><Link to="/become-expert">{t("home.cta.becomeExpert")}</Link></Button>}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
