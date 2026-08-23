import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { HeaderSearch } from '@/components/navigation/HeaderSearch';
import { searchTools, getAllSearchableTools, POPULAR_SEARCH_CATEGORIES, GLOBAL_TOOLS_COUNT, SearchCategoryMatch, SearchableItem } from '@/lib/searchEngine';
import { Search, Wrench, ArrowRight, Folder } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Search Online Tools & Calculators | Numvax',
  description: `Search all free online calculators, converters, developer utilities, PDF tools, and text tools on Numvax.`,
  robots: {
    index: false,
    follow: true,
  },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function SearchResultsContent({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams;
  const query = q.trim();
  const results = searchTools(query);
  const allTools = getAllSearchableTools();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-8">
      {/* Header Search Box */}
      <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto w-full">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
          Search Numvax Tools
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600">
          Find any calculator, converter, or utility instantly across our entire {GLOBAL_TOOLS_COUNT}+ tool database.
        </p>
        <div className="mt-2">
          <HeaderSearch placeholder={`Type to search ${GLOBAL_TOOLS_COUNT}+ free tools (e.g. PDF to Word, BMI, Percentage...)`} />
        </div>
      </div>

      {/* Results Header */}
      {query ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-4">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-neutral-400" />
              Search Results for &quot;<span className="text-neutral-900">{query}</span>&quot;
            </h2>
            <span className="text-xs font-semibold px-3 py-1 bg-neutral-100 rounded-full text-neutral-700">
              {results.totalCount} tool(s) found
            </span>
          </div>

          {/* Category Chips */}
          {results.categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-neutral-500">Matching Categories:</span>
              {results.categories.map(cat => (
                <Link
                  key={cat.slug}
                  href={cat.url}
                  className="px-3 py-1 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded-full text-neutral-800 font-medium transition-colors"
                >
                  {cat.name} ({cat.count})
                </Link>
              ))}
            </div>
          )}

          {/* Results Grid */}
          {results.totalCount > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[...results.bestMatches, ...results.relatedMatches].map(item => (
                <Link
                  key={item.id}
                  href={item.url}
                  className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs hover:border-neutral-900 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{item.categoryName}</span>
                      <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{item.url}</span>
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 group-hover:text-neutral-900 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">
                      {item.shortDescription}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-neutral-900 pt-2 border-t border-neutral-100 group-hover:translate-x-1 transition-transform">
                    Open Tool <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-neutral-50 border border-neutral-200 rounded-2xl text-center flex flex-col items-center gap-4 max-w-lg mx-auto">
              <div className="p-4 bg-white border border-neutral-200 rounded-full text-neutral-400">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">No tools found</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  We couldn&apos;t find a tool matching &quot;<strong>{query}</strong>&quot;.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <span className="text-xs text-neutral-500 block w-full mb-1">Try browsing popular categories:</span>
                {POPULAR_SEARCH_CATEGORIES.map(cat => (
                  <Link
                    key={cat.url}
                    href={cat.url}
                    className="px-3 py-1 bg-white border border-neutral-200 hover:border-neutral-900 rounded-full text-xs font-medium text-neutral-700 transition-all"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty Query Showcase Page */
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Wrench className="w-5 h-5" /> Browse All Available Tools ({allTools.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {allTools.slice(0, 24).map(item => (
              <Link
                key={item.id}
                href={item.url}
                className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs hover:border-neutral-900 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">{item.categoryName}</span>
                  <h3 className="text-sm font-bold text-neutral-900 group-hover:underline">
                    {item.name}
                  </h3>
                  <p className="text-xs text-neutral-600 line-clamp-2 mt-1 leading-relaxed">
                    {item.shortDescription}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-neutral-900 pt-2 border-t border-neutral-100">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage(props: SearchPageProps) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">Loading search results...</div>}>
      <SearchResultsContent {...props} />
    </Suspense>
  );
}
