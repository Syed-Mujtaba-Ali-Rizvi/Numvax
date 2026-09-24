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

    const [tools, categories, pages] = await Promise.all([
      prisma.tool.findMany({
        select: {
          id: true,
          slug: true,
          name: true,
          type: true,
          inSitemap: true,
          isEnabled: true,
          isDraft: true,
          updatedAt: true,
          category: { select: { name: true, slug: true } },
          content: { select: { noIndex: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.toolCategory.findMany({
        select: { id: true, slug: true, name: true },
      }),
      prisma.pageContent.findMany({
        select: { id: true, slug: true, title: true, noIndex: true, updatedAt: true },
      }),
    ]);

    const totalTools = tools.length;
    const includedTools = tools.filter((t) => t.inSitemap && t.isEnabled && !t.isDraft && !t.content?.noIndex).length;
    const excludedTools = totalTools - includedTools;
    const totalCategories = categories.length;
    const totalPages = pages.length;
    const totalSitemapUrls = includedTools + totalCategories + totalPages + 4; // +4 for root, /calculators, /tools, /all-tools

    return NextResponse.json({
      success: true,
      stats: {
        totalSitemapUrls,
        includedTools,
        excludedTools,
        totalCategories,
        totalPages,
      },
      tools,
      pages,
      categories,
    });
  } catch (error) {
    console.error('[API Sitemap GET Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseSeeded();
    const session = await verifyAdminApi(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { toolId, inSitemap, bulkAction, toolIds } = body;

    if (bulkAction && Array.isArray(toolIds)) {
      const state = bulkAction === 'include';
      await prisma.tool.updateMany({
        where: { id: { in: toolIds } },
        data: { inSitemap: state },
      });

      await recordRevision({
        entityType: 'sitemap',
        entityId: 'bulk',
        entityTitle: `Bulk sitemap update (${toolIds.length} tools set to ${state ? 'included' : 'excluded'})`,
        action: 'UPDATE',
        changedBy: session.email,
      });

      return NextResponse.json({ success: true, message: `Updated ${toolIds.length} tools in sitemap` });
    }

    if (!toolId) {
      return NextResponse.json({ success: false, error: 'Tool ID is required' }, { status: 400 });
    }

    const updated = await prisma.tool.update({
      where: { id: toolId },
      data: { inSitemap: Boolean(inSitemap) },
    });

    await recordRevision({
      entityType: 'sitemap',
      entityId: toolId,
      entityTitle: `${updated.name} Sitemap Status Changed`,
      action: 'UPDATE',
      changedBy: session.email,
      newData: { inSitemap: Boolean(inSitemap) },
    });

    return NextResponse.json({ success: true, message: 'Tool sitemap status updated', tool: updated });
  } catch (error) {
    console.error('[API Sitemap POST Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
