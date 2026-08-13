import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/i18n/config";
import {
  getActiveLocale,
  localeFromPathname,
  setActiveLocale,
} from "@/i18n/routing";
import { ar } from "@/i18n/locales/ar";
import { fr } from "@/i18n/locales/fr";
import { en } from "@/i18n/locales/en";
import type { Locale } from "@/i18n/config";

export const resources = {
  ar: { translation: ar },
  fr: { translation: fr },
  en: { translation: en },
} as const;

const initialLocale =
  typeof window === "undefined"
    ? getActiveLocale()
    : (localeFromPathname(window.location.pathname) ?? DEFAULT_LOCALE);

setActiveLocale(initialLocale);

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: initialLocale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    defaultNS: "translation",
    ns: ["translation"],
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
    load: "currentOnly",
    // Bundled resources make synchronous startup safe and avoid a first-frame flash.
    initAsync: false,
  });
}

export async function changeLocale(locale: Locale) {
  setActiveLocale(locale);
  await i18n.changeLanguage(locale);
}

export { i18n };
