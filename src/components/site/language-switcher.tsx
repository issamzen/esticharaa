import { useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { localeConfig, SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import { localizePublicHref } from "@/i18n/routing";
import { useLocale } from "@/i18n/use-locale";

export function LanguageSwitcher({
  compact = false,
  onLocaleChange,
}: {
  compact?: boolean;
  onLocaleChange?: (locale: Locale) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = useLocale();
  const location = useLocation();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  async function switchTo(next: Locale) {
    if (next === locale || pending) return;
    setPending(true);

    try {
      const href = localizePublicHref(location.publicHref, next);
      await i18n.changeLanguage(next);
      await navigate({ href });
      onLocaleChange?.(next);
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
          value={locale}
          disabled={pending}
          onChange={(event) => void switchTo(event.target.value as Locale)}
          className="h-10 appearance-none rounded-xl border border-border/70 bg-background/75 py-2 pe-8 ps-9 text-sm font-semibold outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          aria-label={t("language.label")}
        >
          {SUPPORTED_LOCALES.map((item) => (
            <option key={item} value={item}>
              {localeConfig[item].nativeLabel}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute end-2.5 size-3.5 text-muted-foreground" />
      </label>
    );
  }

  return (
    <div
      className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-border/70 bg-background/80 p-1 shadow-sm"
      role="group"
      aria-label={t("language.label")}
    >
      <Globe2 className="mx-2 size-4 text-muted-foreground" />
      {SUPPORTED_LOCALES.map((item) => {
        const active = item === locale;
        return (
          <button
            key={item}
            type="button"
            disabled={pending}
            onClick={() => void switchTo(item)}
            lang={item}
            dir={localeConfig[item].dir}
            aria-pressed={active}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition disabled:opacity-60 ${
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {active ? <Check className="size-3" /> : null}
            {localeConfig[item].nativeLabel}
          </button>
        );
      })}
    </div>
  );
}
