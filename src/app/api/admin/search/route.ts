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

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.toLowerCase().trim() || '';

    if (!q) {
      return NextResponse.json({ success: true, results: [] });
    }

    const [tools, pages, categories, keywords, redirects] = await Promise.all([
      prisma.tool.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { slug: { contains: q } },
            { focusKeyword: { contains: q } },
            { searchKeywords: { contains: q } },
          ],
        },
        take: 5,
        select: { id: true, name: true, slug: true, type: true },
      }),
      prisma.pageContent.findMany({
        where: {
          OR: [{ title: { contains: q } }, { slug: { contains: q } }, { focusKeyword: { contains: q } }],
        },
        take: 5,
        select: { id: true, title: true, slug: true },
      }),
      prisma.toolCategory.findMany({
        where: {
          OR: [{ name: { contains: q } }, { slug: { contains: q } }],
        },
        take: 5,
        select: { id: true, name: true, slug: true },
      }),
      prisma.keyword.findMany({
        where: { keyword: { contains: q } },
        take: 5,
        select: { id: true, keyword: true, type: true, targetSlug: true },
      }),
      prisma.redirect.findMany({
        where: {
          OR: [{ sourceUrl: { contains: q } }, { targetUrl: { contains: q } }],
        },
        take: 5,
        select: { id: true, sourceUrl: true, targetUrl: true, statusCode: true },
      }),
    ]);

    const results = [
      ...tools.map((t) => ({
        type: 'tool',
        label: t.name,
        sub: `/${t.slug} • Tool`,
        url: `/admin/tools/${t.id}`,
      })),
      ...pages.map((p) => ({
        type: 'page',
        label: p.title,
        sub: `/${p.slug} • Page`,
        url: `/admin/pages/${p.id}`,
      })),
      ...categories.map((c) => ({
        type: 'category',
        label: c.name,
        sub: `Category: ${c.slug}`,
        url: `/admin/categories`,
      })),
      ...keywords.map((k) => ({
        type: 'keyword',
        label: k.keyword,
        sub: `Keyword (${k.type}) ${k.targetSlug ? `-> /${k.targetSlug}` : ''}`,
        url: `/admin/seo/keywords`,
      })),
      ...redirects.map((r) => ({
        type: 'redirect',
        label: `${r.sourceUrl} -> ${r.targetUrl}`,
        sub: `Redirect (${r.statusCode})`,
        url: `/admin/seo/redirects`,
      })),
    ];

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('[API Admin Search Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
