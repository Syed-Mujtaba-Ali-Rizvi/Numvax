import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch raw usage rows older than 7 days
    const rawRows = await prisma.calculatorUsage.findMany({
      where: {
        timestamp: {
          lt: sevenDaysAgo,
        },
      },
    });

    if (rawRows.length > 0) {
      // Group counts by calculatorId and date (YYYY-MM-DD)
      const aggregationMap: Record<string, number> = {};

      rawRows.forEach((row) => {
        const dateStr = row.timestamp.toISOString().split('T')[0];
        const key = `${row.calculatorId}:${dateStr}`;
        aggregationMap[key] = (aggregationMap[key] || 0) + 1;
      });

      // Upsert into calculator_usage_daily
      for (const [key, count] of Object.entries(aggregationMap)) {
        const [calculatorId, date] = key.split(':');
        await prisma.calculatorUsageDaily.upsert({
          where: {
            calculatorId_date: {
              calculatorId,
              date,
            },
          },
          update: {
            count: {
              increment: count,
            },
          },
          create: {
            calculatorId,
            date,
            count,
          },
        });
      }

      // Purge raw rows older than 7 days after aggregation
      await prisma.calculatorUsage.deleteMany({
        where: {
          timestamp: {
            lt: sevenDaysAgo,
          },
        },
      });
    }

    // Hard retention cap: purge any leftover raw rows older than 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    await prisma.calculatorUsage.deleteMany({
      where: {
        timestamp: {
          lt: ninetyDaysAgo,
        },
      },
    });

    return NextResponse.json({
      success: true,
      aggregatedCount: rawRows.length,
      message: 'Calculator usage aggregated and retention policy enforced.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Aggregation failed' },
      { status: 500 }
    );
  }
}
