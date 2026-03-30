import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { getUserById, updateUser } from '@/lib/userStore';
import bcrypt from 'bcryptjs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();

  if (body.newPassword) {
    if (String(body.newPassword).length < 8) {
      return NextResponse.json({ error: 'Password too short.' }, { status: 400 });
    }
    user.passwordHash = await bcrypt.hash(String(body.newPassword), 12);
  }
  if ('parentName' in body) user.parentName = body.parentName;
  if ('parentAge' in body) user.parentAge = Number(body.parentAge);
  if ('email' in body) user.email = body.email;
  if ('phone' in body) user.phone = body.phone;
  if ('kids' in body) user.kids = body.kids;

  user.updatedAt = new Date().toISOString();
  await updateUser(user);

  const { passwordHash: _, ...safe } = user;
  return NextResponse.json(safe);
}
