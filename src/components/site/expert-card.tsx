import { Link } from "@tanstack/react-router";
import { BadgeCheck, Clock, Coins, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { Expert } from "@/data/platform";
import { formatNumber } from "@/i18n/format";
import { localizeExpert } from "@/i18n/platform";
import { useLocale } from "@/i18n/use-locale";

export function ExpertCard({ expert }: { expert: Expert }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const item = localizeExpert(expert, locale);

  return (
    <Link
      to="/experts/$expertSlug"
      params={{ expertSlug: item.slug }}
      className="group relative block overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-secondary/35 hover:shadow-lift sm:p-6"
    >
      <div className="absolute -end-12 -top-12 size-32 rounded-full bg-secondary/10 blur-2xl transition group-hover:bg-secondary/20" />
      <div className="relative flex items-start gap-4">
        <span className="bg-brand grid size-14 shrink-0 place-items-center rounded-2xl text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/15">
          {item.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold group-hover:text-primary">
              {item.name}
            </h3>
            {item.verified ? (
              <BadgeCheck className="size-4 shrink-0 fill-secondary text-primary-foreground" />
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {item.title} · {item.city}
          </p>
          <Badge variant="secondary" className="mt-2 rounded-full">
            {item.specialization}
          </Badge>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Star className="size-3.5 fill-accent text-accent" /> {item.rating}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Coins className="size-3.5 text-secondary" />
          {formatNumber(item.tokens, locale)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" /> {item.responseTime}
        </span>
      </div>
      <span className="sr-only">{t("experts.viewProfile")}</span>
    </Link>
  );
}
