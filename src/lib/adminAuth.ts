import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'numvax_admin_session';
const SESSION_SECRET = process.env.NEXTAUTH_SECRET || 'numvax_secret_admin_session_key_32chars_min_2026';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// ─── Password Hashing (PBKDF2) ───────────────────────────────────────────────

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }
  const [salt, originalHash] = storedHash.split(':');
  const hashToVerify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(hashToVerify, 'hex'));
}

// ─── Signed Session Tokens ───────────────────────────────────────────────────

export interface AdminSessionPayload {
  adminId: string;
  email: string;
  name: string;
  role: string;
  exp: number;
}

export function createSessionToken(admin: { id: string; email: string; name: string; role: string }): string {
  const payload: AdminSessionPayload = {
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string | undefined): AdminSessionPayload | null {
  if (!token || !token.includes('.')) return null;

  const [payloadB64, signature] = token.split('.');
  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  try {
    const isSigValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    if (!isSigValid) return null;

    const payload: AdminSessionPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    );

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

// ─── Next.js Route & Cookie Helpers ──────────────────────────────────────────

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function setAdminSessionCookie(admin: { id: string; email: string; name: string; role: string }) {
  const token = createSessionToken(admin);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifyAdminApi(req: NextRequest): Promise<AdminSessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  return verifySessionToken(token);
}
