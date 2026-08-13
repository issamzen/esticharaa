import { useLayoutEffect, type ReactNode } from "react";
import { i18n } from "@/i18n";
import { getActiveLocale } from "@/i18n/routing";
import { useDocumentLocale } from "@/i18n/use-document-locale";

/** Place this once in the root route, around <Outlet />. */
export function LocaleBoundary({ children }: { children: ReactNode }) {
  const locale = getActiveLocale();

  // Bundled translations make this switch synchronous in practice. A layout effect
  // prevents an Arabic/English flash during client-side startup.
  useLayoutEffect(() => {
    if (i18n.resolvedLanguage !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale]);

  useDocumentLocale(locale);

  return children;
}
