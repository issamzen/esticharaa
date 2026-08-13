import { localeConfig, SUPPORTED_LOCALES, type Locale } from "@/i18n/config";

const SITE_URL = "https://estichara.ma";

export function localizedSeoLinks(pathname: string) {
  const cleanPath = pathname === "/" ? "" : pathname;

  return [
    ...SUPPORTED_LOCALES.map((locale) => ({
      rel: "alternate" as const,
      hrefLang: locale,
      href: `${SITE_URL}/${locale}${cleanPath}`,
    })),
    {
      rel: "alternate" as const,
      hrefLang: "x-default",
      href: `${SITE_URL}/ar${cleanPath}`,
    },
  ];
}

export function ogLocale(locale: Locale) {
  return localeConfig[locale].ogLocale;
}
