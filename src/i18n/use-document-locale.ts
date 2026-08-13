import { useEffect } from "react";
import { localeConfig, type Locale } from "@/i18n/config";

export function useDocumentLocale(locale: Locale) {
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = localeConfig[locale].dir;
    root.dataset.locale = locale;

    // Useful for direction-aware selectors and portal content.
    document.body.dir = localeConfig[locale].dir;
  }, [locale]);
}
