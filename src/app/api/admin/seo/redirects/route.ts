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

    const where: any = {};
    if (search) {
      where.OR = [
        { sourceUrl: { contains: search } },
        { targetUrl: { contains: search } },
      ];
    }

    const redirects = await prisma.redirect.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, redirects });
  } catch (error) {
    console.error('[API Redirects GET Error]:', error);
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
    let { sourceUrl, targetUrl, statusCode = 301, isActive = true } = body;

    if (!sourceUrl || !targetUrl) {
      return NextResponse.json({ success: false, error: 'Source URL and Target URL are required' }, { status: 400 });
    }

    // Format URLs: ensure starting slash if relative
    if (!sourceUrl.startsWith('/') && !sourceUrl.startsWith('http')) {
      sourceUrl = `/${sourceUrl}`;
    }
    if (!targetUrl.startsWith('/') && !targetUrl.startsWith('http')) {
      targetUrl = `/${targetUrl}`;
    }

    const existing = await prisma.redirect.findUnique({ where: { sourceUrl } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'A redirect for this source URL already exists' }, { status: 400 });
    }

    const newRedirect = await prisma.redirect.create({
      data: {
        sourceUrl,
        targetUrl,
        statusCode: Number(statusCode) || 301,
        isActive: Boolean(isActive),
      },
    });

    await recordRevision({
      entityType: 'redirect',
      entityId: newRedirect.id,
      entityTitle: `${sourceUrl} -> ${targetUrl} (${statusCode})`,
      action: 'CREATE',
      changedBy: session.email,
      newData: newRedirect,
    });

    return NextResponse.json({ success: true, redirect: newRedirect });
  } catch (error) {
    console.error('[API Redirects POST Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
