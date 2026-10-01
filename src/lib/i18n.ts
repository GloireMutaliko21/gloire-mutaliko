export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export type L10n = { en: string; fr: string };

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Picks the translation for a locale, falling back to English then French. */
export function tr(field: Partial<L10n> | undefined | null, locale: Locale): string {
  if (!field) return "";
  return field[locale] || field.en || field.fr || "";
}

export function pickLocale(acceptLanguage: string | null, cookieLocale?: string): Locale {
  if (isLocale(cookieLocale)) return cookieLocale;
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().slice(0, 2), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return ranked.find((r) => isLocale(r.lang))?.lang as Locale | undefined ?? defaultLocale;
}

export function localizedPath(locale: Locale, path = "/") {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function formatMonth(value: string | null | undefined, locale: Locale) {
  if (!value) return "";
  const [y, m] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(y, (m || 1) - 1, 1)));
}
