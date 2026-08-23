/**
 * Numvax Centralized Search Engine & Contextual Recommendation System
 * Single source of truth dynamically constructed from CALCULATOR_CATALOG & TOOL_CATALOG.
 * Provides instant real-time search with multi-level relevance ranking, prefix matching,
 * metadata searching, category matching, alias expansion, lightweight typo tolerance,
 * and contextual recommendation algorithms.
 */

import { CALCULATOR_CATALOG, CalculatorItem } from './catalog';
import { TOOL_CATALOG, ToolPageData } from './toolCatalog';
import { trackSearch } from './analytics';

export interface SearchableItem {
  id: string;
  name: string;
  slug: string;
  url: string;
  categoryName: string;
  categorySlug: string;
  type: 'calculator' | 'tool';
  shortDescription: string;
  keywords: string[];
}

export interface SearchCategoryMatch {
  name: string;
  slug: string;
  url: string;
  count: number;
}

export interface SearchResult {
  bestMatches: SearchableItem[];
  relatedMatches: SearchableItem[];
  categories: SearchCategoryMatch[];
  totalCount: number;
}

// ─── Query Aliases & Synonym Map ─────────────────────────────────────────────

const SEARCH_ALIASES: Record<string, string[]> = {
  'compress image': ['image-compressor', 'bulk-image-compressor'],
  'reduce image size': ['image-compressor', 'bulk-image-compressor'],
  'pdf': ['merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-word', 'pdf-to-jpg', 'pdf-to-excel', 'word-to-pdf', 'jpg-to-pdf', 'edit-pdf', 'scan-to-pdf'],
  'gpa': ['gpa-calculator'],
  'grade': ['gpa-calculator', 'percentage-calculator'],
  'jpg png': ['image-converter', 'image-compressor', 'image-resizer'],
  'png jpg': ['image-converter', 'image-compressor', 'image-resizer'],
  'photo to doc': ['image-to-word', 'scan-to-pdf'],
  'ocr': ['image-to-word', 'pdf-to-word', 'scan-to-pdf'],
  'format code': ['json-formatter', 'html-formatter', 'css-formatter', 'js-formatter', 'sql-formatter'],
  'password': ['password-generator'],
  'qr': ['qr-code-generator', 'image-qr-code-generator', 'bulk-qr-code-generator'],
  'unit': ['length-converter', 'weight-converter', 'temperature-converter', 'speed-converter', 'volume-converter', 'area-converter', 'data-unit-converter'],
};

// ─── Build Global Tool Index ──────────────────────────────────────────────────

function buildSearchIndex(): SearchableItem[] {
  const items: SearchableItem[] = [];

  // 1. Calculators
  Object.values(CALCULATOR_CATALOG).forEach((calc: CalculatorItem) => {
    items.push({
      id: `calc_${calc.slug}`,
      name: calc.name,
      slug: calc.slug,
      url: `/${calc.slug}`,
      categoryName: calc.categoryName,
      categorySlug: calc.categorySlug,
      type: 'calculator',
      shortDescription: calc.shortDescription,
      keywords: calc.keywords || [calc.name.toLowerCase(), calc.slug.replace(/-/g, ' ')],
    });
  });

  // 2. Tools
  Object.values(TOOL_CATALOG).forEach((tool: ToolPageData) => {
    items.push({
      id: `tool_${tool.slug}`,
      name: tool.name,
      slug: tool.slug,
      url: `/${tool.slug}`,
      categoryName: tool.categoryName,
      categorySlug: tool.categorySlug,
      type: 'tool',
      shortDescription: tool.shortDescription,
      keywords: tool.keywords || [tool.name.toLowerCase(), tool.slug.replace(/-/g, ' ')],
    });
  });

  return items;
}

const GLOBAL_SEARCH_INDEX: SearchableItem[] = buildSearchIndex();

// ─── Levenshtein Distance for Typo Tolerance ──────────────────────────────────

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// ─── Search Matching & Scoring Algorithm ──────────────────────────────────────

export function searchTools(query: string): SearchResult {
  const cleanQuery = query.trim().toLowerCase();

  if (!cleanQuery) {
    return {
      bestMatches: [],
      relatedMatches: [],
      categories: [],
      totalCount: 0,
    };
  }

  const queryWords = cleanQuery.split(/\s+/).filter(Boolean);

  interface ScoredItem {
    item: SearchableItem;
    score: number;
  }

  const scoredList: ScoredItem[] = [];

  // Check for alias matching
  const aliasMatchedSlugs = new Set<string>();
  for (const [aliasPattern, targetSlugs] of Object.entries(SEARCH_ALIASES)) {
    if (cleanQuery.includes(aliasPattern) || aliasPattern.includes(cleanQuery)) {
      targetSlugs.forEach(slug => aliasMatchedSlugs.add(slug));
    }
  }

  for (const item of GLOBAL_SEARCH_INDEX) {
    const nameLower = item.name.toLowerCase();
    const slugLower = item.slug.toLowerCase().replace(/-/g, ' ');
    const categoryLower = item.categoryName.toLowerCase();
    const descLower = item.shortDescription.toLowerCase();
    const keywordsLower = item.keywords.map(k => k.toLowerCase());

    let score = 0;

    // 0. Alias Direct Hit (Score 95)
    if (aliasMatchedSlugs.has(item.slug)) {
      score = Math.max(score, 95);
    }

    // 1. Exact Match (Score 100)
    if (nameLower === cleanQuery || slugLower === cleanQuery) {
      score = 100;
    }
    // 2. Name Starts With Query (Prefix Match) (Score 90)
    else if (nameLower.startsWith(cleanQuery) || slugLower.startsWith(cleanQuery)) {
      score = Math.max(score, 90);
    }
    // 3. Name Contains Query (Score 80)
    else if (nameLower.includes(cleanQuery) || slugLower.includes(cleanQuery)) {
      score = Math.max(score, 80);
    }
    // 4. Keyword Exact or Prefix Match (Score 75)
    else if (keywordsLower.some(k => k === cleanQuery || k.startsWith(cleanQuery))) {
      score = Math.max(score, 75);
    }
    // 5. All Query Words Matched in Name or Keywords (Score 70)
    else if (queryWords.every(w => nameLower.includes(w) || keywordsLower.some(k => k.includes(w)))) {
      score = Math.max(score, 70);
    }
    // 6. Keyword Contains Query (Score 60)
    else if (keywordsLower.some(k => k.includes(cleanQuery))) {
      score = Math.max(score, 60);
    }
    // 7. Category or Description Match (Score 50)
    else if (categoryLower.includes(cleanQuery) || descLower.includes(cleanQuery)) {
      score = Math.max(score, 50);
    }
    // 8. Typo Tolerance / Fuzzy Match (Score 35-45)
    else if (cleanQuery.length >= 3) {
      const nameWords = nameLower.split(/\s+/);
      for (const nw of nameWords) {
        if (nw.length >= 3 && Math.abs(nw.length - cleanQuery.length) <= 2) {
          const dist = levenshteinDistance(cleanQuery, nw);
          if (dist <= 2) {
            score = Math.max(score, 45 - dist * 5);
            break;
          }
        }
      }
      if (score === 0) {
        for (const kw of keywordsLower) {
          if (Math.abs(kw.length - cleanQuery.length) <= 2) {
            const dist = levenshteinDistance(cleanQuery, kw);
            if (dist <= 2) {
              score = Math.max(score, 35 - dist * 5);
              break;
            }
          }
        }
      }
    }

    if (score > 0) {
      scoredList.push({ item, score });
    }
  }

  scoredList.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.name.localeCompare(b.item.name);
  });

  const bestMatches = scoredList.filter(s => s.score >= 60).map(s => s.item);
  const relatedMatches = scoredList.filter(s => s.score < 60).map(s => s.item);

  const categoryMap = new Map<string, { name: string; slug: string; count: number }>();
  for (const s of scoredList) {
    const catName = s.item.categoryName;
    const catSlug = s.item.categorySlug;
    const existing = categoryMap.get(catSlug) || { name: catName, slug: catSlug, count: 0 };
    existing.count++;
    categoryMap.set(catSlug, existing);
  }

  const categories: SearchCategoryMatch[] = Array.from(categoryMap.values()).map(c => ({
    name: c.name,
    slug: c.slug,
    url: c.slug === 'calculators' ? '/calculators' : `/tools/category/${c.slug}`,
    count: c.count,
  }));

  const totalCount = bestMatches.length + relatedMatches.length;

  try {
    trackSearch(cleanQuery, totalCount);
  } catch {}

  return {
    bestMatches,
    relatedMatches,
    categories,
    totalCount,
  };
}

// ─── Contextual Recommendations Engine ────────────────────────────────────────

export function getContextualRecommendations(currentSlug: string, limit = 6): SearchableItem[] {
  const currentItem = GLOBAL_SEARCH_INDEX.find(i => i.slug === currentSlug);
  const results: SearchableItem[] = [];
  const addedSlugs = new Set<string>([currentSlug]);

  if (!currentItem) {
    return POPULAR_SEARCH_TOOLS.slice(0, limit);
  }

  // 1. Check if tool has explicitly defined related tools
  const toolData = TOOL_CATALOG[currentSlug] || CALCULATOR_CATALOG[currentSlug];
  if (toolData?.relatedTools && toolData.relatedTools.length > 0) {
    for (const rel of toolData.relatedTools) {
      const match = GLOBAL_SEARCH_INDEX.find(i => i.slug === rel.slug);
      if (match && !addedSlugs.has(match.slug)) {
        results.push(match);
        addedSlugs.add(match.slug);
        if (results.length >= limit) return results;
      }
    }
  }

  // 2. Same Category Items
  const sameCategoryItems = GLOBAL_SEARCH_INDEX.filter(
    i => i.categorySlug === currentItem.categorySlug && !addedSlugs.has(i.slug)
  );
  for (const item of sameCategoryItems) {
    results.push(item);
    addedSlugs.add(item.slug);
    if (results.length >= limit) return results;
  }

  // 3. Workflow Complementary Tools (e.g. PDF tools <-> Image tools)
  const complementaryCategoryMap: Record<string, string[]> = {
    'pdf-tools': ['image-tools', 'scanner', 'developer-tools'],
    'image-tools': ['pdf-tools', 'developer-tools'],
    'developer-tools': ['text-tools', 'seo-tools'],
    'text-tools': ['developer-tools', 'seo-tools'],
    'converters': ['calculators', 'developer-tools'],
    'health': ['math', 'financial'],
    'financial': ['math', 'health'],
    'math': ['financial', 'health', 'converters'],
  };

  const complementaryCats = complementaryCategoryMap[currentItem.categorySlug] || [];
  for (const catSlug of complementaryCats) {
    const compItems = GLOBAL_SEARCH_INDEX.filter(
      i => i.categorySlug === catSlug && !addedSlugs.has(i.slug)
    );
    for (const item of compItems) {
      results.push(item);
      addedSlugs.add(item.slug);
      if (results.length >= limit) return results;
    }
  }

  // 4. Popular Fallback Tools
  for (const pop of POPULAR_SEARCH_TOOLS) {
    if (!addedSlugs.has(pop.slug)) {
      results.push(pop);
      addedSlugs.add(pop.slug);
      if (results.length >= limit) return results;
    }
  }

  return results.slice(0, limit);
}

// ─── Popular Tools for Empty Search State ─────────────────────────────────────

export const POPULAR_SEARCH_TOOLS: SearchableItem[] = [
  GLOBAL_SEARCH_INDEX.find(i => i.slug === 'pdf-to-word')!,
  GLOBAL_SEARCH_INDEX.find(i => i.slug === 'image-to-word')!,
  GLOBAL_SEARCH_INDEX.find(i => i.slug === 'percentage-calculator')!,
  GLOBAL_SEARCH_INDEX.find(i => i.slug === 'image-compressor')!,
  GLOBAL_SEARCH_INDEX.find(i => i.slug === 'bmi-calculator')!,
  GLOBAL_SEARCH_INDEX.find(i => i.slug === 'json-formatter')!,
  GLOBAL_SEARCH_INDEX.find(i => i.slug === 'merge-pdf')!,
  GLOBAL_SEARCH_INDEX.find(i => i.slug === 'word-counter')!,
].filter(Boolean);

export const POPULAR_SEARCH_CATEGORIES = [
  { name: 'PDF Tools', url: '/tools/category/pdf-tools' },
  { name: 'Calculators', url: '/calculators' },
  { name: 'Image Tools', url: '/tools/category/image-tools' },
  { name: 'Developer Tools', url: '/tools/category/developer-tools' },
  { name: 'Text Tools', url: '/tools/category/text-tools' },
  { name: 'Converters', url: '/tools/category/converters' },
  { name: 'SEO Tools', url: '/tools/category/seo-tools' },
];

export function getAllSearchableTools(): SearchableItem[] {
  return GLOBAL_SEARCH_INDEX;
}

export const GLOBAL_TOOLS_COUNT = GLOBAL_SEARCH_INDEX.length;
