'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calculator, Menu, X, ChevronDown, FileText, Code, Type, BarChart3, Image as ImageIcon, ArrowLeftRight, ScanLine } from 'lucide-react';
import { Button } from '../ui/button';
import { HeaderSearch } from './HeaderSearch';
import { BrowseToolsButton } from './BrowseToolsButton';
import { LanguageSelector } from './LanguageSelector';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

export const Header: React.FC = () => {
  const t = useTranslations('nav');
  const tCat = useTranslations('categories');
  const locale = useLocale();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Prefix helper — English has no prefix
  const localePath = (path: string) => locale === 'en' ? path : `/${locale}${path}`;

  const NAV_CATEGORIES = [
    { name: tCat('calculators'), slug: 'calculators', href: localePath('/calculators'), icon: Calculator, description: tCat('calculatorsDesc') },
    { name: tCat('developerTools'), slug: 'developer-tools', href: localePath('/tools/category/developer-tools'), icon: Code, description: tCat('developerToolsDesc') },
    { name: tCat('pdfTools'), slug: 'pdf-tools', href: localePath('/tools/category/pdf-tools'), icon: FileText, description: tCat('pdfToolsDesc') },
    { name: tCat('textTools'), slug: 'text-tools', href: localePath('/tools/category/text-tools'), icon: Type, description: tCat('textToolsDesc') },
    { name: tCat('seoTools'), slug: 'seo-tools', href: localePath('/tools/category/seo-tools'), icon: BarChart3, description: tCat('seoToolsDesc') },
    { name: tCat('imageTools'), slug: 'image-tools', href: localePath('/tools/category/image-tools'), icon: ImageIcon, description: tCat('imageToolsDesc') },
    { name: tCat('converters'), slug: 'converters', href: localePath('/tools/category/converters'), icon: ArrowLeftRight, description: tCat('convertersDesc') },
    { name: tCat('documentScanner'), slug: 'scanner', href: localePath('/scan-to-pdf'), icon: ScanLine, description: tCat('documentScannerDesc') },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-colors shadow-2xs">
      {/* Top Navbar Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link href={locale === 'en' ? '/' : `/${locale}`} className="flex items-center gap-2 font-black text-lg sm:text-xl tracking-tight text-neutral-900 shrink-0 select-none">
          <Image src="/logo.png" alt="Numvax Logo" width={28} height={28} className="rounded-md object-contain bg-black" priority />
          <span>Numvax</span>
        </Link>

        {/* Global Search Bar (Desktop Center) */}
        <div className="hidden md:flex items-center flex-1 max-w-lg mx-3">
          <HeaderSearch placeholder="Search 74+ free tools..." />
        </div>

        {/* Desktop Navigation Links */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Browse 74+ Tools Shortcut (Desktop) */}
          <div className="hidden lg:block">
            <BrowseToolsButton size="sm" variant="outline" count="74+" />
          </div>

          {/* All Tools Category Dropdown (Desktop) */}
          <div ref={dropdownRef} className="relative hidden md:block">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              aria-expanded={isCategoryDropdownOpen}
              aria-haspopup="true"
              className="flex items-center gap-1 text-xs font-bold text-neutral-800 hover:text-neutral-950 px-3 py-2 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer min-h-[38px] border border-transparent hover:border-neutral-200"
            >
              {t('allTools')} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Category Mega Dropdown */}
            {isCategoryDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-[420px] bg-white border border-neutral-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="grid grid-cols-2 gap-1">
                  {NAV_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={cat.slug}
                        href={cat.href}
                        onClick={() => setIsCategoryDropdownOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors group"
                      >
                        <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white transition-colors shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-neutral-900">{cat.name}</span>
                          <span className="text-[11px] text-neutral-500 leading-tight">{cat.description}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="border-t border-neutral-100 mt-2 pt-2 flex items-center justify-between px-1">
                  <Link
                    href={localePath('/tools')}
                    onClick={() => setIsCategoryDropdownOpen(false)}
                    className="text-xs font-bold text-neutral-900 hover:underline py-1.5"
                  >
                    {t('browseAll')} →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Language Selector */}
          <LanguageSelector />

          {/* Mobile Hamburger Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 p-0 text-neutral-800 hover:text-neutral-950 rounded-xl"
            aria-label={t('toggleNav')}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Persistent Mobile Search + Browse Row (Permanently visible on ALL mobile pages) */}
      <div className="md:hidden border-t border-neutral-200/80 px-3 py-2 bg-[#FAF8F5]/90 flex items-center gap-2">
        <div className="flex-1">
          <HeaderSearch placeholder="Search 74+ free tools..." />
        </div>
        <BrowseToolsButton size="sm" variant="primary" count="74+" className="shrink-0 text-[11px] px-2.5 py-2 min-h-[44px]" />
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 p-4 bg-white flex flex-col gap-3 max-h-[80vh] overflow-y-auto animate-in fade-in">
          {/* Mobile Category Grid */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2 pt-1">
              {t('categories')}
            </span>
            {NAV_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={cat.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-neutral-800 hover:bg-neutral-100 transition-colors min-h-[44px]"
                >
                  <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-neutral-900">{cat.name}</span>
                    <span className="text-[11px] text-neutral-500 truncate">{cat.description}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-neutral-200 pt-2 flex flex-col gap-1">
            <Link href={localePath('/tools')} onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl text-xs font-bold text-neutral-800 hover:bg-neutral-100 min-h-[40px] flex items-center">
              {t('allTools')} Directory
            </Link>
            <Link href={localePath('/about')} onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-100 min-h-[40px] flex items-center">
              {t('aboutNumvax')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
