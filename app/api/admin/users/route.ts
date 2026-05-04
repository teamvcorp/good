import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { verifyAdmin } from '@/lib/adminAuth';
import { getAllUsers, getUserByUsername, createUser, generateKidId } from '@/lib/userStore';
import type { Kid } from '@/lib/types';

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const users = await getAllUsers();
  // Strip password hashes
  return NextResponse.json(users.map(({ passwordHash: _, ...u }) => u));
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await request.json();
    const { username, password, parentName, parentAge, email, phone, address = {}, kids = [] } = body;

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters.' }, { status: 400 });
    }
    if (!/^[a-z0-9_]+$/i.test(username.trim())) {
      return NextResponse.json({ error: 'Username may only contain letters, numbers, and underscores.' }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }
    if (!parentName || !parentAge) {
      return NextResponse.json({ error: 'Parent name and age are required.' }, { status: 400 });
    }
    if (!Array.isArray(kids) || kids.length === 0) {
      return NextResponse.json({ error: 'At least one student is required.' }, { status: 400 });
    }

    const normalizedUsername = username.toLowerCase().trim();
    const existing = await getUserByUsername(normalizedUsername);
    if (existing) {
      return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const mappedKids: Kid[] = kids.map((k: { name: string; age: number; rank?: string; program?: string }) => ({
      kidId: generateKidId(),
      name: k.name,
      age: Number(k.age),
      rank: k.rank || '',
      program: k.program || '',
      status: 'active' as const,
      registrationPaid: true,
      businessCardsPaid: false,
      businessCardsOrdered: false,
      skills: [],
      grades: [],
      accomplishments: [],
      communityFunds: { education: 0, health: 0, housing: 0 },
      selectedCategory: 'education' as const,
      hideContactInfo: false,
    }));

    const user = {
      id: crypto.randomUUID(),
      username: normalizedUsername,
      passwordHash,
      parentName,
      parentAge: Number(parentAge),
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
      address,
      kids: mappedKids,
      createdAt: now,
      updatedAt: now,
    };

    await createUser(user);

    const { passwordHash: _, ...safeUser } = user;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (err) {
    console.error('Admin create user error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
