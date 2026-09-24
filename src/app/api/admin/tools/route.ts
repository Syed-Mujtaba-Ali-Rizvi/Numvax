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
    const categorySlug = searchParams.get('category') || '';
    const status = searchParams.get('status') || ''; // 'published', 'draft', 'disabled'

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { shortDescription: { contains: search } },
        { focusKeyword: { contains: search } },
        { searchKeywords: { contains: search } },
      ];
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (status === 'published') {
      where.isEnabled = true;
      where.isDraft = false;
    } else if (status === 'draft') {
      where.isDraft = true;
    } else if (status === 'disabled') {
      where.isEnabled = false;
    }

    const tools = await prisma.tool.findMany({
      where,
      include: {
        category: true,
        content: true,
      },
      orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
    });

    // Compute simple SEO score for each tool (0-100)
    const formatted = tools.map((t) => {
      let score = 100;
      const c = t.content;
      if (!c?.metaTitle || c.metaTitle.length < 30) score -= 20;
      if (!c?.metaDescription || c.metaDescription.length < 80) score -= 20;
      if (!t.focusKeyword) score -= 20;
      if (!c?.h1Title) score -= 15;
      if (!c?.ogImage) score -= 10;
      if (!c?.faqItemsJson || c.faqItemsJson === '[]') score -= 15;
      score = Math.max(0, score);

      return {
        id: t.id,
        slug: t.slug,
        name: t.name,
        type: t.type,
        category: t.category.name,
        categorySlug: t.category.slug,
        shortDescription: t.shortDescription,
        isEnabled: t.isEnabled,
        isDraft: t.isDraft,
        isPopular: t.isPopular,
        isFeatured: t.isFeatured,
        inSitemap: t.inSitemap,
        focusKeyword: t.focusKeyword || '',
        seoTitle: c?.metaTitle || '',
        metaDescription: c?.metaDescription || '',
        noIndex: c?.noIndex ?? false,
        seoScore: score,
        updatedAt: t.updatedAt,
      };
    });

    return NextResponse.json({ success: true, tools: formatted });
  } catch (error) {
    console.error('[API Tools GET Error]:', error);
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
      categoryId,
      type = 'calculator',
      shortDescription = '',
      description = '',
      focusKeyword = '',
      secondaryKeywords = '',
      searchKeywords = '',
      searchAliases = '',
      relatedToolSlugs = '[]',
      isPopular = false,
      isFeatured = false,
      isEnabled = true,
      isDraft = false,
      inSitemap = true,
      h1Title = '',
      metaTitle = '',
      metaDescription = '',
      canonicalUrl = '',
      noIndex = false,
      noFollow = false,
      explanation = '',
      directAnswer = '',
      instructionsTitle = '',
      instructionsDescription = '',
      useCases = '',
      trustCopy = '',
      workedExamplesJson = '[]',
      faqItemsJson = '[]',
      ogTitle = '',
      ogDescription = '',
      ogImage = '/og-image.jpg',
      twitterTitle = '',
      twitterDescription = '',
      twitterImage = '/og-image.jpg',
      customSchemaJson = '',
    } = body;

    const formattedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

    if (!name || !formattedSlug || !categoryId) {
      return NextResponse.json({ success: false, error: 'Name, slug, and category are required' }, { status: 400 });
    }

    const existing = await prisma.tool.findUnique({ where: { slug: formattedSlug } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'A tool with this slug already exists' }, { status: 400 });
    }

    const newTool = await prisma.tool.create({
      data: {
        name,
        slug: formattedSlug,
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
        content: {
          create: {
            h1Title: h1Title || name,
            metaTitle: metaTitle || `${name} — Free Online Tool | Numvax`,
            metaDescription: metaDescription || shortDescription,
            focusKeyword,
            secondaryKeywords,
            canonicalUrl: canonicalUrl || `https://numvax.com/${formattedSlug}`,
            noIndex,
            noFollow,
            explanation,
            directAnswer,
            instructionsTitle,
            instructionsDescription,
            useCases,
            trustCopy,
            workedExamplesJson,
            faqItemsJson,
            ogTitle: ogTitle || metaTitle || name,
            ogDescription: ogDescription || metaDescription || shortDescription,
            ogImage,
            twitterTitle: twitterTitle || metaTitle || name,
            twitterDescription: twitterDescription || metaDescription || shortDescription,
            twitterImage,
            customSchemaJson: customSchemaJson || null,
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
      entityId: newTool.id,
      entityTitle: newTool.name,
      action: 'CREATE',
      changedBy: session.email,
      newData: newTool,
    });

    return NextResponse.json({ success: true, tool: newTool });
  } catch (error) {
    console.error('[API Tools POST Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
