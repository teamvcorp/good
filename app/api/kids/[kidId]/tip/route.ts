import { NextRequest, NextResponse } from 'next/server';
import getStripe from '@/lib/stripe';
import { getUserByKidId } from '@/lib/userStore';
import type { CommunityCategory } from '@/lib/types';

const MINIMUM_TIP_CENTS = 100; // $1.00 minimum
const MAXIMUM_TIP_CENTS = 100_000; // $1,000.00 maximum

/** POST /api/kids/[kidId]/tip — create a Stripe PaymentIntent for a tip */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ kidId: string }> },
) {
  const { kidId } = await params;

  const user = await getUserByKidId(kidId);
  if (!user) return NextResponse.json({ error: 'Kid not found' }, { status: 404 });

  const kid = user.kids.find((k) => k.kidId === kidId);
  if (!kid) return NextResponse.json({ error: 'Kid not found' }, { status: 404 });

  const body = await request.json();
  const amountCents = Math.round(Number(body.amount));
  const category: CommunityCategory = ['education', 'health', 'housing'].includes(body.category)
    ? body.category
    : kid.selectedCategory;
  const tipperName = String(body.tipperName ?? '').trim().slice(0, 80);
  const message = String(body.message ?? '').trim().slice(0, 300);

  if (!amountCents || amountCents < MINIMUM_TIP_CENTS || amountCents > MAXIMUM_TIP_CENTS) {
    return NextResponse.json(
      { error: `Tip must be between $${MINIMUM_TIP_CENTS / 100} and $${MAXIMUM_TIP_CENTS / 100}.` },
      { status: 400 },
    );
  }

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    description: `Good Deeds tip for ${kid.name} — ${category}`,
    metadata: {
      type: 'tip',
      kidId,
      kidName: kid.name,
      parentUsername: user.username,
      category,
      tipperName,
      message,
    },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
