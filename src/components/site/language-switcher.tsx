import { useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { localeConfig, SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import { changeLocale } from "@/i18n";
import { getActiveLocale, localizePublicHref } from "@/i18n/routing";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const currentLocale = getActiveLocale();

  async function handleChange(nextLocale: Locale) {
    if (nextLocale === currentLocale || pending) return;

    setPending(true);
    const nextHref = localizePublicHref(location.publicHref, nextLocale);

    try {
      await changeLocale(nextLocale);
      await navigate({ href: nextHref });
    } finally {
      setPending(false);
    }
  }

  if (compact) {
    return (
      <label className="relative inline-flex items-center">
        <span className="sr-only">{t("language.label")}</span>
        <Globe2 className="pointer-events-none absolute start-3 size-4 text-muted-foreground" />
        <select
          dir="ltr"
          value={currentLocale}
          disabled={pending}
          onChange={(event) => void handleChange(event.target.value as Locale)}
          className="h-10 appearance-none rounded-xl border border-border/70 bg-background py-2 pe-8 ps-9 text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          aria-label={t("language.label")}
        >
          {SUPPORTED_LOCALES.map((locale) => (
            <option key={locale} value={locale}>
              {localeConfig[locale].nativeLabel}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute end-2.5 size-3.5 text-muted-foreground" />
      </label>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1 rounded-xl border border-border/70 bg-background p-1 shadow-sm"
      role="group"
      aria-label={t("language.label")}
    >
      <Globe2
        className="mx-2 size-4 text-muted-foreground"
        aria-hidden="true"
      />
      {SUPPORTED_LOCALES.map((locale) => {
        const active = locale === currentLocale;
        return (
          <button
            key={locale}
            type="button"
            disabled={pending}
            onClick={() => void handleChange(locale)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors disabled:opacity-60 ${
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            lang={locale}
            dir={localeConfig[locale].dir}
            aria-pressed={active}
          >
            {active ? <Check className="size-3" aria-hidden="true" /> : null}
            {localeConfig[locale].nativeLabel}
          </button>
        );
      })}
    </div>
  );
}
