export const SUPPORTED_LOCALES = ["ar", "fr", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ar";

export const localeConfig: Record<
  Locale,
  {
    label: string;
    nativeLabel: string;
    dir: "rtl" | "ltr";
    intl: string;
    ogLocale: string;
  }
> = {
  ar: {
    label: "Arabic",
    nativeLabel: "العربية",
    dir: "rtl",
    intl: "ar-MA",
    ogLocale: "ar_MA",
  },
  fr: {
    label: "French",
    nativeLabel: "Français",
    dir: "ltr",
    intl: "fr-MA",
    ogLocale: "fr_MA",
  },
  en: {
    label: "English",
    nativeLabel: "English",
    dir: "ltr",
    intl: "en-MA",
    ogLocale: "en_US",
  },
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale)
  );
}

export function localeDirection(locale: Locale) {
  return localeConfig[locale].dir;
}
