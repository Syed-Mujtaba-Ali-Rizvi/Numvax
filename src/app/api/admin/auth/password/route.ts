import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminApi, hashPassword, verifyPassword } from '@/lib/adminAuth';
import { recordRevision } from '@/lib/contentService';

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminApi(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.adminId },
    });

    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin account not found' }, { status: 404 });
    }

    if (currentPassword && !verifyPassword(currentPassword, admin.passwordHash)) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
    }

    const newHash = hashPassword(newPassword);

    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: newHash },
    });

    await recordRevision({
      entityType: 'admin',
      entityId: admin.id,
      entityTitle: `Admin Password Updated (${admin.email})`,
      action: 'UPDATE',
      changedBy: admin.email,
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('[API Password Update Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
