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

    const pages = await prisma.pageContent.findMany({
      orderBy: { title: 'asc' },
    });

    return NextResponse.json({ success: true, pages });
  } catch (error) {
    console.error('[API Pages GET Error]:', error);
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
      slug,
      title,
      h1Title,
      metaTitle,
      metaDescription,
      focusKeyword,
      secondaryKeywords,
      canonicalUrl,
      noIndex = false,
      noFollow = false,
      inSitemap = true,
      content,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      customSchemaJson,
      isPublished = true,
    } = body;

    const formattedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

    if (!title || !formattedSlug) {
      return NextResponse.json({ success: false, error: 'Title and slug are required' }, { status: 400 });
    }

    const existing = await prisma.pageContent.findUnique({ where: { slug: formattedSlug } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'A page with this slug already exists' }, { status: 400 });
    }

    const newPage = await prisma.pageContent.create({
      data: {
        slug: formattedSlug,
        title,
        h1Title: h1Title || title,
        metaTitle: metaTitle || `${title} — Numvax`,
        metaDescription: metaDescription || '',
        focusKeyword: focusKeyword || '',
        secondaryKeywords: secondaryKeywords || '',
        canonicalUrl: canonicalUrl || `https://numvax.com/${formattedSlug}`,
        noIndex,
        noFollow,
        inSitemap,
        content: content || '',
        ogTitle: ogTitle || metaTitle || title,
        ogDescription: ogDescription || metaDescription || '',
        ogImage: ogImage || '/og-image.jpg',
        twitterTitle: twitterTitle || metaTitle || title,
        twitterDescription: twitterDescription || metaDescription || '',
        twitterImage: twitterImage || '/og-image.jpg',
        customSchemaJson: customSchemaJson || null,
        isPublished,
      },
    });

    await recordRevision({
      entityType: 'page',
      entityId: newPage.id,
      entityTitle: newPage.title,
      action: 'CREATE',
      changedBy: session.email,
      newData: newPage,
    });

    return NextResponse.json({ success: true, page: newPage });
  } catch (error) {
    console.error('[API Pages POST Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
