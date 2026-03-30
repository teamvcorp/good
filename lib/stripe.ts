import Stripe from 'stripe';

let _stripe: Stripe | undefined;

/** Returns a cached Stripe instance. Initialised lazily so build-time analysis
 *  doesn't fail when STRIPE_SECRET_KEY is absent from the environment. */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export default getStripe;
