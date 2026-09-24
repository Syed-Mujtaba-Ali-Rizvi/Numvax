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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.toLowerCase().trim() || '';
    const type = searchParams.get('type') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { keyword: { contains: search } },
        { targetSlug: { contains: search } },
        { notes: { contains: search } },
      ];
    }
    if (type) {
      where.type = type;
    }

    const keywords = await prisma.keyword.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const [tools, pages] = await Promise.all([
      prisma.tool.findMany({ select: { slug: true, name: true } }),
      prisma.pageContent.findMany({ select: { slug: true, title: true } }),
    ]);

    return NextResponse.json({
      success: true,
      keywords,
      availableTargets: [
        ...tools.map((t) => ({ slug: t.slug, title: t.name, type: 'tool' })),
        ...pages.map((p) => ({ slug: p.slug, title: p.title, type: 'page' })),
      ],
    });
  } catch (error) {
    console.error('[API Keywords GET Error]:', error);
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
    const { keyword, type = 'primary', targetSlug, targetType, searchVolume, difficulty, notes } = body;

    if (!keyword) {
      return NextResponse.json({ success: false, error: 'Keyword is required' }, { status: 400 });
    }

    const trimmedKeyword = keyword.trim().toLowerCase();

    const existing = await prisma.keyword.findUnique({ where: { keyword: trimmedKeyword } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'This keyword already exists' }, { status: 400 });
    }

    const newKeyword = await prisma.keyword.create({
      data: {
        keyword: trimmedKeyword,
        type,
        targetSlug,
        targetType,
        searchVolume: searchVolume ? Number(searchVolume) : null,
        difficulty: difficulty ? Number(difficulty) : null,
        notes,
      },
    });

    await recordRevision({
      entityType: 'keyword',
      entityId: newKeyword.id,
      entityTitle: newKeyword.keyword,
      action: 'CREATE',
      changedBy: session.email,
      newData: newKeyword,
    });

    return NextResponse.json({ success: true, keyword: newKeyword });
  } catch (error) {
    console.error('[API Keywords POST Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
