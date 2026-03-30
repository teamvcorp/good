import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { auth } from '@/auth';
import { getUserByUsername, updateUser } from '@/lib/userStore';
import getStripe from '@/lib/stripe';

const BUSINESS_CARD_FEE = 1000; // $10.00 per set

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ kidId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { kidId } = await params;
    const user = await getUserByUsername(session.user.username);
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const kid = user.kids.find((k) => k.kidId === kidId);
    if (!kid) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const { paymentMethodId, address } = await request.json();
    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method is required.' }, { status: 400 });
    }
    if (!address?.street?.trim() || !address?.city?.trim() || !address?.state?.trim() || !address?.zip?.trim()) {
      return NextResponse.json({ error: 'A complete shipping address is required.' }, { status: 400 });
    }
    const shipTo = {
      street: String(address.street).trim(),
      city: String(address.city).trim(),
      state: String(address.state).trim(),
      zip: String(address.zip).trim(),
    };

    const stripe = getStripe();

    // Attach the new payment method to the existing Stripe customer (or create a temp customer)
    let customerId = user.stripeCustomerId;
    if (customerId) {
      try {
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
      } catch {
        // already attached — fine
      }
    } else {
      const customer = await stripe.customers.create({
        name: user.parentName,
        email: user.email || undefined,
      });
      customerId = customer.id;
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    }

    // Charge $10
    await stripe.paymentIntents.create({
      amount: BUSINESS_CARD_FEE,
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      description: `Good Deeds business card reorder — ${kid.name}`,
      metadata: {
        type: 'card_reorder',
        username: user.username,
        kidId: kid.kidId,
        kidName: kid.name,
      },
    });

    // Send fulfillment email
    try {
      // Save address back to user record so future reorders are pre-populated
      user.address = shipTo;
      await updateUser(user);
    } catch {
      // non-critical — don't block the order
    }

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: 'gooddeed@fyht4.com',
        to: 'teamvcorp@thevacorp.com',
        subject: '#GoodOrder',
        text: [
          'Business Card Reorder — Good Deeds',
          '',
          `Parent:   ${user.parentName}`,
          `Username: ${user.username}`,
          `Email:    ${user.email || '(not provided)'}`,
          `Phone:    ${user.phone || '(not provided)'}`,
          '',
          'Ship to:',
          `  ${shipTo.street}`,
          `  ${shipTo.city}, ${shipTo.state} ${shipTo.zip}`,
          '',
          'Student:',
          `  ${kid.name} (Age ${kid.age}) — ID: ${kid.kidId}`,
          '',
          'Amount charged: $10.00',
        ].join('\n'),
      });
    } catch (emailErr) {
      console.error('[reorder-cards] email failed:', emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[reorder-cards]', err);
    const msg = err instanceof Error ? err.message : 'Reorder failed.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
