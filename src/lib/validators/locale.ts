export const Locales = ["de", "en", "es"] as const;
export type Locale = (typeof Locales)[number];
export const isLocale = (locale: string): locale is Locale => Locales.includes(locale as Locale);
