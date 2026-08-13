import type { LocationRewrite } from "@tanstack/react-router";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";

export type LocaleRouting = {
  rewrite: LocationRewrite;
  getLocale: () => Locale;
  getCanonicalHref: () => string | null;
};

/**
 * A request-scoped locale controller. It keeps the existing internal route tree
 * (/questions) while exposing /ar/questions, /fr/questions and /en/questions.
 */
export function createLocaleRouting(): LocaleRouting {
  let activeLocale: Locale = DEFAULT_LOCALE;
  let canonicalHref: string | null = null;

  const rewrite: LocationRewrite = {
    input: ({ url }) => {
      const segments = url.pathname.split("/").filter(Boolean);
      const first = segments[0];

      if (isLocale(first)) {
        activeLocale = first;
        canonicalHref = null;
        const internalPath = segments.slice(1).join("/");
        url.pathname = internalPath ? `/${internalPath}` : "/";
      } else {
        activeLocale = DEFAULT_LOCALE;
        const suffix = url.pathname === "/" ? "" : url.pathname;
        canonicalHref = `/${DEFAULT_LOCALE}${suffix}${url.search}${url.hash}`;
      }

      return url;
    },
    output: ({ url }) => {
      const segments = url.pathname.split("/").filter(Boolean);
      if (isLocale(segments[0])) segments.shift();
      const internalPath = segments.join("/");
      url.pathname = `/${activeLocale}${internalPath ? `/${internalPath}` : ""}`;
      return url;
    },
  };

  return {
    rewrite,
    getLocale: () => activeLocale,
    getCanonicalHref: () => canonicalHref,
  };
}

export function localizePublicHref(href: string, locale: Locale) {
  const url = new URL(href, "https://estichara.local");
  const segments = url.pathname.split("/").filter(Boolean);

  if (isLocale(segments[0])) segments[0] = locale;
  else segments.unshift(locale);

  url.pathname = `/${segments.join("/")}`;
  return `${url.pathname}${url.search}${url.hash}`;
}
