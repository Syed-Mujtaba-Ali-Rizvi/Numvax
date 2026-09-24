import { prisma } from './prisma';
import { ensureDatabaseSeeded } from './dbSeeder';
import { CALCULATOR_CATALOG, CalculatorPageData } from './catalog';
import { TOOL_CATALOG, ToolPageData } from './toolCatalog';
import { FAQItem } from '@/components/calculator/CalculatorFAQ';
import { RelatedTool } from '@/components/calculator/CalculatorRelatedTools';

export interface MergedToolData {
  id?: string;
  slug: string;
  name: string;
  h1Title: string;
  metaTitle: string;
  metaDescription: string;
  categoryName: string;
  categorySlug: string;
  type: string;
  shortDescription: string;
  description: string;
  explanation: string;
  directAnswer?: string;
  formulaTitle?: string;
  formulaDescription?: string;
  instructionsTitle?: string;
  instructionsDescription?: string;
  useCases?: string;
  trustCopy?: string;
  workedExamples: Array<{ title: string; example: string }>;
  faqs: FAQItem[];
  relatedTools: RelatedTool[];
  keywords: string[];
  focusKeyword?: string;
  secondaryKeywords?: string;
  searchKeywords?: string;
  searchAliases?: string;
  canonicalUrl?: string;
  noIndex: boolean;
  noFollow: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  customSchemaJson?: string;
  isPopular: boolean;
  isFeatured: boolean;
  isEnabled: boolean;
  isDraft: boolean;
  inSitemap: boolean;
}

// ─── Get Single Tool with Full Merged Content ─────────────────────────────────

export async function getToolWithContent(slug: string): Promise<MergedToolData | null> {
  await ensureDatabaseSeeded();

  // 1. Static fallback reference
  const staticCalc = CALCULATOR_CATALOG[slug];
  const staticTool = TOOL_CATALOG[slug];
  const staticItem = staticCalc || staticTool;

  // 2. Query Database
  let dbTool = null;
  try {
    dbTool = await prisma.tool.findUnique({
      where: { slug },
      include: {
        category: true,
        content: true,
      },
    });
  } catch (err) {
    console.error(`[contentService] Error querying tool ${slug}:`, err);
  }

  // If neither exists in DB nor static catalog, return null (404)
  if (!dbTool && !staticItem) {
    return null;
  }

  const content = dbTool?.content;

  // Parse JSON fields safely
  let workedExamples: Array<{ title: string; example: string }> = [];
  if (content?.workedExamplesJson) {
    try {
      workedExamples = JSON.parse(content.workedExamplesJson);
    } catch {}
  } else if (staticItem?.workedExamples) {
    workedExamples = staticItem.workedExamples;
  }

  let faqs: FAQItem[] = [];
  if (content?.faqItemsJson) {
    try {
      faqs = JSON.parse(content.faqItemsJson);
    } catch {}
  } else if (staticItem?.faqs) {
    faqs = staticItem.faqs;
  }

  // Related Tools
  let relatedTools: RelatedTool[] = [];
  if (dbTool?.relatedToolSlugs) {
    try {
      const slugs: string[] = JSON.parse(dbTool.relatedToolSlugs);
      relatedTools = slugs.map((s) => {
        const item = CALCULATOR_CATALOG[s] || TOOL_CATALOG[s];
        return {
          slug: s,
          name: item?.name || s.replace(/-/g, ' '),
          categorySlug: item?.categorySlug || 'general',
          description: item?.shortDescription || '',
        };
      });
    } catch {}
  } else if (staticItem?.relatedTools) {
    relatedTools = staticItem.relatedTools;
  }

  const name = dbTool?.name || staticItem?.name || slug;
  const metaTitle = content?.metaTitle || dbTool?.name || staticItem?.metaTitle || `${name} — Free Online Tool | Numvax`;
  const metaDescription =
    content?.metaDescription ||
    dbTool?.shortDescription ||
    staticItem?.metaDescription ||
    staticItem?.shortDescription ||
    '';
  const h1Title = content?.h1Title || staticItem?.h1Title || name;
  const explanation = content?.explanation || dbTool?.description || staticItem?.explanation || '';

  return {
    id: dbTool?.id,
    slug: dbTool?.slug || slug,
    name,
    h1Title,
    metaTitle,
    metaDescription,
    categoryName: dbTool?.category?.name || staticItem?.categoryName || 'Tools',
    categorySlug: dbTool?.category?.slug || staticItem?.categorySlug || 'tools',
    type: dbTool?.type || (staticItem && 'type' in staticItem ? staticItem.type : 'calculator'),
    shortDescription: dbTool?.shortDescription || staticItem?.shortDescription || '',
    description: dbTool?.description || staticItem?.explanation || '',
    explanation,
    directAnswer: content?.directAnswer || staticItem?.directAnswer,
    formulaTitle: content?.formulaTitle || (staticCalc ? staticCalc.formulaTitle : undefined),
    formulaDescription: content?.formulaDescription || (staticCalc ? staticCalc.formulaDescription : undefined),
    instructionsTitle: content?.instructionsTitle || (staticTool ? staticTool.instructionsTitle : undefined),
    instructionsDescription:
      content?.instructionsDescription || (staticTool ? staticTool.instructionsDescription : undefined),
    useCases: content?.useCases || staticItem?.useCases,
    trustCopy: content?.trustCopy || (staticTool ? staticTool.trustCopy : undefined),
    workedExamples,
    faqs,
    relatedTools,
    keywords: dbTool?.searchKeywords ? dbTool.searchKeywords.split(',').map((k) => k.trim()) : staticItem?.keywords || [],
    focusKeyword: content?.focusKeyword || dbTool?.focusKeyword || (staticItem?.keywords?.[0] || ''),
    secondaryKeywords: content?.secondaryKeywords || dbTool?.secondaryKeywords || '',
    searchKeywords: dbTool?.searchKeywords || (staticItem?.keywords || []).join(', '),
    searchAliases: dbTool?.searchAliases || `${name.toLowerCase()}, ${slug.replace(/-/g, ' ')}`,
    canonicalUrl: content?.canonicalUrl || `https://numvax.com/${slug}`,
    noIndex: content?.noIndex ?? false,
    noFollow: content?.noFollow ?? false,
    ogTitle: content?.ogTitle || metaTitle,
    ogDescription: content?.ogDescription || metaDescription,
    ogImage: content?.ogImage || '/og-image.jpg',
    twitterTitle: content?.twitterTitle || metaTitle,
    twitterDescription: content?.twitterDescription || metaDescription,
    twitterImage: content?.twitterImage || '/og-image.jpg',
    customSchemaJson: content?.customSchemaJson || undefined,
    isPopular: dbTool?.isPopular ?? false,
    isFeatured: dbTool?.isFeatured ?? false,
    isEnabled: dbTool?.isEnabled ?? true,
    isDraft: dbTool?.isDraft ?? false,
    inSitemap: dbTool?.inSitemap ?? true,
  };
}

// ─── Get Page Content ────────────────────────────────────────────────────────

export async function getPageContent(slug: string) {
  await ensureDatabaseSeeded();

  try {
    const page = await prisma.pageContent.findUnique({
      where: { slug },
    });
    return page;
  } catch (err) {
    console.error(`[contentService] Error querying page ${slug}:`, err);
    return null;
  }
}

// ─── Get Global Settings ─────────────────────────────────────────────────────

export async function getGlobalSettings() {
  await ensureDatabaseSeeded();

  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });
    return (
      settings || {
        id: 'default',
        siteName: 'Numvax',
        tagline: 'Fast, accurate and easy-to-use free online tools',
        titleTemplate: '{{title}} | Numvax',
        defaultMetaDescription:
          'Fast, accurate and easy-to-use calculators, converters, developer tools, text utilities, and PDF tools.',
        defaultOgImage: '/og-image.jpg',
        defaultRobots: 'index, follow',
        defaultCanonical: 'https://numvax.com',
        contactEmail: 'contact@numvax.com',
        heroHeading: "Every Online Tool You'll Ever Need. 100% Free & Private.",
        heroDescription:
          'Fast, precise, client-side tools: Calculators, PDF utilities, image editors, developer formatters, and converters.',
        searchPlaceholder: 'Search 50+ tools (e.g., BMI Calculator, Merge PDF, JSON Formatter)...',
        featuredToolSlugs: JSON.stringify(['bmi-calculator', 'merge-pdf', 'json-formatter', 'image-compressor']),
        popularToolSlugs: JSON.stringify(['percentage-calculator', 'word-counter', 'uuid-generator', 'pdf-to-word']),
        adsEnabled: true,
        headerAdActive: false,
        sidebarAdActive: true,
        inContentAdActive: true,
        belowResultsAdActive: true,
        footerAdActive: true,
      }
    );
  } catch {
    return null;
  }
}

// ─── Get Active Redirects ────────────────────────────────────────────────────

export async function getActiveRedirects() {
  try {
    return await prisma.redirect.findMany({
      where: { isActive: true },
    });
  } catch {
    return [];
  }
}

// ─── Record Revision History Helper ──────────────────────────────────────────

export async function recordRevision({
  entityType,
  entityId,
  entityTitle,
  action,
  changedBy = 'Admin',
  previousData,
  newData,
}: {
  entityType: string;
  entityId: string;
  entityTitle?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';
  changedBy?: string;
  previousData?: any;
  newData?: any;
}) {
  try {
    await prisma.revisionHistory.create({
      data: {
        entityType,
        entityId,
        entityTitle,
        action,
        changedBy,
        previousData: previousData ? JSON.stringify(previousData) : null,
        newData: newData ? JSON.stringify(newData) : null,
      },
    });
  } catch (err) {
    console.error('[contentService] Error logging revision history:', err);
  }
}
