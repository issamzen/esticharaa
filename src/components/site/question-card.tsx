import { Link } from "@tanstack/react-router";
import { Eye, Lock, MessageSquare, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { Question } from "@/data/platform";
import { formatDate } from "@/i18n/format";
import { localizeQuestion } from "@/i18n/platform";
import { useLocale } from "@/i18n/use-locale";
import { usePageCopy } from "@/i18n/page-copy";

export function QuestionCard({ question }: { question: Question }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const copy = usePageCopy();
  const item = localizeQuestion(question, locale);

  return (
    <Link
      to="/questions/$questionId"
      params={{ questionId: item.id }}
      className="group relative block overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-secondary/35 hover:shadow-lift sm:p-6"
    >
      <div className="absolute inset-x-0 top-0 h-0.5 origin-start scale-x-0 bg-gradient-to-r from-secondary to-accent transition-transform duration-300 group-hover:scale-x-100" />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="rounded-full">
          {item.category}
        </Badge>
        {item.tokens > 0 ? (
          <Badge className="rounded-full bg-accent text-accent-foreground">
            <Lock className="size-3" />
            {t("pricing.packTokens", { count: item.tokens })}
          </Badge>
        ) : (
          <Badge variant="outline" className="rounded-full">
            {t("common.free")}
          </Badge>
        )}
        {item.trending ? (
          <Badge
            variant="outline"
            className="rounded-full border-secondary/25 text-secondary"
          >
            <Sparkles className="size-3" /> {copy.questions.filters.trending}
          </Badge>
        ) : null}
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug transition-colors group-hover:text-primary sm:text-xl">
        {item.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {item.preview}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MessageSquare className="size-3.5 text-secondary" />
          {t("questions.answerCount", { count: item.answers })}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Eye className="size-3.5" />
          {t("questions.details.views", { count: item.views })}
        </span>
        <time className="ms-auto" dateTime={item.createdAt}>
          {formatDate(item.createdAt, locale)}
        </time>
      </div>
    </Link>
  );
}
