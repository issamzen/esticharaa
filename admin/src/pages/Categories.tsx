import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { ArrowRight, Loader2 } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { usePageCopy } from "@/i18n/page-copy";
import { createPageSeo, pageHead } from "@/i18n/route-meta";
import { formatNumber } from "@/i18n/format";
import { useLocale } from "@/i18n/use-locale";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/categories")({
  loader: ({ context }) => ({ seo: createPageSeo(context.localeRouting.getLocale(), "categories") }),
  head: ({ loaderData }) => pageHead(loaderData?.seo),
  component: CategoriesPage,
});

type DbCategory = {
  id: string; slug: string; name_ar: string; name_fr: string; name_en: string; icon: string; sort: number;
  description_ar: string; description_fr: string; description_en: string; min_reward_tokens: number;
  question_count: number; answer_count: number; expert_count: number;
};
type VisibleCategory = { slug:string; name:string; description:string; icon:string; questions:number; answers:number; experts:number; minimum:number };

function CategoriesPage() {
  const copy = usePageCopy().categories;
  const locale = useLocale();
  const [dbRows,setDbRows]=useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.rpc("get_public_categories").then(({ data, error }) => {
      if (!error && data && data.length > 0) setDbRows(data as DbCategory[]);
      setLoading(false);
    });
  }, []);

  function withCount(template: string, value: number) {
    return template.replace("{{count}}", formatNumber(value, locale));
  }

  const visible:VisibleCategory[]=dbRows.map(row=>({slug:row.slug,name:locale==="fr"&&row.name_fr?row.name_fr:locale==="en"&&row.name_en?row.name_en:row.name_ar,description:locale==="fr"?row.description_fr:locale==="en"?row.description_en:row.description_ar,icon:row.icon||"Sparkles",questions:Number(row.question_count)||0,answers:Number(row.answer_count)||0,experts:Number(row.expert_count)||0,minimum:row.min_reward_tokens||0}));

  return (
    <SiteLayout>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        {loading && <div className="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> تحميل التصنيفات…</div>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((category) => {
            const Icon = (Icons[category.icon as keyof typeof Icons] ?? Icons.Sparkles) as Icons.LucideIcon;
            return (
              <Link key={category.slug} to="/questions" search={{ category: category.slug }} className="premium-card group relative overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:border-secondary/35 hover:shadow-lift">
                <div className="absolute -end-12 -top-12 size-36 rounded-full bg-secondary/10 blur-2xl transition group-hover:bg-secondary/20" />
                <div className="relative flex items-start justify-between gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground"><Icon className="size-5" /></span><ArrowRight data-directional className="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" /></div>
                <h2 className="relative mt-5 text-lg font-semibold">{category.name}</h2>
                {category.description && <p className="relative mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{category.description}</p>}
                <p className="relative mt-3 text-sm text-muted-foreground">{withCount(copy.questions, category.questions)} · {withCount(copy.answers, category.answers)}</p>
                <div className="relative mt-4 flex items-center justify-between gap-2"><p className="text-xs font-semibold text-secondary">{withCount(copy.experts, category.experts)}</p>{category.minimum>0&&<span className="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-semibold text-accent-foreground">{category.minimum} tokens min.</span>}</div>
              </Link>
            );
          })}
        </div>
        {!loading&&visible.length===0&&<div className="premium-card mt-6 py-16 text-center text-sm text-muted-foreground">لا توجد تصنيفات منشورة حاليًا.</div>}
      </section>
    </SiteLayout>
  );
}
