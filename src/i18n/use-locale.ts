import { useTranslation } from "react-i18next";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";

export function normalizeLocale(value?: string | null): Locale {
  const language = value?.split("-")[0];
  return isLocale(language) ? language : DEFAULT_LOCALE;
}

export function useLocale(): Locale {
  const { i18n } = useTranslation();
  return normalizeLocale(i18n.resolvedLanguage ?? i18n.language);
}
