import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserByUsername, updateUser } from '@/lib/userStore';

export async function GET() {
  const session = await auth();
  if (!session?.user?.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await getUserByUsername(session.user.username);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Strip sensitive fields before returning
  const { passwordHash: _, ...safe } = user;
  return NextResponse.json(safe);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await getUserByUsername(session.user.username);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const allowed = ['parentName', 'parentAge', 'email', 'phone', 'kids'];
  for (const key of allowed) {
    if (key in body) {
      // @ts-expect-error dynamic key assignment
      user[key] = body[key];
    }
  }
  user.updatedAt = new Date().toISOString();
  await updateUser(user);

  const { passwordHash: _, ...safe } = user;
  return NextResponse.json(safe);
}
