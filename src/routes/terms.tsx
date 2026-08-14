import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/legal-page";
import { termsContent } from "@/i18n/legal-content";
import { useLocale } from "@/i18n/use-locale";

export const Route=createFileRoute("/terms")({
 loader:({context})=>{const locale=context.localeRouting.getLocale();return{locale,content:termsContent[locale]}},
 head:({loaderData})=>({meta:[{title:`${loaderData?.content.title??"Terms of Service"} — Estichara.ma`},{name:"description",content:loaderData?.content.intro??"Estichara.ma terms of service"}]}),
 component:TermsPage,
});
function TermsPage(){const locale=useLocale();return <LegalPage content={termsContent[locale]}/>}
