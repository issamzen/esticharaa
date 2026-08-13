import type { Locale } from "@/i18n/config";
import { getPageCopy } from "@/i18n/page-copy";

export type SeoPage =
  | "about"
  | "ask"
  | "becomeExpert"
  | "blog"
  | "categories"
  | "contact"
  | "experts"
  | "questions"
  | "pricing"
  | "tokens";

export function createPageSeo(locale: Locale, page: SeoPage) {
  const copy = getPageCopy(locale)[page];
  return {
    title: `${copy.title} — Estichara.ma`,
    description: copy.description,
    locale,
  };
}

export function pageHead(seo?: ReturnType<typeof createPageSeo>) {
  return {
    meta: [
      { title: seo?.title ?? "Estichara.ma" },
      { name: "description", content: seo?.description ?? "" },
      { property: "og:title", content: seo?.title ?? "Estichara.ma" },
      { property: "og:description", content: seo?.description ?? "" },
      {
        property: "og:locale",
        content:
          seo?.locale === "ar"
            ? "ar_MA"
            : seo?.locale === "fr"
              ? "fr_MA"
              : "en_US",
      },
    ],
  };
}
