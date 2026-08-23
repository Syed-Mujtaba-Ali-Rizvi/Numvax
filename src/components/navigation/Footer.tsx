'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AdSlot } from '../ads/AdSlot';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

export const Footer: React.FC = () => {
  const t = useTranslations('footer');
  const locale = useLocale();

  // Prefix helper — English has no prefix
  const localePath = (path: string) => locale === 'en' ? path : `/${locale}${path}`;

  return (
    <footer className="w-full bg-neutral-50 text-neutral-600 border-t border-neutral-200 text-sm no-print mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="flex flex-col gap-3 md:col-span-1">
          <Link href={locale === 'en' ? '/' : `/${locale}`} className="flex items-center gap-2 font-bold text-xl text-neutral-900 tracking-tight">
            <Image src="/logo.png" alt="Numvax Logo" width={28} height={28} className="rounded-md object-contain bg-black" priority />
            <span>Numvax</span>
          </Link>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {t('tagline')}
          </p>
        </div>

        {/* Popular Tools Column */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">{t('popularTools')}</span>
          <Link href={localePath('/pdf-to-word')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500 font-medium" title="Free Online PDF to Word Converter">{t('links.pdfToWord')}</Link>
          <Link href={localePath('/image-to-word')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500 font-medium" title="Image to Word Converter with OCR">{t('links.imageToWord')}</Link>
          <Link href={localePath('/merge-pdf')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500" title="Combine PDF Files Online">{t('links.mergePdf')}</Link>
          <Link href={localePath('/image-compressor')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500" title="Compress Images Online">{t('links.imageCompressor')}</Link>
          <Link href={localePath('/protect-pdf')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500" title="Encrypt and Password Protect PDF">{t('links.protectPdf')}</Link>
          <Link href={localePath('/image-qr-code-generator')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500" title="Create Scannable Photo QR Code">{t('links.photoQrCode')}</Link>
          <Link href={localePath('/scan-to-pdf')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500" title="Scan Paper Documents to PDF">{t('links.documentScanner')}</Link>
        </div>

        {/* Categories Column */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">{t('categories')}</span>
          <Link href={localePath('/calculators')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500" title="Free Online Calculators">{t('links.allCalculators')}</Link>
          <Link href={localePath('/tools/category/developer-tools')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500" title="Developer Utilities & Code Formatters">{t('links.developerTools')}</Link>
          <Link href={localePath('/tools/category/pdf-tools')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500" title="Free PDF Converter & Editor Tools">{t('links.pdfTools')}</Link>
          <Link href={localePath('/tools/category/text-tools')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500" title="Online Text Editing & Manipulation Utilities">{t('links.textTools')}</Link>
          <Link href={localePath('/tools/category/seo-tools')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500" title="Technical Webmaster & SEO Optimization Tools">{t('links.seoTools')}</Link>
        </div>

        {/* Company & Legal Column */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">{t('legalSupport')}</span>
          <Link href={localePath('/about')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500">{t('links.about')}</Link>
          <Link href={localePath('/contact')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500">{t('links.contact')}</Link>
          <Link href={localePath('/privacy-policy')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500">{t('links.privacy')}</Link>
          <Link href={localePath('/cookie-policy')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500">{t('links.cookiePolicy')}</Link>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('reopen-consent-banner'));
              }
            }}
            className="text-left hover:text-neutral-900 transition-colors text-xs text-neutral-500 cursor-pointer"
          >
            {t('links.cookieSettings')}
          </button>
          <Link href={localePath('/terms')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500">{t('links.terms')}</Link>
          <Link href={localePath('/disclaimer')} className="hover:text-neutral-900 transition-colors text-xs text-neutral-500">{t('links.disclaimer')}</Link>
          <a href="/sitemap.xml" className="hover:text-neutral-900 transition-colors text-xs text-neutral-500">{t('links.sitemap')}</a>
        </div>
      </div>

      {/* Footer Bottom Ad Unit */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <AdSlot position="footer" adSlot="4321787290" className="my-0 py-4" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-2">
        <p>{t('copyright', { year: new Date().getFullYear() })}</p>
        <p>{t('disclaimer')}</p>
      </div>
    </footer>
  );
};
