import { Link } from "@tanstack/react-router";
import { BadgeCheck, Clock, Coins, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Expert } from "@/data/platform";

export function ExpertCard({ expert }: { expert: Expert }) {
  return (
    <Link
      to="/experts/$expertSlug"
      params={{ expertSlug: expert.slug }}
      className="group block rounded-2xl border border-border/70 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="flex items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-lg font-semibold text-primary-foreground">
          {expert.initials}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold group-hover:text-primary">{expert.name}</h3>
            {expert.verified ? <BadgeCheck className="size-4 shrink-0 text-secondary" /> : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {expert.title} · {expert.city}
          </p>
          <Badge variant="secondary" className="mt-2">
            {expert.specialization}
          </Badge>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Star className="size-3.5 text-accent" /> {expert.rating}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Coins className="size-3.5" /> {expert.tokens.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" /> {expert.responseTime}
        </span>
      </div>
    </Link>
  );
}