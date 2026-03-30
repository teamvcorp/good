import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { getAllUsers } from '@/lib/userStore';

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const users = await getAllUsers();
  // Strip password hashes
  return NextResponse.json(users.map(({ passwordHash: _, ...u }) => u));
}
