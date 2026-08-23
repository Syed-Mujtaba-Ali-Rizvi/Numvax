import React from 'react';
import Link from 'next/link';
import { ArrowRight, Wrench, Sparkles } from 'lucide-react';
import { getContextualRecommendations, SearchableItem } from '../../lib/searchEngine';

export interface RelatedTool {
  slug: string;
  name: string;
  description: string;
  categorySlug?: string;
  categoryName?: string;
}

export interface CalculatorRelatedToolsProps {
  tools?: RelatedTool[];
  currentSlug?: string;
  categoryName?: string;
  categorySlug?: string;
  useToolLabel?: string;
  locale?: string;
}

export const CalculatorRelatedTools: React.FC<CalculatorRelatedToolsProps> = ({
  tools = [],
  currentSlug = '',
  categoryName,
  categorySlug,
  useToolLabel = 'Open',
  locale = 'en',
}) => {
  // If tools are provided explicitly, use them. Otherwise compute contextual recommendations.
  let displayTools: Array<{ slug: string; name: string; description: string; categoryName?: string }> = tools;

  if (!displayTools || displayTools.length === 0) {
    if (currentSlug) {
      const recs = getContextualRecommendations(currentSlug, 6);
      displayTools = recs.map((r: SearchableItem) => ({
        slug: r.slug,
        name: r.name,
        description: r.shortDescription,
        categoryName: r.categoryName,
      }));
    }
  }

  if (!displayTools || displayTools.length === 0) return null;

  const getHeadingText = () => {
    if (!categorySlug && !categoryName) return 'Related & Trending Tools';
    const slug = (categorySlug || '').toLowerCase();
    const name = (categoryName || '').toLowerCase();

    if (slug.includes('pdf') || name.includes('pdf')) return 'Related PDF Utilities';
    if (slug.includes('image') || name.includes('image')) return 'Related Image Tools & Converters';
    if (slug.includes('developer') || name.includes('developer')) return 'Related Developer Utilities';
    if (slug.includes('seo') || name.includes('seo')) return 'Related SEO & Webmaster Tools';
    if (slug.includes('text') || name.includes('text')) return 'Related Text & Writing Tools';
    if (slug.includes('convert') || name.includes('convert')) return 'Related Unit Converters';
    if (slug.includes('calc') || name.includes('calc') || name.includes('financial') || name.includes('health') || name.includes('math')) {
      return 'Related Online Calculators';
    }
    return `Related ${categoryName || 'Tools'}`;
  };

  const localePath = (path: string) => locale === 'en' ? path : `/${locale}${path}`;

  return (
    <section className="w-full flex flex-col gap-4 mt-8 pt-8 border-t border-neutral-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neutral-800" />
            {getHeadingText()}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">Explore complementary tools and calculators</p>
        </div>
        <Link
          href={localePath('/tools')}
          className="text-xs font-bold text-neutral-800 hover:text-neutral-950 inline-flex items-center gap-1 hover:underline self-start sm:self-auto py-1"
        >
          <span>All 74+ Tools</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {displayTools.map((tool) => (
          <Link
            key={tool.slug}
            href={localePath(`/${tool.slug}`)}
            className="group flex flex-col justify-between p-4 sm:p-5 bg-white border border-neutral-200 hover:border-neutral-900 rounded-2xl shadow-2xs hover:shadow-xs transition-all min-h-[110px]"
            title={`Free online ${tool.name} - Numvax`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs sm:text-sm">
                  <Wrench className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                  <span className="truncate">{tool.name}</span>
                </div>
                {tool.categoryName && (
                  <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full shrink-0">
                    {tool.categoryName}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mt-1">
                {tool.description}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-neutral-900 mt-3 group-hover:translate-x-0.5 transition-transform pt-2 border-t border-neutral-100">
              <span>{useToolLabel} {tool.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
