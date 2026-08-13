import { createInstance, type i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import { ar } from "@/i18n/locales/ar";
import { fr } from "@/i18n/locales/fr";
import { en } from "@/i18n/locales/en";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "@/i18n/config";

export const resources = {
  ar: { translation: ar },
  fr: { translation: fr },
  en: { translation: en },
} as const;

/** A fresh instance is created for every TanStack Start router/request. */
export function createI18n(locale: Locale = DEFAULT_LOCALE): I18nInstance {
  const instance = createInstance();

  void instance.use(initReactI18next).init({
    resources,
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    defaultNS: "translation",
    ns: ["translation"],
    interpolation: { escapeValue: false },
    returnNull: false,
    load: "currentOnly",
    initAsync: false,
  });

  return instance;
}
