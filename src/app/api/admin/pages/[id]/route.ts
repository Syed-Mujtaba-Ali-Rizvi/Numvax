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
    const page = await prisma.pageContent.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error('[API Page GET [id] Error]:', error);
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
      title,
      slug,
      h1Title,
      metaTitle,
      metaDescription,
      focusKeyword,
      secondaryKeywords,
      canonicalUrl,
      noIndex,
      noFollow,
      inSitemap,
      content,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      customSchemaJson,
      isPublished,
      createRedirectOnSlugChange,
    } = body;

    const existingPage = await prisma.pageContent.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existingPage) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    const formattedSlug = slug ? slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-') : existingPage.slug;

    // Handle slug change safety & 301 redirect
    if (formattedSlug !== existingPage.slug) {
      const slugExists = await prisma.pageContent.findUnique({ where: { slug: formattedSlug } });
      if (slugExists && slugExists.id !== existingPage.id) {
        return NextResponse.json({ success: false, error: 'A page with this slug already exists' }, { status: 400 });
      }

      if (createRedirectOnSlugChange) {
        const oldPath = `/${existingPage.slug}`;
        const newPath = `/${formattedSlug}`;
        await prisma.redirect.upsert({
          where: { sourceUrl: oldPath },
          update: { targetUrl: newPath, statusCode: 301, isActive: true },
          create: { sourceUrl: oldPath, targetUrl: newPath, statusCode: 301, isActive: true },
        });
      }
    }

    const updatedPage = await prisma.pageContent.update({
      where: { id: existingPage.id },
      data: {
        title: title !== undefined ? title : existingPage.title,
        slug: formattedSlug,
        h1Title: h1Title !== undefined ? h1Title : existingPage.h1Title,
        metaTitle: metaTitle !== undefined ? metaTitle : existingPage.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existingPage.metaDescription,
        focusKeyword: focusKeyword !== undefined ? focusKeyword : existingPage.focusKeyword,
        secondaryKeywords: secondaryKeywords !== undefined ? secondaryKeywords : existingPage.secondaryKeywords,
        canonicalUrl: canonicalUrl !== undefined ? canonicalUrl : existingPage.canonicalUrl,
        noIndex: noIndex !== undefined ? noIndex : existingPage.noIndex,
        noFollow: noFollow !== undefined ? noFollow : existingPage.noFollow,
        inSitemap: inSitemap !== undefined ? inSitemap : existingPage.inSitemap,
        content: content !== undefined ? content : existingPage.content,
        ogTitle: ogTitle !== undefined ? ogTitle : existingPage.ogTitle,
        ogDescription: ogDescription !== undefined ? ogDescription : existingPage.ogDescription,
        ogImage: ogImage !== undefined ? ogImage : existingPage.ogImage,
        twitterTitle: twitterTitle !== undefined ? twitterTitle : existingPage.twitterTitle,
        twitterDescription: twitterDescription !== undefined ? twitterDescription : existingPage.twitterDescription,
        twitterImage: twitterImage !== undefined ? twitterImage : existingPage.twitterImage,
        customSchemaJson: customSchemaJson !== undefined ? customSchemaJson : existingPage.customSchemaJson,
        isPublished: isPublished !== undefined ? isPublished : existingPage.isPublished,
      },
    });

    await recordRevision({
      entityType: 'page',
      entityId: updatedPage.id,
      entityTitle: updatedPage.title,
      action: 'UPDATE',
      changedBy: session.email,
      previousData: existingPage,
      newData: updatedPage,
    });

    return NextResponse.json({ success: true, page: updatedPage, message: 'Page updated successfully' });
  } catch (error) {
    console.error('[API Page PUT [id] Error]:', error);
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
    const existing = await prisma.pageContent.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    await prisma.pageContent.delete({ where: { id: existing.id } });

    await recordRevision({
      entityType: 'page',
      entityId: existing.id,
      entityTitle: existing.title,
      action: 'DELETE',
      changedBy: session.email,
      previousData: existing,
    });

    return NextResponse.json({ success: true, message: 'Page deleted successfully' });
  } catch (error) {
    console.error('[API Page DELETE Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
