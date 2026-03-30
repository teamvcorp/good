import { createHash } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const COOKIE = 'admin_token';
const TTL_SECONDS = 8 * 60 * 60; // 8 hours

function makeToken(password: string): string {
  return createHash('sha256')
    .update(`admin:${password}:${process.env.AUTH_SECRET}`)
    .digest('hex');
}

/** Returns the expected token hash for the configured ADMIN_PASSWORD */
export function expectedToken(): string {
  return makeToken(process.env.ADMIN_PASSWORD!);
}

/** Verify the token submitted at login time */
export function verifyLoginPassword(password: string): boolean {
  return makeToken(password) === expectedToken();
}

/** Set the admin cookie after verifying the password */
export async function setAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TTL_SECONDS,
    path: '/',
  });
}

/** Clear the admin cookie (logout) */
export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** Verify an incoming request is from an authenticated admin */
export function verifyAdmin(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE)?.value;
  if (!token) return false;
  return token === expectedToken();
}
