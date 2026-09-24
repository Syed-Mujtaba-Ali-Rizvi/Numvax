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

    const categories = await prisma.toolCategory.findMany({
      include: {
        _count: {
          select: { tools: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('[API Categories GET Error]:', error);
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
    const {
      name,
      slug,
      description,
      icon = 'Folder',
      order = 0,
      h1Title,
      metaTitle,
      metaDescription,
      focusKeyword,
      secondaryKeywords,
      canonicalUrl,
      noIndex = false,
      ogTitle,
      ogDescription,
      ogImage = '/og-image.jpg',
    } = body;

    const formattedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

    if (!name || !formattedSlug) {
      return NextResponse.json({ success: false, error: 'Name and slug are required' }, { status: 400 });
    }

    const existing = await prisma.toolCategory.findUnique({ where: { slug: formattedSlug } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'A category with this slug already exists' }, { status: 400 });
    }

    const newCategory = await prisma.toolCategory.create({
      data: {
        name,
        slug: formattedSlug,
        description,
        icon,
        order: Number(order) || 0,
        h1Title: h1Title || `${name} — Free Online Tools`,
        metaTitle: metaTitle || `${name} Online - Fast & Free | Numvax`,
        metaDescription: metaDescription || description || '',
        focusKeyword: focusKeyword || name.toLowerCase(),
        secondaryKeywords: secondaryKeywords || '',
        canonicalUrl: canonicalUrl || `https://numvax.com/tools/category/${formattedSlug}`,
        noIndex,
        ogTitle: ogTitle || metaTitle || name,
        ogDescription: ogDescription || metaDescription || description,
        ogImage,
      },
    });

    await recordRevision({
      entityType: 'category',
      entityId: newCategory.id,
      entityTitle: newCategory.name,
      action: 'CREATE',
      changedBy: session.email,
      newData: newCategory,
    });

    return NextResponse.json({ success: true, category: newCategory });
  } catch (error) {
    console.error('[API Categories POST Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
