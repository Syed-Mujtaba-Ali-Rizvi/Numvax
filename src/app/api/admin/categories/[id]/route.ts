import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminApi } from '@/lib/adminAuth';
import { ensureDatabaseSeeded } from '@/lib/dbSeeder';
import { recordRevision } from '@/lib/contentService';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseSeeded();
    const session = await verifyAdminApi(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const category = await prisma.toolCategory.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        tools: {
          select: { id: true, name: true, slug: true, isEnabled: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('[API Category GET [id] Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseSeeded();
    const session = await verifyAdminApi(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      name,
      slug,
      description,
      icon,
      order,
      h1Title,
      metaTitle,
      metaDescription,
      focusKeyword,
      secondaryKeywords,
      canonicalUrl,
      noIndex,
      ogTitle,
      ogDescription,
      ogImage,
    } = body;

    const existingCat = await prisma.toolCategory.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existingCat) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    const formattedSlug = slug ? slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-') : existingCat.slug;

    const updatedCategory = await prisma.toolCategory.update({
      where: { id: existingCat.id },
      data: {
        name: name !== undefined ? name : existingCat.name,
        slug: formattedSlug,
        description: description !== undefined ? description : existingCat.description,
        icon: icon !== undefined ? icon : existingCat.icon,
        order: order !== undefined ? Number(order) : existingCat.order,
        h1Title: h1Title !== undefined ? h1Title : existingCat.h1Title,
        metaTitle: metaTitle !== undefined ? metaTitle : existingCat.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existingCat.metaDescription,
        focusKeyword: focusKeyword !== undefined ? focusKeyword : existingCat.focusKeyword,
        secondaryKeywords: secondaryKeywords !== undefined ? secondaryKeywords : existingCat.secondaryKeywords,
        canonicalUrl: canonicalUrl !== undefined ? canonicalUrl : existingCat.canonicalUrl,
        noIndex: noIndex !== undefined ? noIndex : existingCat.noIndex,
        ogTitle: ogTitle !== undefined ? ogTitle : existingCat.ogTitle,
        ogDescription: ogDescription !== undefined ? ogDescription : existingCat.ogDescription,
        ogImage: ogImage !== undefined ? ogImage : existingCat.ogImage,
      },
    });

    await recordRevision({
      entityType: 'category',
      entityId: updatedCategory.id,
      entityTitle: updatedCategory.name,
      action: 'UPDATE',
      changedBy: session.email,
      previousData: existingCat,
      newData: updatedCategory,
    });

    return NextResponse.json({ success: true, category: updatedCategory, message: 'Category updated successfully' });
  } catch (error) {
    console.error('[API Category PUT [id] Error]:', error);
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
    const existing = await prisma.toolCategory.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { _count: { select: { tools: true } } },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    if (existing._count.tools > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete category containing ${existing._count.tools} tools. Reassign tools first.` },
        { status: 400 }
      );
    }

    await prisma.toolCategory.delete({ where: { id: existing.id } });

    await recordRevision({
      entityType: 'category',
      entityId: existing.id,
      entityTitle: existing.name,
      action: 'DELETE',
      changedBy: session.email,
      previousData: existing,
    });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('[API Category DELETE Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
