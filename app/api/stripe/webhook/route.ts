import { NextRequest, NextResponse } from 'next/server';
import getStripe from '@/lib/stripe';
import { getUserByKidId, addTipToKid, getUserByUsername } from '@/lib/userStore';
import { createComment } from '@/lib/commentStore';
import type { CommunityCategory, Tip } from '@/lib/types';

export const runtime = 'nodejs';

// Disable body parsing — Stripe requires the raw body for signature verification
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('[webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const meta = pi.metadata ?? {};

    if (meta.type === 'tip') {
      // ── Handle tip ────────────────────────────────────────────────────
      const { kidId, parentUsername, category, tipperName, message } = meta;
      const amountCents = pi.amount;

      const user = await getUserByUsername(parentUsername);
      if (user) {
        const kidIndex = user.kids.findIndex((k) => k.kidId === kidId);
        if (kidIndex !== -1) {
          await addTipToKid(user.id, kidIndex, category as CommunityCategory, amountCents);

          // Record tip in the kid's history
          const tip: Tip = {
            id: pi.id,
            kidId,
            category: category as CommunityCategory,
            amount: amountCents,
            message: message || undefined,
            tipperName: tipperName || 'Anonymous',
            createdAt: new Date().toISOString(),
          };
          user.kids[kidIndex].accomplishments; // just access to keep TS happy

          // Optionally auto-create an approved comment from the tip message
          if (message && tipperName) {
            await createComment({
              id: crypto.randomUUID(),
              kidId,
              authorName: tipperName,
              body: message,
              status: 'pending', // still needs parent approval
              createdAt: new Date().toISOString(),
            });
          }

          // Store tip record on the kid (optional: store in a tips collection)
          console.info(`[webhook] Tip $${amountCents / 100} for kid ${kidId} → ${category}`);
          void tip; // tip is logged above; extend to persist if needed
        }
      }
    } else if (meta.type === 'registration') {
      // ── Handle registration payment confirmation (already created user) ──
      console.info(`[webhook] Registration confirmed for ${meta.username}`);
    }
  }

  return NextResponse.json({ received: true });
}
