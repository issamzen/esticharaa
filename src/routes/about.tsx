import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, HeartHandshake, Sparkles, Users, ExternalLink } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { usePageCopy } from "@/i18n/page-copy";
import { createPageSeo, pageHead } from "@/i18n/route-meta";
import { useLocale } from "@/i18n/use-locale";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/about")({
  loader: ({ context }) => ({ seo: createPageSeo(context.localeRouting.getLocale(), "about") }),
  head: ({ loaderData }) => pageHead(loaderData?.seo),
  component: AboutPage,
});

type AboutLocale={eyebrow:string;title:string;description:string;mission_title:string;mission_text:string;vision_title:string;vision_text:string;team_title:string;team_description:string;partners_title:string};
type TeamMember={id:string;name:string;role_ar:string;role_fr:string;role_en:string;image_url:string};
type Partner={id:string;name:string;logo_url:string;website:string};
type AboutCms={ar:AboutLocale;fr:AboutLocale;en:AboutLocale;team:TeamMember[];partners:Partner[]};
const fallbackTeam=[{name:"Anas Berrada",initials:"AB"},{name:"Sara Lahlou",initials:"SL"},{name:"Omar Idrissi",initials:"OI"},{name:"Rim Cherkaoui",initials:"RC"}];

function AboutPage(){
 const copy=usePageCopy().about;const locale=useLocale();const[cms,setCms]=useState<AboutCms|null>(null);
 useEffect(()=>{supabase.from("settings").select("value").eq("key","page_about").single().then(({data})=>{if(data?.value)setCms(data.value as AboutCms)})},[]);
 const c=cms?.[locale];
 const content={eyebrow:c?.eyebrow||copy.eyebrow,title:c?.title||copy.title,description:c?.description||copy.description,missionTitle:c?.mission_title||copy.missionTitle,missionText:c?.mission_text||copy.missionText,visionTitle:c?.vision_title||copy.visionTitle,visionText:c?.vision_text||copy.visionText,teamTitle:c?.team_title||copy.teamTitle,teamDescription:c?.team_description||copy.teamDescription,partnersTitle:c?.partners_title||copy.partnersTitle};
 const members=cms?.team?.length?cms.team.map((m,index)=>({name:m.name,initials:m.name.split(" ").map(x=>x[0]).slice(0,2).join(""),image_url:m.image_url,role:locale==="ar"?m.role_ar:locale==="fr"?m.role_fr:m.role_en||copy.teamRoles[index]||""})):fallbackTeam.map((m,index)=>({...m,image_url:"",role:copy.teamRoles[index]||""}));
 const partners=cms?.partners?.length?cms.partners:copy.partners.map((name,index)=>({id:`fallback-${index}`,name,logo_url:"",website:""}));
 return <SiteLayout><PageHeader eyebrow={content.eyebrow} title={content.title} description={content.description}/><section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
  <div className="grid gap-5 lg:grid-cols-2">{[{icon:HeartHandshake,title:content.missionTitle,text:content.missionText},{icon:Eye,title:content.visionTitle,text:content.visionText}].map((item,index)=><article key={item.title} className={`premium-card relative overflow-hidden p-7 sm:p-9 ${index===0?"bg-primary text-primary-foreground":""}`}><div className="absolute -end-16 -top-16 size-48 rounded-full bg-accent/15 blur-3xl"/><item.icon className={`relative size-7 ${index===0?"text-accent":"text-secondary"}`}/><h2 className="relative mt-8 text-2xl font-semibold">{item.title}</h2><p className={`relative mt-4 max-w-xl whitespace-pre-line text-sm leading-7 ${index===0?"text-primary-foreground/75":"text-muted-foreground"}`}>{item.text}</p></article>)}</div>
  <div className="mt-20"><p className="eyebrow inline-flex items-center gap-2"><Users className="size-4"/>{content.teamTitle}</p><h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">{content.teamDescription}</h2></div>
  <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{members.map(member=><article key={member.name} className="premium-card group p-6 text-center transition duration-300 hover:-translate-y-1 hover:shadow-lift">{member.image_url?<img src={member.image_url} alt={member.name} className="mx-auto size-20 rounded-3xl object-cover shadow-lg"/>:<span className="bg-brand mx-auto grid size-16 place-items-center rounded-3xl text-lg font-semibold text-primary-foreground shadow-lg">{member.initials}</span>}<h3 className="mt-5 font-semibold">{member.name}</h3><p className="mt-1 text-xs text-muted-foreground">{member.role}</p></article>)}</div>
  <div className="mt-20"><p className="eyebrow inline-flex items-center gap-2"><Sparkles className="size-4 text-accent"/>{content.partnersTitle}</p><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{partners.map(partner=>{const box=<>{partner.logo_url?<img src={partner.logo_url} alt={partner.name} className="max-h-12 max-w-[9rem] object-contain"/>:<span>{partner.name}</span>}{partner.website&&<ExternalLink className="absolute end-3 top-3 size-3 text-muted-foreground/50"/>}</>;return partner.website?<a key={partner.id} href={partner.website} target="_blank" rel="noreferrer" className="premium-card relative grid min-h-24 place-items-center px-5 text-center text-sm font-medium text-muted-foreground transition hover:-translate-y-0.5 hover:text-primary">{box}</a>:<div key={partner.id} className="premium-card relative grid min-h-24 place-items-center px-5 text-center text-sm font-medium text-muted-foreground">{box}</div>})}</div></div>
 </section></SiteLayout>
}
