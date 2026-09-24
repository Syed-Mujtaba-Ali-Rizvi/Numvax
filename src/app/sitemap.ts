import { MetadataRoute } from 'next';
import { prisma } from '../lib/prisma';
import { ensureDatabaseSeeded } from '../lib/dbSeeder';
import { CALCULATOR_CATALOG } from '../lib/catalog';
import { TOOL_CATALOG } from '../lib/toolCatalog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://numvax.com';
  const now = new Date();

  const staticSlugs = [
    { slug: '', priority: 1.0, changeFrequency: 'daily' as const },
    { slug: 'calculators', priority: 0.9, changeFrequency: 'daily' as const },
    { slug: 'tools', priority: 0.9, changeFrequency: 'daily' as const },
    { slug: 'all-tools', priority: 0.9, changeFrequency: 'daily' as const },
    { slug: 'about', priority: 0.6, changeFrequency: 'monthly' as const },
    { slug: 'contact', priority: 0.6, changeFrequency: 'monthly' as const },
    { slug: 'privacy-policy', priority: 0.3, changeFrequency: 'monthly' as const },
    { slug: 'cookie-policy', priority: 0.3, changeFrequency: 'monthly' as const },
    { slug: 'terms', priority: 0.3, changeFrequency: 'monthly' as const },
    { slug: 'disclaimer', priority: 0.3, changeFrequency: 'monthly' as const },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticSlugs.map((p) => ({
    url: p.slug ? `${baseUrl}/${p.slug}` : `${baseUrl}/`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  let tools: Array<{ slug: string; updatedAt: Date }> = [];
  let categories: Array<{ slug: string; updatedAt: Date }> = [];

  try {
    await ensureDatabaseSeeded();
    tools = await prisma.tool.findMany({
      where: {
        isEnabled: true,
        isDraft: false,
        inSitemap: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    categories = await prisma.toolCategory.findMany({
      where: { noIndex: false },
      select: { slug: true, updatedAt: true },
    });
  } catch (err) {
    console.error('[sitemap] DB query fallback to catalog:', err);
  }

  // Fallback to static catalog if DB returned empty
  if (tools.length === 0) {
    const calcSlugs = Object.keys(CALCULATOR_CATALOG);
    const toolSlugs = Object.keys(TOOL_CATALOG);
    const allSlugs = Array.from(new Set([...calcSlugs, ...toolSlugs]));
    tools = allSlugs.map((s) => ({ slug: s, updatedAt: now }));
  }

  const toolEntries: MetadataRoute.Sitemap = tools.map((t) => ({
    url: `${baseUrl}/${t.slug}`,
    lastModified: t.updatedAt || now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/tools/category/${c.slug}`,
    lastModified: c.updatedAt || now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...toolEntries];
}
