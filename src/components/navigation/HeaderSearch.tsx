'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, ArrowRight, CornerDownLeft, Folder, Wrench } from 'lucide-react';
import {
  searchTools,
  POPULAR_SEARCH_TOOLS,
  POPULAR_SEARCH_CATEGORIES,
  SearchResult,
  SearchableItem,
  GLOBAL_TOOLS_COUNT,
} from '../../lib/searchEngine';

interface HeaderSearchProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSelectResult?: () => void;
}

export const HeaderSearch: React.FC<HeaderSearchProps> = ({
  className = '',
  placeholder = `Search 74+ free tools (e.g. PDF to Word, BMI, JSON)...`,
  autoFocus = false,
  onSelectResult,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce query to keep low-end mobile devices fast
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 60);
    return () => clearTimeout(handler);
  }, [query]);

  // Compute search results based on debounced query
  const searchResult: SearchResult = useMemo(() => {
    return searchTools(debouncedQuery);
  }, [debouncedQuery]);

  const allListItems: SearchableItem[] = useMemo(() => {
    if (!debouncedQuery.trim()) return POPULAR_SEARCH_TOOLS;
    return [...searchResult.bestMatches, ...searchResult.relatedMatches];
  }, [debouncedQuery, searchResult]);

  // Reset selected keyboard index when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard navigation: ArrowUp, ArrowDown, Enter, Escape
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < allListItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : allListItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < allListItems.length) {
        const item = allListItems[selectedIndex];
        handleSelectTool(item.url);
      } else if (query.trim()) {
        handleFormSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectTool = (url: string) => {
    setIsOpen(false);
    setQuery('');
    if (onSelectResult) onSelectResult();
    router.push(url);
  };

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    if (onSelectResult) onSelectResult();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Box */}
      <form onSubmit={handleFormSubmit} className="relative w-full">
        <label htmlFor="header-search-input" className="sr-only">
          Search all free tools and calculators
        </label>
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
        <input
          id="header-search-input"
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className="w-full pl-10 pr-10 py-2.5 sm:py-3 min-h-[44px] text-xs sm:text-sm bg-white border-2 border-neutral-300 hover:border-neutral-400 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all placeholder:text-neutral-500 font-medium shadow-2xs"
        />

        {/* Clear Button (✕) */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center text-neutral-400 hover:text-neutral-900 rounded-full cursor-pointer"
            title="Clear search"
            aria-label="Clear search query"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Instant Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-2xl shadow-xl p-3 z-50 flex flex-col gap-3 max-h-[420px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {/* STATE 1: Empty Query - Display Popular Tools & Categories */}
          {!query.trim() && (
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-2 block mb-1">
                  Popular Tools
                </span>
                <div className="flex flex-col gap-0.5">
                  {POPULAR_SEARCH_TOOLS.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTool(item.url)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full min-h-[40px] flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-medium transition-colors cursor-pointer ${
                        selectedIndex === idx
                          ? 'bg-neutral-900 text-white font-semibold'
                          : 'hover:bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Wrench className={`w-3.5 h-3.5 shrink-0 ${selectedIndex === idx ? 'text-white' : 'text-neutral-400'}`} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                        selectedIndex === idx ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {item.categoryName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-2 block mb-1.5">
                  Browse Categories
                </span>
                <div className="flex flex-wrap gap-1.5 px-1">
                  {POPULAR_SEARCH_CATEGORIES.map(cat => (
                    <Link
                      key={cat.url}
                      href={cat.url}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded-full text-xs text-neutral-700 font-medium transition-colors min-h-[32px]"
                    >
                      <Folder className="w-3 h-3 opacity-60" /> {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: Has Results */}
          {query.trim() !== '' && searchResult.totalCount > 0 && (
            <div className="flex flex-col gap-2">
              {/* Category Filter Chips if matched */}
              {searchResult.categories.length > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 overflow-x-auto text-[11px] border-b border-neutral-100 pb-2">
                  <span className="text-neutral-400 font-medium shrink-0">Matching Categories:</span>
                  {searchResult.categories.map(cat => (
                    <Link
                      key={cat.slug}
                      href={cat.url}
                      onClick={() => setIsOpen(false)}
                      className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md shrink-0 font-medium transition-colors"
                    >
                      {cat.name} ({cat.count})
                    </Link>
                  ))}
                </div>
              )}

              {/* Best Matches */}
              {searchResult.bestMatches.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-2 mb-1 block">
                    Best Matches ({searchResult.bestMatches.length})
                  </span>
                  {searchResult.bestMatches.map((item, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTool(item.url)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full min-h-[44px] flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-900 text-white'
                            : 'hover:bg-neutral-100 text-neutral-900'
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold truncate">{item.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                              isSelected ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-500'
                            }`}>
                              {item.url}
                            </span>
                          </div>
                          <span className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? 'text-neutral-300' : 'text-neutral-500'
                          }`}>
                            {item.shortDescription}
                          </span>
                        </div>

                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                          isSelected ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {item.categoryName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Related Matches */}
              {searchResult.relatedMatches.length > 0 && (
                <div className="flex flex-col gap-0.5 mt-1 border-t border-neutral-100 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-2 mb-1 block">
                    Related Tools ({searchResult.relatedMatches.length})
                  </span>
                  {searchResult.relatedMatches.map((item, relIdx) => {
                    const idx = searchResult.bestMatches.length + relIdx;
                    const isSelected = selectedIndex === idx;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTool(item.url)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full min-h-[38px] flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-900 text-white font-semibold'
                            : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <span className="truncate">{item.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                          isSelected ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-500'
                        }`}>
                          {item.categoryName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Footer View All Link */}
              <div className="border-t border-neutral-100 pt-2 mt-1 flex items-center justify-between px-2">
                <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                  <CornerDownLeft className="w-3 h-3" /> Press Enter to select
                </span>
                <button
                  type="button"
                  onClick={() => handleFormSubmit()}
                  className="text-xs font-bold text-neutral-900 hover:underline inline-flex items-center gap-1 cursor-pointer py-1"
                >
                  View all results ({searchResult.totalCount}) <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: No Results */}
          {query.trim() !== '' && searchResult.totalCount === 0 && (
            <div className="p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="p-3 bg-neutral-100 rounded-full text-neutral-400">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">No tools found</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  We couldn&apos;t find a tool matching &quot;<strong>{query}</strong>&quot;.
                </p>
              </div>

              <div className="mt-2 text-xs font-semibold text-neutral-600">
                Try searching for:
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {['PDF', 'Calculator', 'Converter', 'Image Tools', 'JSON', 'Word'].map(term => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      inputRef.current?.focus();
                    }}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded-lg text-xs text-neutral-700 font-medium transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
