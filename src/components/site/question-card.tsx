import { Link } from "@tanstack/react-router";
import { Eye, MessageSquare, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Question } from "@/data/platform";

export function QuestionCard({ question }: { question: Question }) {
  return (
    <Link
      to="/questions/$questionId"
      params={{ questionId: question.id }}
      className="group block rounded-2xl border border-border/70 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{question.category}</Badge>
        {question.tokens > 0 ? (
          <Badge className="bg-accent text-accent-foreground">
            <Lock className="size-3" /> {question.tokens} tokens
          </Badge>
        ) : (
          <Badge variant="outline">Free</Badge>
        )}
        {question.trending ? (
          <Badge variant="outline" className="text-secondary">
            <Sparkles className="size-3" /> Trending
          </Badge>
        ) : null}
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
        {question.title}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{question.preview}</p>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MessageSquare className="size-3.5" /> {question.answers} answers
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Eye className="size-3.5" /> {question.views.toLocaleString()} views
        </span>
        <span className="ml-auto">{question.createdAt}</span>
      </div>
    </Link>
  );
}