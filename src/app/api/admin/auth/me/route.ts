import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminApi } from '@/lib/adminAuth';
import { ensureDatabaseSeeded } from '@/lib/dbSeeder';

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const session = await verifyAdminApi(req);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json({
    authenticated: true,
    admin: {
      id: session.adminId,
      email: session.email,
      name: session.name,
      role: session.role,
    },
  });
}
