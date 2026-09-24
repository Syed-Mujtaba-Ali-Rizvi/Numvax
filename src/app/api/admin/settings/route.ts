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

    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });

    const [tools, categories] = await Promise.all([
      prisma.tool.findMany({ select: { slug: true, name: true, type: true, category: { select: { name: true } } } }),
      prisma.toolCategory.findMany({ select: { slug: true, name: true } }),
    ]);

    return NextResponse.json({
      success: true,
      settings: settings || {},
      availableTools: tools,
      availableCategories: categories,
    });
  } catch (error) {
    console.error('[API Settings GET Error]:', error);
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
      siteName,
      tagline,
      titleTemplate,
      defaultMetaDescription,
      defaultOgImage,
      defaultRobots,
      defaultCanonical,
      contactEmail,
      socialTwitter,
      socialFacebook,
      socialGithub,
      socialLinkedin,
      // Homepage content
      heroHeading,
      heroDescription,
      searchPlaceholder,
      featuredToolSlugs,
      popularToolSlugs,
      // Ads
      adsEnabled,
      headerAdActive,
      sidebarAdActive,
      inContentAdActive,
      belowResultsAdActive,
      footerAdActive,
      headerAdScript,
      sidebarAdScript,
      inContentAdScript,
      belowResultsAdScript,
      footerAdScript,
    } = body;

    const previous = await prisma.siteSettings.findUnique({ where: { id: 'default' } });

    const updated = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        siteName: siteName !== undefined ? siteName : previous?.siteName,
        tagline: tagline !== undefined ? tagline : previous?.tagline,
        titleTemplate: titleTemplate !== undefined ? titleTemplate : previous?.titleTemplate,
        defaultMetaDescription: defaultMetaDescription !== undefined ? defaultMetaDescription : previous?.defaultMetaDescription,
        defaultOgImage: defaultOgImage !== undefined ? defaultOgImage : previous?.defaultOgImage,
        defaultRobots: defaultRobots !== undefined ? defaultRobots : previous?.defaultRobots,
        defaultCanonical: defaultCanonical !== undefined ? defaultCanonical : previous?.defaultCanonical,
        contactEmail: contactEmail !== undefined ? contactEmail : previous?.contactEmail,
        socialTwitter: socialTwitter !== undefined ? socialTwitter : previous?.socialTwitter,
        socialFacebook: socialFacebook !== undefined ? socialFacebook : previous?.socialFacebook,
        socialGithub: socialGithub !== undefined ? socialGithub : previous?.socialGithub,
        socialLinkedin: socialLinkedin !== undefined ? socialLinkedin : previous?.socialLinkedin,
        heroHeading: heroHeading !== undefined ? heroHeading : previous?.heroHeading,
        heroDescription: heroDescription !== undefined ? heroDescription : previous?.heroDescription,
        searchPlaceholder: searchPlaceholder !== undefined ? searchPlaceholder : previous?.searchPlaceholder,
        featuredToolSlugs: featuredToolSlugs !== undefined ? (typeof featuredToolSlugs === 'string' ? featuredToolSlugs : JSON.stringify(featuredToolSlugs)) : previous?.featuredToolSlugs,
        popularToolSlugs: popularToolSlugs !== undefined ? (typeof popularToolSlugs === 'string' ? popularToolSlugs : JSON.stringify(popularToolSlugs)) : previous?.popularToolSlugs,
        adsEnabled: adsEnabled !== undefined ? Boolean(adsEnabled) : previous?.adsEnabled,
        headerAdActive: headerAdActive !== undefined ? Boolean(headerAdActive) : previous?.headerAdActive,
        sidebarAdActive: sidebarAdActive !== undefined ? Boolean(sidebarAdActive) : previous?.sidebarAdActive,
        inContentAdActive: inContentAdActive !== undefined ? Boolean(inContentAdActive) : previous?.inContentAdActive,
        belowResultsAdActive: belowResultsAdActive !== undefined ? Boolean(belowResultsAdActive) : previous?.belowResultsAdActive,
        footerAdActive: footerAdActive !== undefined ? Boolean(footerAdActive) : previous?.footerAdActive,
        headerAdScript: headerAdScript !== undefined ? headerAdScript : previous?.headerAdScript,
        sidebarAdScript: sidebarAdScript !== undefined ? sidebarAdScript : previous?.sidebarAdScript,
        inContentAdScript: inContentAdScript !== undefined ? inContentAdScript : previous?.inContentAdScript,
        belowResultsAdScript: belowResultsAdScript !== undefined ? belowResultsAdScript : previous?.belowResultsAdScript,
        footerAdScript: footerAdScript !== undefined ? footerAdScript : previous?.footerAdScript,
      },
      create: {
        id: 'default',
        siteName: siteName || 'Numvax',
        tagline: tagline || 'Fast, accurate and easy-to-use free online tools',
        titleTemplate: titleTemplate || '{{title}} | Numvax',
        defaultMetaDescription: defaultMetaDescription || 'Fast, accurate and easy-to-use calculators, converters, developer tools, text utilities, and PDF tools.',
        contactEmail: contactEmail || 'contact@numvax.com',
        heroHeading: heroHeading || "Every Online Tool You'll Ever Need. 100% Free & Private.",
        heroDescription: heroDescription || 'Fast, precise, client-side tools: Calculators, PDF utilities, image editors, developer formatters, and converters.',
        searchPlaceholder: searchPlaceholder || 'Search 50+ tools (e.g., BMI Calculator, Merge PDF, JSON Formatter)...',
      },
    });

    await recordRevision({
      entityType: 'settings',
      entityId: 'default',
      entityTitle: 'Site & Global SEO Settings Updated',
      action: 'UPDATE',
      changedBy: session.email,
      previousData: previous,
      newData: updated,
    });

    return NextResponse.json({ success: true, settings: updated, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('[API Settings POST Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
