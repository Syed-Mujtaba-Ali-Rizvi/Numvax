import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { checkRateLimit, validateAndTrimInput } from '../../../../lib/rateLimit';

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const { allowed } = await checkRateLimit(ip, 60, 60000);

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Rate limit exceeded.' },
      { status: 429 }
    );
  }

  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      const created = await prisma.siteSettings.create({
        data: { id: 'default' },
      });
      return NextResponse.json({ success: true, settings: created });
    }

    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const { allowed } = await checkRateLimit(ip, 10, 60000);

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many admin configuration requests. Rate limit exceeded.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const {
      headerAdActive,
      sidebarAdActive,
      inContentAdActive,
      belowResultsAdActive,
      footerAdActive,
      siteName,
      tagline,
      contactEmail,
    } = body;

    const cleanSiteName = validateAndTrimInput(siteName || 'Numvax', 100);
    const cleanTagline = validateAndTrimInput(tagline || '', 250);
    const cleanEmail = validateAndTrimInput(contactEmail || 'contact@Numvax.com', 150);

    const updated = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        headerAdActive: Boolean(headerAdActive),
        sidebarAdActive: Boolean(sidebarAdActive),
        inContentAdActive: Boolean(inContentAdActive),
        belowResultsAdActive: Boolean(belowResultsAdActive),
        footerAdActive: Boolean(footerAdActive),
        siteName: cleanSiteName,
        tagline: cleanTagline,
        contactEmail: cleanEmail,
      },
      create: {
        id: 'default',
        headerAdActive: headerAdActive ?? true,
        sidebarAdActive: sidebarAdActive ?? true,
        inContentAdActive: inContentAdActive ?? true,
        belowResultsAdActive: belowResultsAdActive ?? true,
        footerAdActive: footerAdActive ?? true,
        siteName: cleanSiteName,
        tagline: cleanTagline,
        contactEmail: cleanEmail,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminEmail: 'admin@Numvax.com',
        action: 'UPDATE_SITE_SETTINGS',
        target: 'SiteSettings',
        details: `Updated ad slots and site settings: ${cleanSiteName}`,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
