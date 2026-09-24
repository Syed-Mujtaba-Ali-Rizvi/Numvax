import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminApi } from '@/lib/adminAuth';
import { ensureDatabaseSeeded } from '@/lib/dbSeeder';
import { recordRevision } from '@/lib/contentService';

const DEFAULT_ROBOTS_TXT = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://numvax.com/sitemap.xml`;

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseSeeded();
    const session = await verifyAdminApi(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
      select: { robotsTxtContent: true },
    });

    const content = settings?.robotsTxtContent || DEFAULT_ROBOTS_TXT;

    return NextResponse.json({
      success: true,
      content,
      isDefault: !settings?.robotsTxtContent,
      defaultContent: DEFAULT_ROBOTS_TXT,
    });
  } catch (error) {
    console.error('[API Robots GET Error]:', error);
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
    const { content } = body;

    if (typeof content !== 'string') {
      return NextResponse.json({ success: false, error: 'Content must be a string' }, { status: 400 });
    }

    // Safety checks for crawler blocking
    const hasDisallowAll = /Disallow:\s*\/\s*$/m.test(content) && !/Allow:\s*\/\s*$/m.test(content);
    let warning: string | null = null;
    if (hasDisallowAll) {
      warning = 'Warning: You have specified "Disallow: /" which will block all search engines from indexing the entire site.';
    }

    await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: { robotsTxtContent: content },
      create: { id: 'default', robotsTxtContent: content },
    });

    await recordRevision({
      entityType: 'robots',
      entityId: 'robots.txt',
      entityTitle: 'Robots.txt Updated',
      action: 'UPDATE',
      changedBy: session.email,
      newData: { content },
    });

    return NextResponse.json({ success: true, message: 'Robots.txt updated successfully', warning });
  } catch (error) {
    console.error('[API Robots POST Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureDatabaseSeeded();
    const session = await verifyAdminApi(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: { robotsTxtContent: null },
      create: { id: 'default' },
    });

    await recordRevision({
      entityType: 'robots',
      entityId: 'robots.txt',
      entityTitle: 'Robots.txt Restored to Default',
      action: 'RESTORE',
      changedBy: session.email,
    });

    return NextResponse.json({ success: true, message: 'Robots.txt restored to default', content: DEFAULT_ROBOTS_TXT });
  } catch (error) {
    console.error('[API Robots DELETE Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
