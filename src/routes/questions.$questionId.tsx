import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Coins,
  Eye,
  Loader2,
  Lock,
  MessageSquare,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
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
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/questions/$questionId")({
  loader: ({ params, context }) => {
    // Demo questions keep working; real (database) questions are
    // fetched in the browser because unlock state depends on the user.
    const base = questions.find((item) => item.id === params.questionId);
    const question = base
      ? localizeQuestion(base, context.localeRouting.getLocale())
      : null;
    return { question, questionId: params.questionId };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.question
      ? [
          { title: `${loaderData.question.title} — Estichara.ma` },
          {
            name: "description",
            content: loaderData.question.body.slice(0, 155),
          },
        ]
      : [{ title: "Estichara.ma" }],
  }),
  component: QuestionDetail,
});

// ---------- Types for real database questions ----------
type DbAnswer = {
  id: string;
  body: string | null; // null = locked (server refused to send it)
  preview: string;
  is_best: boolean;
  created_at: string;
  expert_name: string;
  expert_title: string | null;
  expert_verified: boolean | null;
  expert_rating: number | null;
  expert_reviews: number | null;
};

type DbQuestion = {
  id: string;
  title: string;
  body: string;
  tokens: number;
  unlock_cost: number;
  question_locked: boolean;
  target_audience_id: string | null;
  views: number;
  tags: string[];
  created_at: string;
  category_name: string | null;
  asker_name: string | null;
  unlocked: boolean;
  answers: DbAnswer[];
};

function QuestionDetail() {
  const { question: demoQuestion, questionId } = Route.useLoaderData();
  if (demoQuestion) return <DemoQuestionDetail />;
  return <DbQuestionDetail questionId={questionId} />;
}

// ============================================================
// REAL QUESTIONS (from your Supabase database)
// ============================================================
function DbQuestionDetail({ questionId }: { questionId: string }) {
  const copy = usePageCopy().question;
  const { t } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [q, setQ] = useState<DbQuestion | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "notfound">("loading");
  const [unlocking, setUnlocking] = useState(false);

  async function load() {
    const { data, error } = await supabase.rpc("get_question_page", {
      p_question_id: questionId,
    });
    if (error || !data) {
      setState("notfound");
      return;
    }
    setQ(data as DbQuestion);
    setState("ready");
  }

  useEffect(() => {
    load();
    supabase.rpc("increment_question_views", { p_question_id: questionId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId, user?.id]);

  async function unlock() {
    if (!user) {
      toast.info(t("auth.signInDescription"));
      navigate({ to: "/auth" });
      return;
    }
    if ((profile?.tokens_balance ?? 0) < (q?.unlock_cost ?? 0)) {
      toast.error(
        t("question.notEnoughTokens", "رصيدك غير كافٍ — اشترِ توكن أولًا"),
      );
      navigate({ to: "/tokens" });
      return;
    }
    setUnlocking(true);
    const { error } = await supabase.rpc("unlock_question", {
      p_question_id: questionId,
    });
    setUnlocking(false);
    if (error) {
      toast.error(error.message.includes("INSUFFICIENT_TOKENS")
        ? t("question.notEnoughTokens", "رصيدك غير كافٍ")
        : error.message);
      return;
    }
    await refreshProfile();
    await load();
    toast.success(t("question.unlockedNow", "تم فتح الإجابات الكاملة! 🎉"));
  }

  if (state === "loading") {
    return (
      <SiteLayout>
        <div className="grid min-h-[50vh] place-items-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </SiteLayout>
    );
  }

  if (state === "notfound" || !q) {
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

  return (
    <SiteLayout>
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-wrap items-center gap-2">
          {q.category_name ? (
            <Badge variant="secondary" className="rounded-full">
              {q.category_name}
            </Badge>
          ) : null}
          <Badge
            variant={q.unlock_cost > 0 ? "default" : "outline"}
            className={
              q.unlock_cost > 0
                ? "rounded-full bg-accent text-accent-foreground"
                : "rounded-full"
            }
          >
            {q.unlock_cost > 0 ? (
              <>
                <Lock className="size-3" /> {q.unlock_cost} {t("common.tokens")}
              </>
            ) : (
              copy.free
            )}
          </Badge>
          <time className="text-xs text-muted-foreground" dateTime={q.created_at}>
            {formatDate(q.created_at, locale)}
          </time>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="size-3.5" /> {formatNumber(q.views, locale)}
          </span>
        </div>

        <h1 className="mt-5 text-balance text-3xl font-semibold leading-tight sm:text-4xl">
          {q.title}
        </h1>
        {q.asker_name ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {t("question.askedBy", "سأل")}: {q.asker_name}
          </p>
        ) : null}
        <p className="mt-5 whitespace-pre-line text-base leading-8 text-muted-foreground">
          {q.body}
        </p>
        {q.question_locked && (
          <div className="mt-5 rounded-2xl border border-accent/30 bg-accent/5 p-5 text-center">
            <Lock className="mx-auto size-5 text-accent" />
            <p className="mt-2 font-semibold">{t("question.signInForFullQuestion", "سجّل الدخول لقراءة السؤال كاملًا")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("question.guestPreviewOnly", "يظهر للزوار مقتطف فقط، بما في ذلك الأسئلة المجانية.")}</p>
            <Button asChild className="mt-3 rounded-xl"><Link to="/auth">{t("nav.signIn")}</Link></Button>
          </div>
        )}

        {q.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {q.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-full">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <h2 className="mt-12 flex items-center gap-2 text-xl font-semibold">
          <MessageSquare className="size-5 text-secondary" />
          {copy.answers.replace(
            "{{count}}",
            formatNumber(q.answers.length, locale),
          )}
        </h2>

        {q.answers.length === 0 && (
          <div className="premium-card mt-5 p-8 text-center text-sm text-muted-foreground">
            {t("question.noAnswers", "لا توجد إجابات معتمدة بعد — سيجيب الخبراء قريبًا")}
          </div>
        )}

        {q.answers.map((a) => (
          <section
            key={a.id}
            className={`premium-card relative mt-5 overflow-hidden p-5 sm:p-7 ${
              a.is_best ? "border-accent/60" : ""
            }`}
          >
            {a.is_best && (
              <Badge className="absolute -top-0 start-5 rounded-b-xl rounded-t-none bg-accent text-accent-foreground">
                <Star className="size-3" /> {t("question.bestAnswer", "أفضل إجابة")}
              </Badge>
            )}
            <div className="mt-2 flex items-center gap-3">
              <span className="bg-brand grid size-12 place-items-center rounded-2xl font-semibold text-primary-foreground">
                {a.expert_name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold">
                  <span className="truncate">{a.expert_name}</span>
                  {a.expert_verified ? (
                    <BadgeCheck className="size-4 text-secondary" />
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {a.expert_title}
                  {a.expert_rating ? (
                    <>
                      {" "}
                      · {a.expert_rating}{" "}
                      <Star className="inline size-3 fill-accent text-accent" />
                    </>
                  ) : null}
                </p>
              </div>
            </div>

            <div className="relative mt-6">
              {a.body ? (
                /* Free / unlocked → full answer */
                <p className="whitespace-pre-line text-sm leading-7">{a.body}</p>
              ) : (
                /* Locked → preview + paywall */
                <>
                  <p className="whitespace-pre-line text-sm leading-7">
                    {a.preview}
                  </p>
                  <p
                    aria-hidden
                    className="mt-3 select-none text-sm leading-7 blur-[6px]"
                  >
                    {copy.lockedSample}
                  </p>
                  <div className="absolute inset-x-0 bottom-0 top-10 flex items-end rounded-2xl bg-gradient-to-t from-card via-card/90 to-transparent">
                    <div className="glass w-full rounded-2xl p-5 text-center shadow-lift sm:p-6">
                      <Lock className="mx-auto size-5 text-accent" />
                      <p className="mt-3 font-semibold">
                        {copy.unlockTitle.replace("{{count}}", String(q.unlock_cost))}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {copy.unlockText}
                      </p>
                      {user && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {t("question.yourBalance", "رصيدك")}:{" "}
                          <b className="text-foreground">
                            {profile?.tokens_balance ?? 0}
                          </b>{" "}
                          {t("common.tokens")}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <Button
                          className="rounded-xl"
                          disabled={unlocking}
                          onClick={unlock}
                        >
                          {unlocking ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <>
                              <Coins className="size-4" /> {copy.unlock}
                            </>
                          )}
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
              )}
            </div>
          </section>
        ))}
      </article>
    </SiteLayout>
  );
}

// ============================================================
// DEMO QUESTIONS (original page, kept for the sample content)
// ============================================================
function DemoQuestionDetail() {
  const { question } = Route.useLoaderData() as {
    question: NonNullable<ReturnType<typeof localizeDemo>>;
  };
  const copy = usePageCopy().question;
  const locale = useLocale();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    if (user && question.tokens === 0) setUnlocked(true);
  }, [user, question.tokens]);
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
              <Eye className="size-3.5" /> {formatNumber(question.views, locale)}
            </span>
          </div>

          <h1 className="mt-5 text-balance text-3xl font-semibold leading-tight sm:text-5xl">
            {question.title}
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            {user ? question.body : `${question.body.slice(0, 180)}${question.body.length > 180 ? "…" : ""}`}
          </p>
          {!user && (
            <div className="mt-5 rounded-2xl border border-accent/30 bg-accent/5 p-5 text-center">
              <Lock className="mx-auto size-5 text-accent" />
              <p className="mt-2 font-semibold">سجّل الدخول لقراءة السؤال كاملًا</p>
              <Button asChild className="mt-3 rounded-xl"><Link to="/auth">تسجيل الدخول</Link></Button>
            </div>
          )}

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
                          onClick={() => user ? setUnlocked(true) : navigate({ to: "/auth" })}
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

function localizeDemo() {
  return questions[0] ? localizeQuestion(questions[0], "ar") : null;
}
