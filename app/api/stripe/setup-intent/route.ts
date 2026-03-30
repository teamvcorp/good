import { NextRequest, NextResponse } from 'next/server';
import getStripe from '@/lib/stripe';
import { auth } from '@/auth';
import { getUserByUsername } from '@/lib/userStore';

/** POST /api/stripe/setup-intent — create a SetupIntent to save a card */
export async function POST(_request: NextRequest) {
  try {
    const stripe = getStripe();
    const session = await auth();

    let customerId: string | undefined;
    if (session?.user?.username) {
      const user = await getUserByUsername(session.user.username);
      customerId = user?.stripeCustomerId;
    }

    const setupIntent = await stripe.setupIntents.create({
      usage: 'off_session',
      ...(customerId ? { customer: customerId } : {}),
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    console.error('[setup-intent]', err);
    return NextResponse.json({ error: 'Could not create setup intent.' }, { status: 500 });
  }
}
