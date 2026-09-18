import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '../navigation/Breadcrumb';
import { CalculatorFAQ, FAQItem } from './CalculatorFAQ';
import { CalculatorRelatedTools, RelatedTool } from './CalculatorRelatedTools';
import { HeaderSearch } from '../navigation/HeaderSearch';
import { BrowseToolsButton } from '../navigation/BrowseToolsButton';
import { AdSlot } from '../ads/AdSlot';
import { JsonLd } from '../seo/JsonLd';
import { BookOpen, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

export interface CalculatorLayoutProps {
  slug: string;
  title: string;
  subtitle: string;
  categoryName: string;
  categorySlug: string;
  children: React.ReactNode;
  explanation: string;
  directAnswer?: string;
  formulaTitle?: string;
  formulaDescription: string;
  workedExamples?: Array<{ title: string; example: string }>;
  useCases?: string;
  faqs?: FAQItem[];
  relatedTools?: RelatedTool[];
  locale?: string;
}

export const CalculatorLayout: React.FC<CalculatorLayoutProps> = async ({
  slug,
  title,
  subtitle,
  categoryName,
  categorySlug,
  children,
  explanation,
  directAnswer,
  formulaTitle,
  formulaDescription,
  workedExamples = [],
  useCases,
  faqs = [],
  relatedTools = [],
  locale = 'en',
}) => {
  const t = await getTranslations({ locale, namespace: 'tool' });
  const tBreadcrumb = await getTranslations({ locale, namespace: 'breadcrumb' });

  const finalFormulaTitle = formulaTitle || t('formulaMethod');

  const baseUrl = 'https://numvax.com';
  const pageUrl = locale === 'en' ? `${baseUrl}/${slug}` : `${baseUrl}/${locale}/${slug}`;

  const breadcrumbs = [
    { name: tBreadcrumb('home'), url: locale === 'en' ? baseUrl : `${baseUrl}/${locale}` },
    { name: tBreadcrumb('calculators'), url: locale === 'en' ? `${baseUrl}/calculators` : `${baseUrl}/${locale}/calculators` },
    { name: categoryName, url: locale === 'en' ? `${baseUrl}/calculators/category/${categorySlug}` : `${baseUrl}/${locale}/calculators/category/${categorySlug}` },
    { name: title, url: pageUrl },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-5 sm:py-7 flex flex-col gap-4">
      {/* Structured Schemas */}
      <JsonLd type="WebApplication" data={{ name: title, description: subtitle, url: pageUrl, category: categoryName }} />
      <JsonLd type="Breadcrumb" data={{ items: breadcrumbs }} />
      {faqs.length > 0 && <JsonLd type="FAQPage" data={{ faqs }} />}

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

      {/* Calculator Header Section */}
      <div className="flex flex-col gap-2.5 mt-1">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 max-w-3xl leading-relaxed">
          {subtitle}
        </p>

        {/* Direct Answer Overview Box */}
        {directAnswer && (
          <div className="p-4 bg-[#FAF8F5] border-l-4 border-neutral-900 rounded-r-2xl text-xs sm:text-sm text-neutral-800 font-medium leading-relaxed mt-1 shadow-2xs">
            <span className="font-bold text-neutral-900 block mb-1 uppercase tracking-wider text-[11px]">
              {t('directOverview')}
            </span>
            {directAnswer}
          </div>
        )}
      </div>

      {/* Main Interactive Calculator UI */}
      <main className="w-full mt-2 flex flex-col gap-4">
        {children}
      </main>

      {/* Below Results Ad Slot */}
      <AdSlot position="below_results" />

      {/* Structured Content Section (Server-Rendered HTML) */}
      <div className="w-full flex flex-col gap-6 mt-6">
        {/* Explanation Section */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs leading-relaxed">
          <h2 className="text-xl font-bold text-neutral-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neutral-800" />
            {t('aboutCalculator', { title })}
          </h2>
          <div className="text-sm text-neutral-700 space-y-3 leading-relaxed">
            <p>{explanation}</p>
          </div>
        </section>

        {/* Use Cases Section */}
        {useCases && (
          <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs leading-relaxed">
            <h2 className="text-xl font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neutral-800" />
              What Can You Use This Calculator For?
            </h2>
            <div className="text-sm text-neutral-700 leading-relaxed">
              <p>{useCases}</p>
            </div>
          </section>
        )}

        {/* Formula Section */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs leading-relaxed">
          <h2 className="text-xl font-bold text-neutral-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-neutral-800" />
            {finalFormulaTitle}
          </h2>
          <div className="p-4 sm:p-5 bg-neutral-50 rounded-xl text-xs sm:text-sm text-neutral-800 font-mono border border-neutral-200 whitespace-pre-line leading-relaxed">
            {formulaDescription}
          </div>
        </section>

        {/* In-Content Ad Slot */}
        <AdSlot position="in_content" />

        {/* Worked Examples */}
        {workedExamples.length > 0 && (
          <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs leading-relaxed">
            <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-neutral-800" />
              {t('workedExamples')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workedExamples.map((ex, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
                  <h3 className="text-sm font-bold text-neutral-900 mb-2">{ex.title}</h3>
                  <p className="text-xs text-neutral-700 font-mono whitespace-pre-line leading-relaxed bg-white p-3 rounded-lg border border-neutral-200">
                    {ex.example}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQs Accordion */}
        {faqs.length > 0 && (
          <section className="w-full">
            <CalculatorFAQ items={faqs} faqLabel={t('faq')} />
          </section>
        )}

        {/* Related Calculators Cross-Links */}
        <CalculatorRelatedTools
          tools={relatedTools}
          currentSlug={slug}
          categoryName={categoryName}
          categorySlug={categorySlug}
          useToolLabel={t('useTool', { name: '' }).trim()}
          locale={locale}
        />
      </div>
    </div>
  );
};
