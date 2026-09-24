import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminApi } from '@/lib/adminAuth';
import { ensureDatabaseSeeded } from '@/lib/dbSeeder';

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseSeeded();
    const session = await verifyAdminApi(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [tools, categories, pages, recentHistory] = await Promise.all([
      prisma.tool.findMany({
        include: {
          category: true,
          content: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.toolCategory.findMany({
        include: { _count: { select: { tools: true } } },
        orderBy: { order: 'asc' },
      }),
      prisma.pageContent.findMany({
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.revisionHistory.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalTools = tools.length;
    const publishedTools = tools.filter((t) => t.isEnabled && !t.isDraft).length;
    const draftTools = tools.filter((t) => t.isDraft || !t.isEnabled).length;

    const totalPages = pages.length;
    const publishedPages = pages.filter((p) => p.isPublished).length;
    const draftPages = pages.filter((p) => !p.isPublished).length;

    // Analyze SEO issues across all tools and pages
    const seoIssues: Array<{
      id: string;
      title: string;
      slug: string;
      type: 'tool' | 'page';
      issue: string;
      severity: 'warning' | 'critical';
    }> = [];

    for (const tool of tools) {
      const c = tool.content;
      if (!c?.metaTitle || c.metaTitle.length < 20) {
        seoIssues.push({
          id: tool.id,
          title: tool.name,
          slug: tool.slug,
          type: 'tool',
          issue: 'Meta title missing or too short (< 20 chars)',
          severity: 'critical',
        });
      }
      if (!c?.metaDescription || c.metaDescription.length < 70) {
        seoIssues.push({
          id: tool.id,
          title: tool.name,
          slug: tool.slug,
          type: 'tool',
          issue: 'Meta description missing or too short (< 70 chars)',
          severity: 'warning',
        });
      } else if (c.metaDescription.length > 170) {
        seoIssues.push({
          id: tool.id,
          title: tool.name,
          slug: tool.slug,
          type: 'tool',
          issue: 'Meta description too long (> 170 chars)',
          severity: 'warning',
        });
      }
      if (!tool.focusKeyword) {
        seoIssues.push({
          id: tool.id,
          title: tool.name,
          slug: tool.slug,
          type: 'tool',
          issue: 'Focus keyword not defined',
          severity: 'warning',
        });
      }
      if (!c?.faqItemsJson || c.faqItemsJson === '[]') {
        seoIssues.push({
          id: tool.id,
          title: tool.name,
          slug: tool.slug,
          type: 'tool',
          issue: 'No FAQ items for rich snippets',
          severity: 'warning',
        });
      }
    }

    for (const page of pages) {
      if (!page.metaTitle || page.metaTitle.length < 15) {
        seoIssues.push({
          id: page.id,
          title: page.title,
          slug: page.slug,
          type: 'page',
          issue: 'Page SEO title missing',
          severity: 'critical',
        });
      }
      if (!page.metaDescription || page.metaDescription.length < 50) {
        seoIssues.push({
          id: page.id,
          title: page.title,
          slug: page.slug,
          type: 'page',
          issue: 'Page meta description missing or short',
          severity: 'warning',
        });
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalTools,
        publishedTools,
        draftTools,
        totalCategories: categories.length,
        totalPages,
        publishedPages,
        draftPages,
        seoIssueCount: seoIssues.length,
      },
      seoIssues: seoIssues.slice(0, 10),
      recentUpdates: tools.slice(0, 5).map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        category: t.category.name,
        updatedAt: t.updatedAt,
        type: t.type,
      })),
      recentHistory: recentHistory.map((h) => ({
        id: h.id,
        entityType: h.entityType,
        entityTitle: h.entityTitle || h.entityId,
        action: h.action,
        changedBy: h.changedBy,
        createdAt: h.createdAt,
      })),
    });
  } catch (error) {
    console.error('[API Stats Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
