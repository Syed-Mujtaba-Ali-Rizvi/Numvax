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
    const { keyword, type, targetSlug, targetType, searchVolume, difficulty, notes } = body;

    const existing = await prisma.keyword.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Keyword not found' }, { status: 404 });
    }

    const updated = await prisma.keyword.update({
      where: { id },
      data: {
        keyword: keyword !== undefined ? keyword.trim().toLowerCase() : existing.keyword,
        type: type !== undefined ? type : existing.type,
        targetSlug: targetSlug !== undefined ? targetSlug : existing.targetSlug,
        targetType: targetType !== undefined ? targetType : existing.targetType,
        searchVolume: searchVolume !== undefined ? (searchVolume ? Number(searchVolume) : null) : existing.searchVolume,
        difficulty: difficulty !== undefined ? (difficulty ? Number(difficulty) : null) : existing.difficulty,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    await recordRevision({
      entityType: 'keyword',
      entityId: updated.id,
      entityTitle: updated.keyword,
      action: 'UPDATE',
      changedBy: session.email,
      previousData: existing,
      newData: updated,
    });

    return NextResponse.json({ success: true, keyword: updated, message: 'Keyword updated successfully' });
  } catch (error) {
    console.error('[API Keyword PUT Error]:', error);
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
    const existing = await prisma.keyword.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Keyword not found' }, { status: 404 });
    }

    await prisma.keyword.delete({ where: { id } });

    await recordRevision({
      entityType: 'keyword',
      entityId: existing.id,
      entityTitle: existing.keyword,
      action: 'DELETE',
      changedBy: session.email,
      previousData: existing,
    });

    return NextResponse.json({ success: true, message: 'Keyword deleted successfully' });
  } catch (error) {
    console.error('[API Keyword DELETE Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
