import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import { CALCULATOR_CATALOG } from '../../lib/catalog';
import { TOOL_CATALOG } from '../../lib/toolCatalog';
import { HeaderSearch } from '../../components/navigation/HeaderSearch';
import {
  Calculator,
  TrendingUp,
  Layers,
  FileText,
  Image as ImageIcon,
  Code,
  Globe,
  Wrench,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { JsonLd } from '../../components/seo/JsonLd';
import { routing } from '../../i18n/routing';

const totalToolCount = Object.keys(CALCULATOR_CATALOG).length + Object.keys(TOOL_CATALOG).length;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  const baseUrl = 'https://numvax.com';
  const canonicalUrl = locale === 'en' ? `${baseUrl}/` : `${baseUrl}/${locale}`;

  const titleMap: Record<string, string> = {
    en: 'Numvax — Free Online Tools & Calculators',
    es: 'Numvax — Calculadoras, Convertidores y Herramientas Online Gratis',
    fr: 'Numvax — Calculateurs, Convertisseurs et Outils en Ligne Gratuits',
    de: 'Numvax — Kostenlose Online-Rechner, Konverter und Tools',
    it: 'Numvax — Calcolatori, Convertitori e Strumenti Online Gratuiti',
  };

  const descMap: Record<string, string> = {
    en: 'Numvax provides fast, accurate, client-side free online tools: calculators, PDF utilities, image tools, text utilities, unit converters, and developer tools.',
    es: 'Numvax ofrece herramientas online gratuitas: calculadoras, utilidades PDF, procesamiento de imágenes, herramientas de texto, conversores y herramientas de desarrollador.',
    fr: 'Numvax propose des outils en ligne gratuits et rapides : calculateurs, utilitaires PDF, traitement d\'images, outils texte, convertisseurs et outils développeur.',
    de: 'Numvax bietet kostenlose, schnelle clientseitige Online-Tools: Rechner, PDF-Dienstprogramme, Bildtools, Texttools, Einheitenkonverter und Entwicklertools.',
    it: 'Numvax offre strumenti online gratuiti e veloci: calcolatori, utilità PDF, elaborazione immagini, strumenti di testo, convertitori di unità e strumenti per sviluppatori.',
  };

  const localeOGMap: Record<string, string> = {
    en: 'en_US',
    es: 'es_ES',
    fr: 'fr_FR',
    de: 'de_DE',
    it: 'it_IT',
  };

  const pageTitle = titleMap[locale] || titleMap.en;
  const pageDesc = descMap[locale] || descMap.en;

  return {
    title: pageTitle,
    description: pageDesc,
    robots: {
      index: locale === 'en',
      follow: true,
      googleBot: {
        index: locale === 'en',
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: `${baseUrl}/`,
      siteName: 'Numvax',
      locale: localeOGMap[locale] || 'en_US',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Numvax — Free Online Tools & Calculators',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: ['/og-image.jpg'],
    },
    alternates: {
      canonical: `${baseUrl}/`,
      languages: {
        'x-default': `${baseUrl}/`,
        en: `${baseUrl}/`,
      },
    },
  };
}

function TypeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="9" y1="20" x2="15" y2="20" />
    </svg>
  );
}

export default async function LocaleHomePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const tCat = await getTranslations({ locale, namespace: 'categories' });

  const CATEGORIES_GRID = [
    { slug: 'calculators', nameKey: 'calculators' as const, icon: Calculator, href: locale === 'en' ? '/calculators' : `/${locale}/calculators`, descKey: 'calculators' as const },
    { slug: 'pdf-tools', nameKey: 'pdfTools' as const, icon: FileText, href: locale === 'en' ? '/tools/category/pdf-tools' : `/${locale}/tools/category/pdf-tools`, descKey: 'pdfTools' as const },
    { slug: 'image-tools', nameKey: 'imageTools' as const, icon: ImageIcon, href: locale === 'en' ? '/tools/category/image-tools' : `/${locale}/tools/category/image-tools`, descKey: 'imageTools' as const },
    { slug: 'text-tools', nameKey: 'textTools' as const, icon: TypeIcon, href: locale === 'en' ? '/tools/category/text-tools' : `/${locale}/tools/category/text-tools`, descKey: 'textTools' as const },
    { slug: 'converters', nameKey: 'converters' as const, icon: Layers, href: locale === 'en' ? '/tools/category/converters' : `/${locale}/tools/category/converters`, descKey: 'converters' as const },
    { slug: 'developer-tools', nameKey: 'developerTools' as const, icon: Code, href: locale === 'en' ? '/tools/category/developer-tools' : `/${locale}/tools/category/developer-tools`, descKey: 'developerTools' as const },
    { slug: 'seo-tools', nameKey: 'seoTools' as const, icon: Globe, href: locale === 'en' ? '/tools/category/seo-tools' : `/${locale}/tools/category/seo-tools`, descKey: 'seoTools' as const },
    { slug: 'generators', nameKey: 'generators' as const, icon: Wrench, href: locale === 'en' ? '/tools/category/generators' : `/${locale}/tools/category/generators`, descKey: 'generators' as const },
  ];

  const toolsHref = locale === 'en' ? '/tools' : `/${locale}/tools`;

  const POPULAR_TOOLS = [
    { slug: 'merge-pdf', nameKey: 'mergePdf', Icon: FileText },
    { slug: 'image-compressor', nameKey: 'imageCompressor', Icon: ImageIcon },
    { slug: 'word-counter', nameKey: 'wordCounter', Icon: Calculator },
    { slug: 'json-formatter', nameKey: 'jsonFormatter', Icon: Code },
    { slug: 'bmi-calculator', nameKey: 'bmiCalculator', Icon: Calculator },
  ];

  const FEATURED_TOOLS = [
    { slug: 'merge-pdf', nameKey: 'mergePdf', category: tCat('pdfTools'), descKey: 'mergePdf' },
    { slug: 'image-compressor', nameKey: 'imageCompressor', category: tCat('imageTools'), descKey: 'imageCompressor' },
    { slug: 'json-formatter', nameKey: 'jsonFormatter', category: tCat('developerTools'), descKey: 'jsonFormatter' },
    { slug: 'password-generator', nameKey: 'passwordGenerator', category: tCat('generators'), descKey: 'passwordGenerator' },
    { slug: 'qr-code-generator', nameKey: 'qrCodeGenerator', category: tCat('generators'), descKey: 'qrCodeGenerator' },
    { slug: 'word-counter', nameKey: 'wordCounter', category: tCat('textTools'), descKey: 'wordCounter' },
  ];

  // Tool names (tool name = unchanged brand/tool identifier, keep in English for now as the tool slug = brand name)
  const toolNames: Record<string, string> = {
    mergePdf: 'Merge PDF',
    imageCompressor: 'Image Compressor',
    wordCounter: 'Word Counter',
    jsonFormatter: 'JSON Formatter',
    bmiCalculator: 'BMI Calculator',
    passwordGenerator: 'Password Generator',
    qrCodeGenerator: 'QR Code Generator',
  };

  return (
    <div className="w-full flex flex-col bg-[#FAF8F5]">
      {/* Hero Section */}
      <section className="py-14 md:py-20 px-4 max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EFE6] border border-[#E5DFD3] text-neutral-800 text-xs font-semibold shadow-2xs">
          <Zap className="w-3.5 h-3.5 text-neutral-900" />
          <span>{t('badge', { count: totalToolCount })}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 tracking-tight leading-tight">
          {t('title')}
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-neutral-700 max-w-2xl leading-relaxed">
          {t('subtitle')}
        </p>

        <div className="w-full max-w-xl mt-1 text-left">
          <HeaderSearch placeholder={t('searchPlaceholder', { count: totalToolCount })} />
        </div>

        <div className="flex items-center gap-4 mt-2">
          <Link
            href={toolsHref}
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-full transition-all shadow-sm"
          >
            <span>{t('browseAll', { count: totalToolCount })}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="w-full bg-[#F3EFE6] border-y border-[#E5DFD3] py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-neutral-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neutral-900" />
            <span>{t('trustBadge')}</span>
          </div>
        </div>
      </section>

      {/* Most Popular Tools */}
      <section className="py-12 max-w-6xl mx-auto px-4 w-full">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4 text-neutral-900" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
            {t('popularTools')}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {POPULAR_TOOLS.map((tool) => {
            const href = locale === 'en' ? `/${tool.slug}` : `/${locale}/${tool.slug}`;
            return (
              <Link
                key={tool.slug}
                href={href}
                className="flex flex-col items-center justify-center p-4 text-center bg-white border border-neutral-200/90 rounded-2xl hover:border-neutral-900 hover:shadow-xs transition-all group"
              >
                <div className="p-2.5 rounded-xl bg-[#F5F2EB] text-neutral-900 mb-2 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                  <tool.Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-neutral-900 line-clamp-1">
                  {toolNames[tool.nameKey]}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Explore Categories */}
      <section className="py-14 bg-[#F5F2EB] border-t border-[#E5DFD3] w-full">
        <div className="max-w-6xl mx-auto px-4 flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">{t('exploreCategories')}</h2>
            <p className="text-xs sm:text-sm text-neutral-600">{t('exploreCategoriesSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES_GRID.map((cat) => {
              const Icon = cat.icon;
              const catName = tCat(cat.nameKey);
              const catDesc = t(`categoryDescriptions.${cat.descKey}`);
              return (
                <Link
                  key={cat.slug}
                  href={cat.href}
                  className="group p-6 bg-white border border-neutral-200/90 rounded-2xl hover:border-neutral-900 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] text-neutral-900 w-fit mb-4 group-hover:bg-neutral-900 group-hover:text-white transition-colors border border-neutral-200/60">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 mb-1.5">{catName}</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">{catDesc}</p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-neutral-100 text-xs font-bold text-neutral-900 flex items-center justify-between group-hover:translate-x-0.5 transition-transform">
                    <span>{t('exploreLink', { name: catName })}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-14 max-w-6xl mx-auto px-4 w-full">
        <div className="flex flex-col gap-1 mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">{t('featuredTools')}</h2>
          <p className="text-xs sm:text-sm text-neutral-600">{t('featuredToolsSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED_TOOLS.map((tool) => {
            const name = toolNames[tool.nameKey] || tool.nameKey;
            const desc = t(`featuredDescriptions.${tool.descKey}`);
            const href = locale === 'en' ? `/${tool.slug}` : `/${locale}/${tool.slug}`;
            return (
              <Link
                key={tool.slug}
                href={href}
                className="flex flex-col justify-between p-6 bg-white border border-neutral-200/90 rounded-2xl hover:border-neutral-900 hover:shadow-sm transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-700 bg-[#F5F2EB] px-2.5 py-1 rounded-full border border-neutral-200/60">
                      {tool.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 mb-2">{name}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">{desc}</p>
                </div>
                <div className="mt-5 pt-3 border-t border-neutral-100 text-xs font-bold text-neutral-900 flex items-center justify-between">
                  <span>{t('useToolLink', { name })}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Why Numvax */}
      <section className="py-14 bg-[#F5F2EB] border-t border-[#E5DFD3] w-full">
        <div className="max-w-3xl mx-auto px-4 text-center flex flex-col gap-3">
          <h2 className="text-2xl font-extrabold text-neutral-900">{t('whyNumvax')}</h2>
          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-xl mx-auto">
            {t('whyNumvaxDesc')}
          </p>
        </div>
      </section>
    </div>
  );
}
