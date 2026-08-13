import type { Locale } from "@/i18n/config";

/** Store authored platform content this way when it must exist in all languages. */
export type LocalizedText = Record<Locale, string>;

export function localizedText(
  value: LocalizedText,
  locale: Locale,
  fallback: Locale = "ar",
) {
  return value[locale] || value[fallback];
}

/**
 * User-generated questions and expert answers should keep their original text.
 * Store the author's language separately and show it in the UI. Machine or human
 * translations can be added later without overwriting the original.
 */
export type UserAuthoredText = {
  original: string;
  language: Locale;
  translations?: Partial<Record<Locale, string>>;
};

export function userAuthoredText(value: UserAuthoredText, locale: Locale) {
  return value.translations?.[locale] ?? value.original;
}
