import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Phase 1 supported locales
  locales: ['en', 'es', 'fr', 'de', 'it'],

  // English is the default — no /en/ prefix, preserves all existing URLs
  defaultLocale: 'en',

  // Only add locale prefix for non-English languages
  localePrefix: 'as-needed',

  // Disable automatic locale detection from browser Accept-Language header
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
};

// RTL-ready: add RTL locales here when needed
export const rtlLocales: Locale[] = [];

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}
