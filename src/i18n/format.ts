import { localeConfig, type Locale } from "@/i18n/config";

export function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(localeConfig[locale].intl).format(value);
}

export function formatCurrency(
  value: number,
  locale: Locale,
  currency = "MAD",
) {
  return new Intl.NumberFormat(localeConfig[locale].intl, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(value);
}

export function formatDate(
  value: string | number | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
  },
) {
  return new Intl.DateTimeFormat(localeConfig[locale].intl, options).format(
    new Date(value),
  );
}

export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: Locale,
) {
  return new Intl.RelativeTimeFormat(localeConfig[locale].intl, {
    numeric: "auto",
  }).format(value, unit);
}
