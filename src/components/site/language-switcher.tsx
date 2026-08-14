import { useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, Globe2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { localeConfig, SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import { localizePublicHref } from "@/i18n/routing";
import { useLocale } from "@/i18n/use-locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const META: Record<Locale,{flag:string;short:string;description:string}> = {
  ar:{flag:"🇲🇦",short:"AR",description:"العربية"},
  fr:{flag:"🇫🇷",short:"FR",description:"Français"},
  en:{flag:"🇬🇧",short:"EN",description:"English"},
};

export function LanguageSwitcher({compact=false,onLocaleChange}:{compact?:boolean;onLocaleChange?:(locale:Locale)=>void}) {
  const {t,i18n}=useTranslation();const locale=useLocale();const location=useLocation();const navigate=useNavigate();
  const[pending,setPending]=useState(false);const[open,setOpen]=useState(false);
  async function switchTo(next:Locale){if(next===locale||pending){setOpen(false);return}setPending(true);try{const href=localizePublicHref(location.publicHref,next);await i18n.changeLanguage(next);await navigate({href});onLocaleChange?.(next);setOpen(false)}finally{setPending(false)}}

  if(!compact)return <div className="rounded-2xl border border-border/60 bg-muted/25 p-1.5 shadow-inner" role="group" aria-label={t("language.label")}><div className="grid grid-cols-3 gap-1">{SUPPORTED_LOCALES.map(item=>{const active=item===locale;return <button key={item} disabled={pending} onClick={()=>void switchTo(item)} lang={item} dir={localeConfig[item].dir} className={`relative flex flex-col items-center rounded-xl px-3 py-3 transition-all ${active?"bg-background text-foreground shadow-md ring-1 ring-border/60":"text-muted-foreground hover:bg-background/60 hover:text-foreground"}`}><span className="text-xl leading-none">{META[item].flag}</span><span className="mt-2 text-xs font-bold">{META[item].description}</span>{active&&<span className="absolute end-2 top-2 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-2.5"/></span>}</button>})}</div></div>;

  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button variant="ghost" className="group h-10 gap-2 rounded-xl border border-border/50 bg-background/55 px-2.5 shadow-sm backdrop-blur transition hover:border-primary/25 hover:bg-background" aria-label={t("language.label")}><span className="grid size-6 place-items-center rounded-lg bg-primary/8 text-sm">{META[locale].flag}</span><span className="hidden text-xs font-bold text-foreground 2xl:inline">{META[locale].short}</span>{pending?<Loader2 className="size-3 animate-spin text-primary"/>:<ChevronDown className={`size-3 text-muted-foreground transition-transform ${open?"rotate-180":""}`}/>}</Button></PopoverTrigger><PopoverContent align="end" sideOffset={10} className="w-64 rounded-2xl border-border/60 p-2 shadow-2xl"><div className="mb-1 flex items-center gap-2 px-2 py-2"><span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary"><Globe2 className="size-4"/></span><div><p className="text-xs font-bold">{t("language.label")}</p><p className="text-[10px] text-muted-foreground">اختر لغة الواجهة</p></div></div><div className="space-y-1">{SUPPORTED_LOCALES.map(item=>{const active=item===locale;return <button key={item} disabled={pending} onClick={()=>void switchTo(item)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition ${active?"bg-primary/8 text-primary":"hover:bg-muted"}`}><span className="text-xl">{META[item].flag}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{META[item].description}</span><span className="block text-[10px] uppercase tracking-wider text-muted-foreground">{META[item].short}</span></span>{active&&<span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-3"/></span>}</button>})}</div></PopoverContent></Popover>;
}
