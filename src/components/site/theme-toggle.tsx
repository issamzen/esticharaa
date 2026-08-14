import { useEffect, useState } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePageCopy } from "@/i18n/page-copy";

type ThemeMode="light"|"dark"|"system";
function resolve(mode:ThemeMode){return mode==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches:mode==="dark"}

export function ThemeToggle(){
 const copy=usePageCopy();const[mode,setModeState]=useState<ThemeMode>("light");const[dark,setDark]=useState(false);const[open,setOpen]=useState(false);
 function apply(next:ThemeMode){const isDark=resolve(next);setDark(isDark);document.documentElement.classList.toggle("dark",isDark);document.documentElement.style.colorScheme=isDark?"dark":"light"}
 useEffect(()=>{const stored=localStorage.getItem("estichara-theme") as ThemeMode|null;const initial=stored&&["light","dark","system"].includes(stored)?stored:"light";setModeState(initial);apply(initial);const media=window.matchMedia("(prefers-color-scheme: dark)");const changed=()=>{if((localStorage.getItem("estichara-theme")??"light")==="system")apply("system")};media.addEventListener("change",changed);return()=>media.removeEventListener("change",changed)},[]);
 function choose(next:ThemeMode){setModeState(next);localStorage.setItem("estichara-theme",next);apply(next);setOpen(false)}
 const options:[ThemeMode,string,typeof Sun][]=[["light","الوضع الفاتح",Sun],["dark","الوضع الليلي",Moon],["system","حسب الجهاز",Monitor]];
 return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button variant="ghost" size="icon" aria-label={dark?copy.theme.light:copy.theme.dark} className="relative size-10 overflow-hidden rounded-xl border border-border/50 bg-background/55 shadow-sm backdrop-blur transition hover:border-primary/25 hover:bg-background"><Sun className={`absolute size-4 text-amber-500 transition-all duration-300 ${dark?"-rotate-90 scale-0":"rotate-0 scale-100"}`}/><Moon className={`absolute size-4 text-sky-300 transition-all duration-300 ${dark?"rotate-0 scale-100":"rotate-90 scale-0"}`}/></Button></PopoverTrigger><PopoverContent align="end" sideOffset={10} className="w-56 rounded-2xl border-border/60 p-2 shadow-2xl"><p className="px-3 py-2 text-xs font-bold">مظهر الموقع</p><div className="space-y-1">{options.map(([id,label,Icon])=><button key={id} onClick={()=>choose(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${mode===id?"bg-primary/8 font-semibold text-primary":"text-muted-foreground hover:bg-muted hover:text-foreground"}`}><span className={`grid size-8 place-items-center rounded-lg ${id==="light"?"bg-amber-50 text-amber-600":id==="dark"?"bg-slate-800 text-sky-300":"bg-muted text-muted-foreground"}`}><Icon className="size-4"/></span><span className="flex-1 text-start">{label}</span>{mode===id&&<Check className="size-4"/>}</button>)}</div></PopoverContent></Popover>;
}
