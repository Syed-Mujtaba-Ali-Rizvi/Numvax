import React from 'react';
import { Metadata } from 'next';
import { TOOL_CATALOG, ToolPageData } from '@/lib/toolCatalog';
import { CALCULATOR_CATALOG, CalculatorPageData } from '@/lib/catalog';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { ToolsDirectory, DirectoryToolItem } from '@/components/tools/ToolsDirectory';

const totalToolCount = Object.keys(CALCULATOR_CATALOG).length + Object.keys(TOOL_CATALOG).length;

export const metadata: Metadata = {
  title: `All ${totalToolCount}+ Free Online Tools & Calculators - Numvax Directory`,
  description: `Browse all ${totalToolCount}+ free online calculators, PDF tools, image converters, developer utilities, text tools, and SEO tools on Numvax.`,
  alternates: {
    canonical: 'https://numvax.com/tools',
  },
};

export default function ToolsIndexPage() {
  const calculatorsList: DirectoryToolItem[] = Object.values(CALCULATOR_CATALOG).map((tool) => ({
    slug: tool.slug,
    name: tool.name,
    shortDescription: tool.shortDescription,
    categoryName: tool.categoryName,
    categorySlug: tool.categorySlug,
    href: `/${tool.slug}`,
    isCalculator: true,
  }));

  const toolsList: DirectoryToolItem[] = Object.values(TOOL_CATALOG).map((tool) => ({
    slug: tool.slug,
    name: tool.name,
    shortDescription: tool.shortDescription,
    categoryName: tool.categoryName,
    categorySlug: tool.categorySlug,
    href: `/${tool.slug}`,
    isCalculator: false,
  }));

  // Combine calculators first, then utility tools
  const allTools = [...calculatorsList, ...toolsList];

  const breadcrumbs = [
    { name: 'Home', url: 'https://numvax.com' },
    { name: 'All Tools', url: 'https://numvax.com/tools' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
      <Breadcrumb items={breadcrumbs} />

      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-semibold w-fit">
          <span>{allTools.length} Complete Published Tools</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
          All Free Online Tools & Calculators
        </h1>
        <p className="text-base text-neutral-600 leading-relaxed max-w-2xl">
          Complete, searchable directory of fast, 100% free, client-side tools for calculations, document workflows, image editing, text formatting, and web development.
        </p>
      </div>

      {/* Interactive Live-Filtering Directory Component */}
      <ToolsDirectory initialTools={allTools} />
    </div>
  );
}
