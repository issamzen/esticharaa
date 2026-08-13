import type { LocationRewrite } from "@tanstack/react-router";
import {
  DEFAULT_LOCALE,
  isLocale,
  localeConfig,
  type Locale,
} from "@/i18n/config";

const STORAGE_KEY = "estichara.locale";
const COOKIE_NAME = "estichara_locale";

let activeLocale: Locale = DEFAULT_LOCALE;

export function localeFromPathname(pathname: string): Locale | null {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return isLocale(firstSegment) ? firstSegment : null;
}

export function getActiveLocale(): Locale {
  return activeLocale;
}

export function setActiveLocale(locale: Locale) {
  activeLocale = locale;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.cookie = `${COOKIE_NAME}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    document.documentElement.lang = locale;
    document.documentElement.dir = localeConfig[locale].dir;
    document.documentElement.dataset.locale = locale;
    if (document.body) document.body.dir = localeConfig[locale].dir;
  }
}

export function localizePublicHref(href: string, locale: Locale): string {
  const url = new URL(href, "https://estichara.local");
  const segments = url.pathname.split("/").filter(Boolean);

  if (isLocale(segments[0])) {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }

  url.pathname = `/${segments.join("/")}`;
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Run once, before createRouter(), so / and legacy unprefixed links become /ar. */
export function ensureLocalePrefix() {
  if (
    typeof window === "undefined" ||
    localeFromPathname(window.location.pathname)
  ) {
    return;
  }

  const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const localizedHref = localizePublicHref(currentHref, DEFAULT_LOCALE);
  window.history.replaceState(window.history.state, "", localizedHref);
}

/**
 * Keeps the existing internal route tree unchanged:
 *   internal /questions -> public /ar/questions, /fr/questions, /en/questions
 *
 * Requires a TanStack Router version that supports the `rewrite` option.
 */
export const localeRewrite: LocationRewrite = {
  input: ({ url }) => {
    const segments = url.pathname.split("/").filter(Boolean);
    const locale = isLocale(segments[0]) ? segments[0] : DEFAULT_LOCALE;

    setActiveLocale(locale);

    if (isLocale(segments[0])) {
      const routePath = segments.slice(1).join("/");
      url.pathname = routePath ? `/${routePath}` : "/";
    }

    return url;
  },
  output: ({ url }) => {
    const segments = url.pathname.split("/").filter(Boolean);

    // Avoid a duplicate prefix if a full public href is passed to navigate().
    if (isLocale(segments[0])) {
      segments.shift();
    }

    const routePath = segments.join("/");
    url.pathname = `/${getActiveLocale()}${routePath ? `/${routePath}` : ""}`;
    return url;
  },
};
