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
    const entityType = searchParams.get('type') || '';
    const entityId = searchParams.get('id') || '';

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const history = await prisma.revisionHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error('[API History GET Error]:', error);
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

    const { historyId } = await req.json();
    const record = await prisma.revisionHistory.findUnique({ where: { id: historyId } });

    if (!record || !record.previousData) {
      return NextResponse.json({ success: false, error: 'Cannot restore: No previous data found' }, { status: 400 });
    }

    const prevData = JSON.parse(record.previousData);

    if (record.entityType === 'tool') {
      await prisma.tool.update({
        where: { id: record.entityId },
        data: {
          name: prevData.name,
          slug: prevData.slug,
          shortDescription: prevData.shortDescription,
          description: prevData.description,
          focusKeyword: prevData.focusKeyword,
          secondaryKeywords: prevData.secondaryKeywords,
          isEnabled: prevData.isEnabled,
          isDraft: prevData.isDraft,
        },
      });
    } else if (record.entityType === 'page') {
      await prisma.pageContent.update({
        where: { id: record.entityId },
        data: {
          title: prevData.title,
          h1Title: prevData.h1Title,
          metaTitle: prevData.metaTitle,
          metaDescription: prevData.metaDescription,
          focusKeyword: prevData.focusKeyword,
          content: prevData.content,
        },
      });
    }

    await prisma.revisionHistory.create({
      data: {
        entityType: record.entityType,
        entityId: record.entityId,
        entityTitle: `Restored to state from ${new Date(record.createdAt).toLocaleString()}`,
        action: 'RESTORE',
        changedBy: session.email,
        previousData: JSON.stringify(prevData),
      },
    });

    return NextResponse.json({ success: true, message: 'Revision restored successfully' });
  } catch (error) {
    console.error('[API History POST Restore Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
