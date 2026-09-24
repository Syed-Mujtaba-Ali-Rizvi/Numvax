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
    const tool = await prisma.tool.findUnique({
      where: { id },
      include: {
        category: true,
        content: true,
      },
    });

    if (!tool) {
      return NextResponse.json({ success: false, error: 'Tool not found' }, { status: 404 });
    }

    const categories = await prisma.toolCategory.findMany({
      orderBy: { order: 'asc' },
    });

    const allTools = await prisma.tool.findMany({
      where: { id: { not: id } },
      select: { id: true, slug: true, name: true, category: { select: { name: true } } },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, tool, categories, availableRelatedTools: allTools });
  } catch (error) {
    console.error('[API Tool GET [id] Error]:', error);
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
      categoryId,
      type,
      shortDescription,
      description,
      focusKeyword,
      secondaryKeywords,
      searchKeywords,
      searchAliases,
      relatedToolSlugs,
      isPopular,
      isFeatured,
      isEnabled,
      isDraft,
      inSitemap,
      createRedirectOnSlugChange,
      // Content & SEO fields
      h1Title,
      metaTitle,
      metaDescription,
      canonicalUrl,
      noIndex,
      noFollow,
      explanation,
      directAnswer,
      formulaTitle,
      formulaDescription,
      instructionsTitle,
      instructionsDescription,
      useCases,
      trustCopy,
      workedExamplesJson,
      faqItemsJson,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      customSchemaJson,
    } = body;

    const existingTool = await prisma.tool.findUnique({
      where: { id },
      include: { content: true },
    });

    if (!existingTool) {
      return NextResponse.json({ success: false, error: 'Tool not found' }, { status: 404 });
    }

    const formattedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

    // Handle slug change safety: Check uniqueness and create redirect
    if (formattedSlug !== existingTool.slug) {
      const slugExists = await prisma.tool.findUnique({ where: { slug: formattedSlug } });
      if (slugExists && slugExists.id !== id) {
        return NextResponse.json({ success: false, error: 'A tool with this slug already exists' }, { status: 400 });
      }

      if (createRedirectOnSlugChange) {
        const oldPath = `/${existingTool.slug}`;
        const newPath = `/${formattedSlug}`;
        await prisma.redirect.upsert({
          where: { sourceUrl: oldPath },
          update: { targetUrl: newPath, statusCode: 301, isActive: true },
          create: { sourceUrl: oldPath, targetUrl: newPath, statusCode: 301, isActive: true },
        });
      }
    }

    const updatedTool = await prisma.tool.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingTool.name,
        slug: formattedSlug,
        categoryId: categoryId !== undefined ? categoryId : existingTool.categoryId,
        type: type !== undefined ? type : existingTool.type,
        shortDescription: shortDescription !== undefined ? shortDescription : existingTool.shortDescription,
        description: description !== undefined ? description : existingTool.description,
        focusKeyword: focusKeyword !== undefined ? focusKeyword : existingTool.focusKeyword,
        secondaryKeywords: secondaryKeywords !== undefined ? secondaryKeywords : existingTool.secondaryKeywords,
        searchKeywords: searchKeywords !== undefined ? searchKeywords : existingTool.searchKeywords,
        searchAliases: searchAliases !== undefined ? searchAliases : existingTool.searchAliases,
        relatedToolSlugs: relatedToolSlugs !== undefined ? relatedToolSlugs : existingTool.relatedToolSlugs,
        isPopular: isPopular !== undefined ? isPopular : existingTool.isPopular,
        isFeatured: isFeatured !== undefined ? isFeatured : existingTool.isFeatured,
        isEnabled: isEnabled !== undefined ? isEnabled : existingTool.isEnabled,
        isDraft: isDraft !== undefined ? isDraft : existingTool.isDraft,
        inSitemap: inSitemap !== undefined ? inSitemap : existingTool.inSitemap,
        content: {
          upsert: {
            create: {
              h1Title: h1Title || name || existingTool.name,
              metaTitle: metaTitle || `${name || existingTool.name} — Free Online Tool | Numvax`,
              metaDescription: metaDescription || shortDescription || existingTool.shortDescription,
              focusKeyword: focusKeyword || existingTool.focusKeyword,
              secondaryKeywords: secondaryKeywords || existingTool.secondaryKeywords,
              canonicalUrl: canonicalUrl || `https://numvax.com/${formattedSlug}`,
              noIndex: noIndex ?? false,
              noFollow: noFollow ?? false,
              explanation: explanation || description || existingTool.description,
              directAnswer,
              formulaTitle,
              formulaDescription,
              instructionsTitle,
              instructionsDescription,
              useCases,
              trustCopy,
              workedExamplesJson: typeof workedExamplesJson === 'string' ? workedExamplesJson : JSON.stringify(workedExamplesJson || []),
              faqItemsJson: typeof faqItemsJson === 'string' ? faqItemsJson : JSON.stringify(faqItemsJson || []),
              ogTitle: ogTitle || metaTitle || name,
              ogDescription: ogDescription || metaDescription || shortDescription,
              ogImage: ogImage || '/og-image.jpg',
              twitterTitle: twitterTitle || metaTitle || name,
              twitterDescription: twitterDescription || metaDescription || shortDescription,
              twitterImage: twitterImage || '/og-image.jpg',
              customSchemaJson: customSchemaJson || null,
            },
            update: {
              h1Title,
              metaTitle,
              metaDescription,
              focusKeyword,
              secondaryKeywords,
              canonicalUrl,
              noIndex: noIndex ?? false,
              noFollow: noFollow ?? false,
              explanation,
              directAnswer,
              formulaTitle,
              formulaDescription,
              instructionsTitle,
              instructionsDescription,
              useCases,
              trustCopy,
              workedExamplesJson: typeof workedExamplesJson === 'string' ? workedExamplesJson : JSON.stringify(workedExamplesJson || []),
              faqItemsJson: typeof faqItemsJson === 'string' ? faqItemsJson : JSON.stringify(faqItemsJson || []),
              ogTitle,
              ogDescription,
              ogImage,
              twitterTitle,
              twitterDescription,
              twitterImage,
              customSchemaJson: customSchemaJson || null,
            },
          },
        },
      },
      include: {
        category: true,
        content: true,
      },
    });

    await recordRevision({
      entityType: 'tool',
      entityId: updatedTool.id,
      entityTitle: updatedTool.name,
      action: 'UPDATE',
      changedBy: session.email,
      previousData: existingTool,
      newData: updatedTool,
    });

    return NextResponse.json({ success: true, tool: updatedTool, message: 'Tool updated successfully' });
  } catch (error) {
    console.error('[API Tool PUT [id] Error]:', error);
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
    const existing = await prisma.tool.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Tool not found' }, { status: 404 });
    }

    await prisma.tool.delete({ where: { id } });

    await recordRevision({
      entityType: 'tool',
      entityId: existing.id,
      entityTitle: existing.name,
      action: 'DELETE',
      changedBy: session.email,
      previousData: existing,
    });

    return NextResponse.json({ success: true, message: 'Tool deleted successfully' });
  } catch (error) {
    console.error('[API Tool DELETE Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
