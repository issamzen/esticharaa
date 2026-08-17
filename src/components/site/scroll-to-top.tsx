import { useEffect,useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLocale } from "@/i18n/use-locale";

export function ScrollToTop(){
 const[visible,setVisible]=useState(false);const[progress,setProgress]=useState(0);const locale=useLocale();
 useEffect(()=>{let frame=0;const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const top=window.scrollY;const total=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);setVisible(top>420);setProgress(Math.min(1,top/total))})};update();window.addEventListener("scroll",update,{passive:true});window.addEventListener("resize",update);return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",update);window.removeEventListener("resize",update)}},[]);
 function goTop(){const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;window.scrollTo({top:0,behavior:reduce?"auto":"smooth"})}
 const label=locale==="ar"?"العودة إلى الأعلى":locale==="fr"?"Retour en haut":"Back to top";
 const circumference=2*Math.PI*22;
 return <button type="button" onClick={goTop} aria-label={label} title={label} className={`group fixed end-4 z-[55] grid size-13 place-items-center rounded-2xl border border-border/60 bg-background/82 text-primary shadow-2xl shadow-primary/15 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-primary hover:text-primary-foreground active:scale-90 md:end-6 ${visible?"bottom-24 translate-y-0 opacity-100 md:bottom-6":"pointer-events-none bottom-20 translate-y-5 opacity-0 md:bottom-2"}`}>
  <svg className="pointer-events-none absolute inset-0 size-full -rotate-90" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="22" fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth="2"/><circle cx="26" cy="26" r="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference*(1-progress)} className="transition-[stroke-dashoffset] duration-150"/></svg>
  <ArrowUp className="relative size-5 transition-transform duration-300 group-hover:-translate-y-0.5"/>
  <span className="pointer-events-none absolute end-0 top-1/2 hidden -translate-y-1/2 translate-x-[calc(100%+0.6rem)] whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-[10px] font-semibold text-background opacity-0 shadow-lg transition group-hover:opacity-100 rtl:end-auto rtl:start-0 rtl:-translate-x-[calc(100%+0.6rem)] md:block">{label}</span>
 </button>;
}
