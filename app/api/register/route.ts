import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByUsername, createUser, generateKidId } from '@/lib/userStore';
import getStripe from '@/lib/stripe';
import type { User, Kid } from '@/lib/types';

// Prices in cents
const REGISTRATION_FEE = 500;   // $5.00 per kid
const BUSINESS_CARD_FEE = 1000; // $10.00 per kid (optional)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      username,
      password,
      parentName,
      parentAge,
      email,
      phone,
      address = {},
      kids = [],
      wantBusinessCards = false,
      paymentMethodId,
    } = body;

    // ── Validation ───────────────────────────────────────────────────────
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
    if (!address.street || !address.city || !address.state || !address.zip) {
      return NextResponse.json({ error: 'Full address is required.' }, { status: 400 });
    }
    if (!Array.isArray(kids) || kids.length === 0) {
      return NextResponse.json({ error: 'At least one child is required.' }, { status: 400 });
    }
    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method is required.' }, { status: 400 });
    }

    const normalizedUsername = username.toLowerCase().trim();
    const existing = await getUserByUsername(normalizedUsername);
    if (existing) {
      return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
    }

    // ── Stripe: create customer & charge registration fee ────────────────
    const kidCount = kids.length;
    const totalCents =
      kidCount * REGISTRATION_FEE + (wantBusinessCards ? kidCount * BUSINESS_CARD_FEE : 0);

    const stripe = getStripe();
    const customer = await stripe.customers.create({
      name: parentName,
      email: email || undefined,
      metadata: { username: normalizedUsername, parentName },
    });

    // Attach the payment method
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Charge the registration fee
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      customer: customer.id,
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      description: `Good Deeds registration — ${kidCount} student(s)${wantBusinessCards ? ' + business cards' : ''}`,
      metadata: {
        type: 'registration',
        username: normalizedUsername,
        kidCount: String(kidCount),
        wantBusinessCards: String(wantBusinessCards),
      },
    });

    // ── Build user document ───────────────────────────────────────────────
    const now = new Date().toISOString();
    const passwordHash = await bcrypt.hash(password, 12);

    const builtKids: Kid[] = kids.map((k: Partial<Kid>) => ({
      kidId: generateKidId(),
      name: k.name ?? '',
      age: Number(k.age ?? 0),
      rank: k.rank ?? 'Newcomer',
      program: k.program,
      status: 'active',
      registrationPaid: true,
      businessCardsPaid: wantBusinessCards,
      businessCardsOrdered: false,
      bio: '',
      skills: [],
      grades: [],
      accomplishments: [],
      communityFunds: { education: 0, health: 0, housing: 0 },
      selectedCategory: (k.selectedCategory as Kid['selectedCategory']) ?? 'education',
      hideContactInfo: k.age != null && Number(k.age) < 18,
      city: address.city,
      state: address.state,
      zip: address.zip,
    }));

    const user: User = {
      id: crypto.randomUUID(),
      username: normalizedUsername,
      passwordHash,
      parentName,
      parentAge: Number(parentAge),
      email,
      phone,
      address,
      kids: builtKids,
      stripeCustomerId: customer.id,
      stripePaymentMethodId: paymentMethodId,
      purchases: [],
      createdAt: now,
      updatedAt: now,
    };

    await createUser(user);

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      kids: builtKids.map((k) => ({ kidId: k.kidId, name: k.name })),
    });
  } catch (err: unknown) {
    console.error('[register]', err);
    const msg = err instanceof Error ? err.message : 'Registration failed.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
