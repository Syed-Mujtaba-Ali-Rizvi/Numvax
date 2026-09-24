import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminApi } from '@/lib/adminAuth';
import { ensureDatabaseSeeded } from '@/lib/dbSeeder';
import { recordRevision } from '@/lib/contentService';

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseSeeded();
    const session = await verifyAdminApi(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [tools, pages] = await Promise.all([
      prisma.tool.findMany({
        include: { content: true, category: true },
        orderBy: { name: 'asc' },
      }),
      prisma.pageContent.findMany({
        orderBy: { title: 'asc' },
      }),
    ]);

    const items = [
      ...tools.map((t) => {
        let score = 100;
        const c = t.content;
        if (!c?.metaTitle || c.metaTitle.length < 30) score -= 20;
        if (!c?.metaDescription || c.metaDescription.length < 80) score -= 20;
        if (!t.focusKeyword) score -= 20;
        if (!c?.h1Title) score -= 15;
        if (!c?.ogImage) score -= 10;
        if (!c?.faqItemsJson || c.faqItemsJson === '[]') score -= 15;
        score = Math.max(0, score);

        return {
          id: t.id,
          type: 'tool',
          name: t.name,
          slug: t.slug,
          url: `https://numvax.com/${t.slug}`,
          category: t.category.name,
          seoTitle: c?.metaTitle || '',
          metaDescription: c?.metaDescription || '',
          focusKeyword: t.focusKeyword || '',
          noIndex: c?.noIndex ?? false,
          seoScore: score,
        };
      }),
      ...pages.map((p) => {
        let score = 100;
        if (!p.metaTitle || p.metaTitle.length < 20) score -= 30;
        if (!p.metaDescription || p.metaDescription.length < 60) score -= 30;
        if (!p.focusKeyword) score -= 20;
        score = Math.max(0, score);

        return {
          id: p.id,
          type: 'page',
          name: p.title,
          slug: p.slug,
          url: `https://numvax.com/${p.slug === 'homepage' ? '' : p.slug}`,
          category: 'Static Page',
          seoTitle: p.metaTitle || '',
          metaDescription: p.metaDescription || '',
          focusKeyword: p.focusKeyword || '',
          noIndex: p.noIndex ?? false,
          seoScore: score,
        };
      }),
    ];

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('[API Bulk SEO GET Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureDatabaseSeeded();
    const session = await verifyAdminApi(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { updates } = body as {
      updates: Array<{
        id: string;
        type: 'tool' | 'page';
        seoTitle: string;
        metaDescription: string;
        focusKeyword: string;
        noIndex: boolean;
      }>;
    };

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No updates provided' }, { status: 400 });
    }

    let updatedCount = 0;

    for (const item of updates) {
      if (item.type === 'tool') {
        await prisma.tool.update({
          where: { id: item.id },
          data: {
            focusKeyword: item.focusKeyword,
            content: {
              upsert: {
                create: {
                  metaTitle: item.seoTitle,
                  metaDescription: item.metaDescription,
                  focusKeyword: item.focusKeyword,
                  noIndex: item.noIndex,
                },
                update: {
                  metaTitle: item.seoTitle,
                  metaDescription: item.metaDescription,
                  focusKeyword: item.focusKeyword,
                  noIndex: item.noIndex,
                },
              },
            },
          },
        });
        updatedCount++;
      } else if (item.type === 'page') {
        await prisma.pageContent.update({
          where: { id: item.id },
          data: {
            metaTitle: item.seoTitle,
            metaDescription: item.metaDescription,
            focusKeyword: item.focusKeyword,
            noIndex: item.noIndex,
          },
        });
        updatedCount++;
      }
    }

    await recordRevision({
      entityType: 'bulk-seo',
      entityId: 'bulk',
      entityTitle: `Bulk SEO update (${updatedCount} items)`,
      action: 'UPDATE',
      changedBy: session.email,
      newData: updates,
    });

    return NextResponse.json({ success: true, message: `Successfully updated ${updatedCount} items`, updatedCount });
  } catch (error) {
    console.error('[API Bulk SEO PUT Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
