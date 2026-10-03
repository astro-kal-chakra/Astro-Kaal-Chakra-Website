/**
 * The site is written in English; visitors translate it with Google Translate
 * (features/translate). SITE_LOCALE drives number/date formatting.
 * The internal app/[lang] segment is always "en" — proxy.js rewrites clean URLs to it.
 */
export const SITE_LOCALE = "en";
export const locales = [SITE_LOCALE];
export const defaultLocale = SITE_LOCALE;

/** BCP-47 tag used for Intl formatting and og:locale. */
export const localeTags = { en: "en-IN" };

export const hasLocale = (locale) => locales.includes(locale);
