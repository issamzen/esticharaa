import { useEffect, type ReactNode } from "react";
import { localeDirection, type Locale } from "@/i18n/config";

export function LocaleBoundary({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  useEffect(() => {
    const direction = localeDirection(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    document.documentElement.dataset.locale = locale;
    document.body.dir = direction;
  }, [locale]);

  return children;
}
