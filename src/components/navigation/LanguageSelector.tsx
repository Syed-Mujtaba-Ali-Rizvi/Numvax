'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { routing, localeNames, localeFlags, type Locale } from '../../i18n/routing';

/**
 * LanguageSelector — prominently placed in the header.
 * 
 * Behavior:
 * - First visit: browser Accept-Language detection (handled by next-intl middleware)
 * - After manual selection: persists via NEXT_LOCALE cookie (set by next-intl middleware)
 * - Preserves current page path when switching language
 * - No CLS: fixed dimensions, no layout shift
 * - Keyboard accessible with ARIA labels
 * - RTL-safe positioning
 */
export const LanguageSelector: React.FC = () => {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  /**
   * Build the target path for the new locale.
   * next-intl uses as-needed prefix — English has no prefix, others do.
   * 
   * Examples:
   *   Current: /compress-pdf → switch to es → /es/compress-pdf
   *   Current: /es/compress-pdf → switch to fr → /fr/compress-pdf
   *   Current: /es/compress-pdf → switch to en → /compress-pdf
   */
  const buildLocalePath = useCallback(
    (targetLocale: Locale): string => {
      // Strip the current locale prefix from the pathname (if any)
      let cleanPath = pathname;

      for (const loc of routing.locales) {
        if (loc === routing.defaultLocale) continue; // English has no prefix
        if (pathname === `/${loc}`) {
          cleanPath = '/';
          break;
        }
        if (pathname.startsWith(`/${loc}/`)) {
          cleanPath = pathname.slice(`/${loc}`.length);
          break;
        }
      }

      // Build the new path
      if (targetLocale === routing.defaultLocale) {
        return cleanPath || '/';
      }
      return cleanPath === '/' ? `/${targetLocale}` : `/${targetLocale}${cleanPath}`;
    },
    [pathname]
  );

  const handleLocaleChange = useCallback(
    (targetLocale: Locale) => {
      if (targetLocale === locale) {
        setIsOpen(false);
        return;
      }

      const targetPath = buildLocalePath(targetLocale);
      setIsOpen(false);

      // Explicitly set NEXT_LOCALE cookie so middleware and client components stay in sync
      document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`;

      // Full navigation ensures clean server-side translation rendering
      window.location.href = targetPath;
    },
    [locale, buildLocalePath]
  );

  // Keyboard navigation within dropdown
  const handleDropdownKeyDown = (e: React.KeyboardEvent, targetLocale: Locale) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLocaleChange(targetLocale);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button — fixed min-width prevents CLS */}
      <button
        ref={triggerRef}
        id="language-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('languageSwitcher')}
        title={t('selectLanguage')}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 min-w-[90px] whitespace-nowrap"
      >
        <Globe
          className="w-4 h-4 shrink-0 text-neutral-500"
          aria-hidden="true"
        />
        <span className="hidden sm:inline text-xs">{localeNames[locale]}</span>
        <ChevronDown
          className={`w-3 h-3 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={t('selectLanguage')}
          aria-activedescendant={`lang-option-${locale}`}
          className="absolute right-0 top-full mt-2 w-44 bg-white border border-neutral-200 rounded-2xl shadow-xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="p-1.5 flex flex-col gap-0.5">
            {routing.locales.map((loc) => {
              const isSelected = loc === locale;
              return (
                <button
                  key={loc}
                  id={`lang-option-${loc}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleLocaleChange(loc)}
                  onKeyDown={(e) => handleDropdownKeyDown(e, loc)}
                  tabIndex={0}
                  className={`
                    w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400
                    ${isSelected
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                    }
                  `}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base" aria-hidden="true">{localeFlags[loc]}</span>
                    <span>{localeNames[loc]}</span>
                  </span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
