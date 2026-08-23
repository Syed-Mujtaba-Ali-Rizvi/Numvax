import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TOOL_CATALOG } from '@/lib/toolCatalog';
import { Wrench, ArrowRight } from 'lucide-react';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { HeaderSearch } from '@/components/navigation/HeaderSearch';
import { BrowseToolsButton } from '@/components/navigation/BrowseToolsButton';
import { routing } from '@/i18n/routing';

interface CategoryPageProps {
  params: Promise<{ locale: string; category: string }>;
}

const TOOL_CATEGORY_MAP: Record<string, { name: string; description: string }> = {
  'pdf-tools': {
    name: 'PDF Tools',
    description: 'Merge, split, compress, edit, sign, watermark, protect, and convert PDF documents directly in your browser.',
  },
  'image-tools': {
    name: 'Image Tools',
    description: 'Compress images, resize, convert formats, and optimize graphics locally with zero quality loss.',
  },
  'text-tools': {
    name: 'Text Tools',
    description: 'Word counter, text comparison, case converter, line deduplication, and grammar checking utilities.',
  },
  converters: {
    name: 'Converters',
    description: 'High-precision unit conversion tools for length, weight, speed, volume, data, and temperatures.',
  },
  'developer-tools': {
    name: 'Developer Tools',
    description: 'JSON formatters, base64, hash generation, UUID, regex tester, and SQL syntax formatters.',
  },
  'seo-tools': {
    name: 'SEO Tools',
    description: 'Meta tag analyzer, sitemap builder, robots.txt generator, keyword density, and schema markup tools.',
  },
  generators: {
    name: 'Generators',
    description: 'QR code generator, password generator, UUID generator, and document generators.',
  },
};

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    Object.keys(TOOL_CATEGORY_MAP).map((category) => ({ locale, category }))
  );
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, category } = await params;
  const cat = TOOL_CATEGORY_MAP[category];
  if (!cat) return {};

  const enUrl = `https://numvax.com/tools/category/${category}`;

  return {
    title: `${cat.name} - Free Online Utilities | Numvax`,
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

export default async function ToolCategoryPage({ params }: CategoryPageProps) {
  const { category, locale } = await params;
  const cat = TOOL_CATEGORY_MAP[category];

  if (!cat) {
    notFound();
  }

  const matchingTools = Object.values(TOOL_CATALOG).filter(
    (t) => t.categorySlug === category
  );

  const breadcrumbs = [
    { name: 'Home', url: locale === 'en' ? 'https://numvax.com' : `https://numvax.com/${locale}` },
    { name: 'Tools', url: locale === 'en' ? 'https://numvax.com/tools' : `https://numvax.com/${locale}/tools` },
    { name: cat.name, url: locale === 'en' ? `https://numvax.com/tools/category/${category}` : `https://numvax.com/${locale}/tools/category/${category}` },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-6">
      {/* Top Breadcrumb & Search Navigation Row */}
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
        {matchingTools.length > 0 ? (
          matchingTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/${tool.slug}`}
              className="group flex flex-col justify-between p-5 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-900 shadow-2xs hover:shadow-xs transition-all min-h-[140px]"
            >
              <div>
                <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm sm:text-base mb-1.5">
                  <Wrench className="w-4 h-4 text-neutral-700 shrink-0" />
                  <span className="truncate">{tool.name}</span>
                </div>
                <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                  {tool.shortDescription}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-neutral-900 mt-4 pt-2.5 border-t border-neutral-100 group-hover:translate-x-1 transition-transform">
                <span>Open Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full p-8 bg-neutral-50 border border-neutral-200 rounded-2xl text-center">
            <p className="text-sm text-neutral-600 font-medium">Tools in this category are being deployed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
