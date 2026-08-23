'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Wrench, Calculator, ArrowRight, Filter } from 'lucide-react';

export interface DirectoryToolItem {
  slug: string;
  name: string;
  shortDescription: string;
  categoryName: string;
  categorySlug: string;
  href: string;
  isCalculator?: boolean;
}

interface ToolsDirectoryProps {
  initialTools: DirectoryToolItem[];
}

export const ToolsDirectory: React.FC<ToolsDirectoryProps> = ({ initialTools }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Extract unique categories in order
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialTools.forEach((tool) => set.add(tool.categoryName));
    return ['All', ...Array.from(set)];
  }, [initialTools]);

  // Filter tools live based on search query and category selection
  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return initialTools.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        tool.categoryName.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.categoryName.toLowerCase().includes(q) ||
        tool.slug.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [initialTools, searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search & Filter Controls Bar */}
      <div className="flex flex-col gap-4 bg-white p-4 sm:p-6 border border-neutral-200 rounded-2xl shadow-xs">
        {/* Instant Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter tools by name, description, or keyword (e.g. Loan, PDF, Image, JSON)..."
            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:bg-white transition-all placeholder:text-neutral-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-xs font-semibold text-neutral-500 hover:text-neutral-900 bg-neutral-200 px-2 py-0.5 rounded-md cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Chips Filter */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by Category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Directory Header Bar & Counter */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          Showing {filteredTools.length} of {initialTools.length} Tools
        </span>
        {(searchQuery || selectedCategory !== 'All') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="text-xs text-neutral-500 hover:text-neutral-900 underline font-medium cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => {
            const Icon = tool.isCalculator ? Calculator : Wrench;
            return (
              <Link
                key={tool.slug}
                href={tool.href}
                className="group flex flex-col justify-between p-6 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-900 hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-neutral-900 font-bold text-base">
                      <div className="p-2 rounded-xl bg-neutral-100 text-neutral-800 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="line-clamp-1">{tool.name}</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                    {tool.shortDescription}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 mt-6 pt-3 border-t border-neutral-100">
                  <span className="text-[11px] text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded-full font-medium">
                    {tool.categoryName}
                  </span>
                  <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white border border-neutral-200 rounded-2xl flex flex-col items-center gap-3">
          <p className="text-base font-bold text-neutral-900">No tools found matching your criteria</p>
          <p className="text-xs text-neutral-500">Try searching for different keywords or select another category filter.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-2 px-4 py-2 bg-neutral-900 text-white rounded-full text-xs font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
