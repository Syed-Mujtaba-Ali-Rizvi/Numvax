import { MetadataRoute } from 'next';
import { prisma } from '../lib/prisma';
import { ensureDatabaseSeeded } from '../lib/dbSeeder';

export default async function robots(): Promise<MetadataRoute.Robots> {
  let robotsTxtContent: string | null = null;
  try {
    await ensureDatabaseSeeded();
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
      select: { robotsTxtContent: true },
    });
    robotsTxtContent = settings?.robotsTxtContent || null;
  } catch (err) {
    console.error('[robots.ts] Error fetching settings:', err);
  }

  // If custom rules configured, check if noindex or disallow
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: 'https://numvax.com/sitemap.xml',
  };
}
