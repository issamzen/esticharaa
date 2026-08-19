import { useEffect,useMemo,useState,type ChangeEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2,Search,ShieldCheck } from "lucide-react";
import { SiteLayout,PageHeader } from "@/components/site/layout";
import { ExpertCard,type PublicExpert } from "@/components/site/expert-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePageCopy } from "@/i18n/page-copy";
import { createPageSeo,pageHead } from "@/i18n/route-meta";
import { supabase } from "@/lib/supabase";
import { useSiteSettings } from "@/lib/site-settings";

export const Route=createFileRoute("/experts/")({loader:({context})=>({seo:createPageSeo(context.localeRouting.getLocale(),"experts")}),head:({loaderData})=>pageHead(loaderData?.seo),component:ExpertsPage});
function ExpertsPage(){const copy=usePageCopy().experts;const site=useSiteSettings();const[rows,setRows]=useState<PublicExpert[]>([]);const[loading,setLoading]=useState(true);const[query,setQuery]=useState("");const[profession,setProfession]=useState(copy.all);const[verifiedOnly,setVerifiedOnly]=useState(false);
 useEffect(()=>{supabase.rpc("get_public_experts",{p_limit:200}).then(({data})=>{setRows((data as PublicExpert[])??[]);setLoading(false)})},[]);
 const professions=useMemo(()=>[copy.all,...new Set(rows.map(x=>x.specialization).filter(Boolean))],[copy.all,rows]);
 const visible=useMemo(()=>{const q=query.toLocaleLowerCase();return rows.filter(x=>(profession===copy.all||x.specialization===profession)&&(!verifiedOnly||x.verified)&&[x.full_name,x.title,x.city,x.specialization].some(v=>(v||"").toLocaleLowerCase().includes(q)))},[rows,profession,verifiedOnly,query,copy.all]);
 if(site.loaded&&site.features["expert_applications"]===false)return <SiteLayout><div className="mx-auto max-w-xl px-4 py-32 text-center"><ShieldCheck className="mx-auto size-12 text-primary"/><h1 className="mt-5 text-3xl font-semibold">{copy.title}</h1><p className="mt-3 text-muted-foreground">دليل الخبراء غير متاح حاليًا.</p></div></SiteLayout>;
 return <SiteLayout><PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description}><div className="relative max-w-xl"><Search className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={query} onChange={(e:ChangeEvent<HTMLInputElement>)=>setQuery(e.target.value)} placeholder={copy.search} className="h-12 rounded-full bg-background/80 ps-11 shadow-soft"/></div></PageHeader><section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16"><div className="flex flex-wrap gap-2">{professions.map(item=><Button key={item} size="sm" variant={profession===item?"default":"outline"} className="rounded-full" onClick={()=>setProfession(item)}>{item}</Button>)}<Button size="sm" variant={verifiedOnly?"default":"outline"} className="rounded-full" onClick={()=>setVerifiedOnly(!verifiedOnly)}><ShieldCheck className="size-3.5"/>{copy.verifiedOnly}</Button></div>{loading?<div className="grid min-h-48 place-items-center"><Loader2 className="size-7 animate-spin text-primary"/></div>:<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visible.map(expert=><ExpertCard key={expert.user_id} expert={expert}/>)}</div>}{!loading&&visible.length===0&&<div className="premium-card mt-8 py-16 text-center text-sm text-muted-foreground">{copy.empty}</div>}</section></SiteLayout>}
