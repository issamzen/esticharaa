// Use `head: homeHead` in createFileRoute("/") for localized SEO metadata.

import { i18n } from "@/i18n";
import { getActiveLocale } from "@/i18n/routing";
import { localizedSeoLinks, ogLocale } from "@/i18n/seo";

export function homeHead() {
  const locale = getActiveLocale();
  const t = i18n.getFixedT(locale);

  return {
    meta: [
      { title: t("meta.homeTitle") },
      { name: "description", content: t("meta.homeDescription") },
      { property: "og:title", content: t("meta.homeTitle") },
      { property: "og:description", content: t("meta.ogDescription") },
      { property: "og:locale", content: ogLocale(locale) },
      ...(["ar", "fr", "en"] as const)
        .filter((item) => item !== locale)
        .map((item) => ({
          property: "og:locale:alternate",
          content: ogLocale(item),
        })),
    ],
    links: [
      {
        rel: "canonical",
        href: `https://estichara.ma/${locale}`,
      },
      ...localizedSeoLinks("/"),
    ],
  };
}
