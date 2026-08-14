import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/legal-page";
import { privacyContent } from "@/i18n/legal-content";
import { useLocale } from "@/i18n/use-locale";

export const Route=createFileRoute("/privacy")({
 loader:({context})=>{const locale=context.localeRouting.getLocale();return{locale,content:privacyContent[locale]}},
 head:({loaderData})=>({meta:[{title:`${loaderData?.content.title??"Privacy Policy"} — Estichara.ma`},{name:"description",content:loaderData?.content.intro??"Estichara.ma privacy policy"}]}),
 component:PrivacyPage,
});
function PrivacyPage(){const locale=useLocale();return <LegalPage content={privacyContent[locale]}/>}
