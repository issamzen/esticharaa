import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight,Eye,Lock,MessageSquare,Search,Users,X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/i18n/format";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePageCopy } from "@/i18n/page-copy";
import { createPageSeo, pageHead } from "@/i18n/route-meta";
import { useLocale } from "@/i18n/use-locale";
import { formatNumber } from "@/i18n/format";
import { useSiteSettings } from "@/lib/site-settings";

type SearchParams = { category?: string };
type Filter = "newest" | "trending" | "mostAnswered" | "premium" | "unresolved";
const filters: Filter[] = [
  "newest",
  "trending",
  "mostAnswered",
  "premium",
  "unresolved",
];

export const Route = createFileRoute("/questions/")({
  loader: ({ context }) => ({
    seo: createPageSeo(context.localeRouting.getLocale(), "questions"),
  }),
  head: ({ loaderData }) => pageHead(loaderData?.seo),
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  component: QuestionsPage,
});

type LiveQuestion = {
  id: string;
  slug: string;
  title: string;
  body: string;
  tokens: number;
  unlock_cost: number;
  views: number;
  answers_count: number;
  created_at: string;
  category_slug:string|null;
  category_name_ar:string|null;
  category_name_fr:string|null;
  category_name_en:string|null;
  target_audience_id:string|null;
};
type Audience = { id: string; label_ar: string; label_fr: string; label_en: string; active: boolean };

function QuestionsPage() {
  const { category } = Route.useSearch();
  const copy = usePageCopy().questions;
  const locale = useLocale();
  const { t } = useTranslation();
  const site=useSiteSettings();
  const [live,setLive]=useState<LiveQuestion[]>([]);
  const [audiences,setAudiences]=useState<Audience[]>([]);
  const [query,setQuery]=useState("");
  const [filter,setFilter]=useState<Filter>("newest");

  useEffect(() => {
    supabase
      .rpc("get_public_questions", { p_limit: 50 })
      .then(({ data }) => setLive((data as unknown as LiveQuestion[]) ?? []));
    supabase.from("settings").select("value").eq("key", "expert_audiences").single()
      .then(({ data }) => setAudiences(((data?.value as Audience[]) ?? []).filter((item) => item.active)));
  }, []);

  function normalizeSearch(value:string){return value.toLocaleLowerCase().normalize("NFD").replace(/[\u064B-\u065F\u0670]/g,"").trim()}
  const liveVisible=useMemo(()=>{const needle=normalizeSearch(query);let list=live.filter(q=>(!category||q.category_slug===category)&&(!needle||normalizeSearch(`${q.title} ${q.body}`).includes(needle)));if(filter==="trending")list=[...list].sort((a,b)=>b.views-a.views);if(filter==="mostAnswered")list=[...list].sort((a,b)=>b.answers_count-a.answers_count);if(filter==="premium")list=site.tokenProgram.mode==="full"?list.filter(q=>q.unlock_cost>0):[];if(filter==="unresolved")list=list.filter(q=>q.answers_count===0);if(filter==="newest")list=[...list].sort((a,b)=>b.created_at.localeCompare(a.created_at));return list},[live,category,query,filter,site.tokenProgram.mode]);
  const suggestions=useMemo(()=>{const needle=normalizeSearch(query);if(needle.length<2)return[];return live.filter(q=>(!category||q.category_slug===category)&&normalizeSearch(`${q.title} ${q.body}`).includes(needle)).slice(0,6)},[live,category,query]);
  function audienceLabel(id:string|null){if(!id)return locale==="ar"?"كل المشاركين":locale==="fr"?"Toute la communauté":"All contributors";const item=audiences.find(audience=>audience.id===id);return item?(locale==="fr"?item.label_fr:locale==="en"?item.label_en:item.label_ar):id}
  function localizedCategoryName(q:LiveQuestion){return locale==="fr"&&q.category_name_fr?q.category_name_fr:locale==="en"&&q.category_name_en?q.category_name_en:q.category_name_ar??""}
  const activeCategoryName=category?localizedCategoryName(live.find(q=>q.category_slug===category)??({category_name_ar:category,category_name_fr:category,category_name_en:category} as LiveQuestion)):"";
  function highlightedTitle(title:string){const needle=query.trim();if(!needle)return title;const index=title.toLocaleLowerCase().indexOf(needle.toLocaleLowerCase());if(index<0)return title;return <>{title.slice(0,index)}<mark className="rounded bg-accent/25 px-0.5 text-foreground">{title.slice(index,index+needle.length)}</mark>{title.slice(index+needle.length)}</>}



  return (
    <SiteLayout>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      >
        <div className="max-w-xl"><div className="relative"><Search className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={query} onChange={(event:ChangeEvent<HTMLInputElement>)=>setQuery(event.target.value)} placeholder={activeCategoryName?(locale==="ar"?`ابحث داخل ${activeCategoryName}…`:locale==="fr"?`Rechercher dans ${activeCategoryName}…`:`Search in ${activeCategoryName}…`):copy.search} className="h-12 rounded-full bg-background/85 pe-11 ps-11 shadow-soft"/>{query&&<button onClick={()=>setQuery("")} className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-muted"><X className="size-4"/></button>}</div>{suggestions.length>0&&<div className="mt-2 overflow-hidden rounded-2xl border border-border/60 bg-background/95 p-2 shadow-2xl backdrop-blur-xl">{suggestions.map(item=><Link key={item.id} to="/questions/$questionId" params={{questionId:item.slug||item.id}} className="group flex items-center gap-3 rounded-xl p-3 text-start transition hover:bg-muted"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary"><MessageSquare className="size-4"/></span><span className="min-w-0 flex-1"><span className="line-clamp-1 text-sm font-semibold group-hover:text-primary">{highlightedTitle(item.title)}</span><span className="mt-1 block text-[10px] text-muted-foreground">{localizedCategoryName(item)} · {item.answers_count} {locale==="ar"?"إجابة":"answers"}</span></span><ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100"/></Link>)}</div>}</div>
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={filter === item ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setFilter(item)}
            >
              {copy.filters[item]}
            </Button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {/* Real questions from the community (database) */}
          {liveVisible.map((q) => (
            <Link
              key={q.id}
              to="/questions/$questionId"
              params={{ questionId: q.slug || q.id }}
              className="group relative block overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-secondary/35 hover:shadow-lift sm:p-6"
            >
              <div className="absolute inset-x-0 top-0 h-0.5 origin-start scale-x-0 bg-gradient-to-r from-secondary to-accent transition-transform duration-300 group-hover:scale-x-100" />
              <div className="flex flex-wrap items-center gap-2">
                {localizedCategoryName(q)?<Badge variant="secondary" className="rounded-full">{localizedCategoryName(q)}</Badge>:null}
                <Badge variant="outline" className="rounded-full border-secondary/35 bg-secondary/5">
                  <Users className="size-3" /> {audienceLabel(q.target_audience_id)}
                </Badge>
                {site.tokenProgram.mode==="full" && q.unlock_cost > 0 ? (
                  <Badge className="rounded-full bg-accent text-accent-foreground">
                    <Lock className="size-3" /> {q.unlock_cost} {t("common.tokens")}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="rounded-full">
                    {t("common.free")}
                  </Badge>
                )}
              </div>
              <h3 className="mt-4 text-lg font-semibold leading-snug transition-colors group-hover:text-primary sm:text-xl">
                {q.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {q.body}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-secondary" />
                  {q.answers_count}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="size-3.5" /> {q.views}
                </span>
                <span className="ms-auto">{formatDate(q.created_at, locale)}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border/60 bg-muted/35 px-4 py-5 text-center text-sm text-muted-foreground">
          {liveVisible.length===0?copy.empty:copy.showing.replace("{{visible}}",formatNumber(liveVisible.length,locale)).replace("{{total}}",formatNumber(live.filter(q=>!category||q.category_slug===category).length,locale))}
        </div>
      </section>
    </SiteLayout>
  );
}
