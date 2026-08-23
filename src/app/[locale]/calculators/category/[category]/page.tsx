import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CALCULATOR_CATALOG } from '@/lib/catalog';
import { Calculator, ArrowRight } from 'lucide-react';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { HeaderSearch } from '@/components/navigation/HeaderSearch';
import { BrowseToolsButton } from '@/components/navigation/BrowseToolsButton';
import { routing } from '@/i18n/routing';

interface CalculatorCategoryProps {
  params: Promise<{ locale: string; category: string }>;
}

const CALC_CATEGORY_MAP: Record<string, { name: string; description: string }> = {
  health: {
    name: 'Health Calculators',
    description: 'Calculate BMI, body mass index categories, ideal body weight, and health metrics.',
  },
  math: {
    name: 'Math & Academic Calculators',
    description: 'Calculate percentages, percentage change, GPA, and time between calendar dates.',
  },
  financial: {
    name: 'Financial Calculators',
    description: 'Calculate retail store discounts, loan payments, amortization, interest, and sales tax.',
  },
};

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    Object.keys(CALC_CATEGORY_MAP).map((category) => ({ locale, category }))
  );
}

export async function generateMetadata({ params }: CalculatorCategoryProps): Promise<Metadata> {
  const { locale, category } = await params;
  const cat = CALC_CATEGORY_MAP[category];
  if (!cat) return {};

  const enUrl = `https://numvax.com/calculators/category/${category}`;

  return {
    title: `${cat.name} - Free Online Calculators | Numvax`,
    description: cat.description,
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
    alternates: {
      canonical: enUrl,
      languages: {
        'x-default': enUrl,
        en: enUrl,
      },
    },
  };
}

export default async function CalculatorCategoryPage({ params }: CalculatorCategoryProps) {
  const { category, locale } = await params;
  const cat = CALC_CATEGORY_MAP[category];

  if (!cat) {
    notFound();
  }

  const matchingCalcs = Object.values(CALCULATOR_CATALOG).filter(
    (c) => c.categorySlug === category
  );

  const breadcrumbs = [
    { name: 'Home', url: locale === 'en' ? 'https://numvax.com' : `https://numvax.com/${locale}` },
    { name: 'Calculators', url: locale === 'en' ? 'https://numvax.com/calculators' : `https://numvax.com/${locale}/calculators` },
    { name: cat.name, url: locale === 'en' ? `https://numvax.com/calculators/category/${category}` : `https://numvax.com/${locale}/calculators/category/${category}` },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-6">
      {/* Top Breadcrumbs & Search Utility Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-200/80 pb-3">
        <Breadcrumb items={breadcrumbs} />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-md w-full">
          <div className="flex-1">
            <HeaderSearch placeholder="Search 74+ free tools..." />
          </div>
          <BrowseToolsButton size="md" variant="outline" count="74+" className="hidden sm:inline-flex" />
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
          {cat.name}
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-3xl">
          {cat.description}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {matchingCalcs.map((calc) => (
          <Link
            key={calc.slug}
            href={`/${calc.slug}`}
            className="group flex flex-col justify-between p-5 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-900 shadow-2xs hover:shadow-xs transition-all min-h-[140px]"
          >
            <div>
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm sm:text-base mb-1.5">
                <Calculator className="w-4 h-4 text-neutral-700 shrink-0" />
                <span className="truncate">{calc.name}</span>
              </div>
              <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                {calc.shortDescription}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-neutral-900 mt-4 pt-2.5 border-t border-neutral-100 group-hover:translate-x-1 transition-transform">
              <span>Open Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
