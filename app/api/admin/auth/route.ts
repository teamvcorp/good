import { NextRequest, NextResponse } from 'next/server';
import { verifyLoginPassword, setAdminCookie, clearAdminCookie } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (!password || !verifyLoginPassword(String(password))) {
    return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
  }
  await setAdminCookie();
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  await clearAdminCookie();
  return NextResponse.json({ success: true });
}
