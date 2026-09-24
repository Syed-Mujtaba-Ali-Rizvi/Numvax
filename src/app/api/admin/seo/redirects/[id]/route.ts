import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminApi } from '@/lib/adminAuth';
import { ensureDatabaseSeeded } from '@/lib/dbSeeder';
import { recordRevision } from '@/lib/contentService';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseSeeded();
    const session = await verifyAdminApi(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    let { sourceUrl, targetUrl, statusCode, isActive } = body;

    const existing = await prisma.redirect.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Redirect not found' }, { status: 404 });
    }

    if (sourceUrl && !sourceUrl.startsWith('/') && !sourceUrl.startsWith('http')) {
      sourceUrl = `/${sourceUrl}`;
    }
    if (targetUrl && !targetUrl.startsWith('/') && !targetUrl.startsWith('http')) {
      targetUrl = `/${targetUrl}`;
    }

    const updated = await prisma.redirect.update({
      where: { id },
      data: {
        sourceUrl: sourceUrl !== undefined ? sourceUrl : existing.sourceUrl,
        targetUrl: targetUrl !== undefined ? targetUrl : existing.targetUrl,
        statusCode: statusCode !== undefined ? Number(statusCode) : existing.statusCode,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    await recordRevision({
      entityType: 'redirect',
      entityId: updated.id,
      entityTitle: `${updated.sourceUrl} -> ${updated.targetUrl}`,
      action: 'UPDATE',
      changedBy: session.email,
      previousData: existing,
      newData: updated,
    });

    return NextResponse.json({ success: true, redirect: updated, message: 'Redirect updated successfully' });
  } catch (error) {
    console.error('[API Redirect PUT Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseSeeded();
    const session = await verifyAdminApi(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.redirect.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Redirect not found' }, { status: 404 });
    }

    await prisma.redirect.delete({ where: { id } });

    await recordRevision({
      entityType: 'redirect',
      entityId: existing.id,
      entityTitle: `${existing.sourceUrl} -> ${existing.targetUrl}`,
      action: 'DELETE',
      changedBy: session.email,
      previousData: existing,
    });

    return NextResponse.json({ success: true, message: 'Redirect deleted successfully' });
  } catch (error) {
    console.error('[API Redirect DELETE Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
