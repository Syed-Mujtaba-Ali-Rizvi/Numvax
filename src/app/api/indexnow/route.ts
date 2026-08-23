import { NextResponse } from 'next/server';
import { submitIndexNowUrls, INDEXNOW_KEY, INDEXNOW_KEY_LOCATION } from '../../../lib/indexnow';
import { TOOL_CATALOG } from '../../../lib/toolCatalog';
import { CALCULATOR_CATALOG } from '../../../lib/catalog';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Numvax IndexNow Integration',
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    usage: 'POST JSON payload { "urls": ["https://numvax.com/image-compressor"] } to trigger IndexNow submission to Bing.',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let urls: string[] = body.urls || [];

    // Optional: If "all" parameter passed, submit key priority tools selectively (e.g. top 10 changed tools)
    if (body.target === 'key-tools') {
      const topSlugs = ['image-compressor', 'qr-code-generator', 'merge-pdf', 'pdf-to-word', 'word-counter', 'bmi-calculator', 'percentage-calculator', 'loan-calculator'];
      urls = topSlugs.map((s) => `https://numvax.com/${s}`);
    }

    if (!urls || urls.length === 0) {
      return NextResponse.json(
        { error: 'No URLs specified. Send { "urls": ["https://numvax.com/slug"] }' },
        { status: 400 }
      );
    }

    const result = await submitIndexNowUrls(urls);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to submit to IndexNow' },
      { status: 500 }
    );
  }
}
