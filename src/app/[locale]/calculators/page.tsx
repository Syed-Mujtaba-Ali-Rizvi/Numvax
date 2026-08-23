import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { CALCULATOR_CATALOG, CalculatorPageData } from '@/lib/catalog';
import { Calculator, ArrowRight } from 'lucide-react';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';

export const metadata: Metadata = {
  title: 'All Calculators - Numvax Directory',
  description: 'Browse all free online calculators for finance, health, math, education, and date/time calculations.',
  alternates: {
    canonical: 'https://numvax.com/calculators',
  },
};

export default function CalculatorsIndexPage() {
  const tools = Object.values(CALCULATOR_CATALOG);

  const breadcrumbs = [
    { name: 'Home', url: 'https://numvax.com' },
    { name: 'Calculators', url: 'https://numvax.com/calculators' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
          All Online Calculators
        </h1>
        <p className="text-base text-neutral-600 leading-relaxed max-w-2xl">
          Fast, accurate, and professionally designed tools for everyday, academic, and financial calculations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/${tool.slug}`}
            className="group flex flex-col justify-between p-6 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-900 hover:shadow-sm transition-all"
          >
            <div>
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-base mb-2">
                <Calculator className="w-5 h-5" />
                <span>{tool.name}</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {tool.shortDescription}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 mt-6 pt-3 border-t border-neutral-100">
              <span className="text-[11px] text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded-full font-medium">
                {tool.categoryName}
              </span>
              <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Use Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
