'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type CategoryOption = 'education' | 'health' | 'housing';

interface KidForm {
  name: string;
  age: string;
  rank: string;
  program: string;
  selectedCategory: CategoryOption;
}

const defaultKid = (): KidForm => ({
  name: '',
  age: '',
  rank: 'Newcomer',
  program: '',
  selectedCategory: 'education',
});

function RegistrationForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 — credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  // Step 2 — parent info
  const [parentName, setParentName] = useState('');
  const [parentAge, setParentAge] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // Step 3 — kids
  const [kids, setKids] = useState<KidForm[]>([defaultKid()]);
  const [wantBusinessCards, setWantBusinessCards] = useState(false);

  // Step 4 — payment (handled by Stripe Elements)

  const next = () => {
    setError('');
    if (step === 1) {
      if (username.trim().length < 3) return setError('Username must be at least 3 characters.');
      if (!/^[a-z0-9_]+$/i.test(username.trim())) return setError('Username: letters, numbers, underscores only.');
      if (password.length < 8) return setError('Password must be at least 8 characters.');
      if (password !== confirm) return setError('Passwords do not match.');
    }
    if (step === 2) {
      if (!parentName.trim()) return setError('Parent name is required.');
      if (!parentAge || Number(parentAge) < 18) return setError('Parent must be at least 18.');
      if (!street.trim() || !city.trim() || !state || !zip.trim()) return setError('Full address is required.');
      if (!/^\d{5}(-\d{4})?$/.test(zip.trim())) return setError('Enter a valid 5-digit ZIP code.');
    }
    if (step === 3) {
      if (kids.some((k) => !k.name.trim() || !k.age)) return setError('Each child needs a name and age.');
    }
    setStep((s) => s + 1);
  };

  const updateKid = (i: number, field: keyof KidForm, value: string) => {
    setKids((prev) => prev.map((k, idx) => (idx === i ? { ...k, [field]: value } : k)));
  };

  const addKid = () => setKids((prev) => [...prev, defaultKid()]);
  const removeKid = (i: number) => setKids((prev) => prev.filter((_, idx) => idx !== i));

  const kidCount = kids.length;
  const totalDollars = kidCount * 5 + (wantBusinessCards ? kidCount * 10 : 0);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    const cardEl = elements.getElement(CardElement);
    if (!cardEl) { setLoading(false); return; }

    // Create payment method
    const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardEl,
      billing_details: { name: parentName, email: email || undefined },
    });

    if (pmError || !paymentMethod) {
      setError(pmError?.message ?? 'Card error.');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.toLowerCase().trim(),
        password,
        parentName,
        parentAge: Number(parentAge),
        email,
        phone,
        address: { street: street.trim(), city: city.trim(), state, zip: zip.trim() },
        kids,
        wantBusinessCards,
        paymentMethodId: paymentMethod.id,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Registration failed.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  const CARD_STYLE = {
    hidePostalCode: false,
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        '::placeholder': { color: '#9ca3af' },
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <span className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-base select-none">💡</span>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">Good Deeds</h1>
            <p className="text-xs text-slate-400">Student Registration</p>
          </div>
        </div>
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex-1 flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                  step >= n
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                }`}
              >
                {n}
              </div>
              {n < 4 && <div className={`flex-1 h-0.5 rounded ${step > n ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {/* Step 1 — Account */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create Your Account</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">You&apos;ll use this to manage your child&apos;s profile.</p>
            <input className={input} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input className={input} type="password" placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input className={input} type="password" placeholder="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        )}

        {/* Step 2 — Parent Info */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Parent / Guardian Info</h2>
            <input className={input} placeholder="Your full name" value={parentName} onChange={(e) => setParentName(e.target.value)} />
            <input className={input} type="number" placeholder="Your age" value={parentAge} onChange={(e) => setParentAge(e.target.value)} />
            <input className={input} type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={input} type="tel" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="section-label mb-3">Home Address</p>
              <div className="space-y-3">
                <input className={input} placeholder="Street address" value={street} onChange={(e) => setStreet(e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <input className={input} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                  <input className={input} placeholder="ZIP code" value={zip} onChange={(e) => setZip(e.target.value)} maxLength={10} />
                </div>
                <select
                  className={input}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                >
                  <option value="">State…</option>
                  {US_STATES.map((s) => <option key={s.abbr} value={s.abbr}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Kids */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Add Students</h2>
            {kids.map((kid, i) => (
              <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Student {i + 1}</span>
                  {kids.length > 1 && (
                    <button onClick={() => removeKid(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  )}
                </div>
                <input className={input} placeholder="Child's name" value={kid.name} onChange={(e) => updateKid(i, 'name', e.target.value)} />
                <input className={input} type="number" placeholder="Age" value={kid.age} onChange={(e) => updateKid(i, 'age', e.target.value)} />
                <input className={input} placeholder="Rank / Level (e.g. Newcomer)" value={kid.rank} onChange={(e) => updateKid(i, 'rank', e.target.value)} />
                <input className={input} placeholder="Program (optional)" value={kid.program} onChange={(e) => updateKid(i, 'program', e.target.value)} />
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Community funds go towards:</label>
                  <div className="flex gap-2 flex-wrap">
                    {(['education', 'health', 'housing'] as CategoryOption[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => updateKid(i, 'selectedCategory', cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                          kid.selectedCategory === cat
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:text-emerald-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addKid} className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
              + Add another student
            </button>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 accent-emerald-600"
                checked={wantBusinessCards}
                onChange={(e) => setWantBusinessCards(e.target.checked)}
              />
              <div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Add physical business cards (+$10/student)</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  We&apos;ll mail each child a set of professional cards with their unique GD ID and QR code for their resume.
                </p>
              </div>
            </label>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              Total due today: <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${totalDollars}</span>
              <span className="ml-2 text-xs font-normal text-slate-400">
                ({kidCount} student{kidCount > 1 ? 's' : ''} × $5 registration{wantBusinessCards ? ` + ${kidCount} × $10 cards` : ''})
              </span>
            </div>
          </div>
        )}

        {/* Step 4 — Payment */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Payment</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Securely pay <span className="font-bold text-emerald-600 dark:text-emerald-400">${totalDollars}</span> to complete registration.
            </p>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800">
              <CardElement options={CARD_STYLE} />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Payments are processed securely by Stripe. We never store your card details.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} className={btnSecondary}>
              ← Back
            </button>
          )}
          {step < 4 ? (
            <button onClick={next} className={btnPrimary}>
              Continue →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className={btnPrimary}>
              {loading ? 'Processing…' : `Pay $${totalDollars} & Register`}
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <a href="/login" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
            Sign in
          </a>
        </p>
        <p className="mt-5 text-center text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Von Der Becke Academy Corp</span>
          {' '}· 501(c)(3) Educational Facility · EIN&nbsp;46-1005883
        </p>
      </div>
    </div>
  );
}

const input =
  'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';
const btnPrimary =
  'flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 text-sm transition-colors';
const btnSecondary =
  'rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 font-semibold px-6 py-2.5 text-sm transition-colors';

const US_STATES = [
  { abbr: 'AL', name: 'Alabama' }, { abbr: 'AK', name: 'Alaska' }, { abbr: 'AZ', name: 'Arizona' },
  { abbr: 'AR', name: 'Arkansas' }, { abbr: 'CA', name: 'California' }, { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' }, { abbr: 'DE', name: 'Delaware' }, { abbr: 'FL', name: 'Florida' },
  { abbr: 'GA', name: 'Georgia' }, { abbr: 'HI', name: 'Hawaii' }, { abbr: 'ID', name: 'Idaho' },
  { abbr: 'IL', name: 'Illinois' }, { abbr: 'IN', name: 'Indiana' }, { abbr: 'IA', name: 'Iowa' },
  { abbr: 'KS', name: 'Kansas' }, { abbr: 'KY', name: 'Kentucky' }, { abbr: 'LA', name: 'Louisiana' },
  { abbr: 'ME', name: 'Maine' }, { abbr: 'MD', name: 'Maryland' }, { abbr: 'MA', name: 'Massachusetts' },
  { abbr: 'MI', name: 'Michigan' }, { abbr: 'MN', name: 'Minnesota' }, { abbr: 'MS', name: 'Mississippi' },
  { abbr: 'MO', name: 'Missouri' }, { abbr: 'MT', name: 'Montana' }, { abbr: 'NE', name: 'Nebraska' },
  { abbr: 'NV', name: 'Nevada' }, { abbr: 'NH', name: 'New Hampshire' }, { abbr: 'NJ', name: 'New Jersey' },
  { abbr: 'NM', name: 'New Mexico' }, { abbr: 'NY', name: 'New York' }, { abbr: 'NC', name: 'North Carolina' },
  { abbr: 'ND', name: 'North Dakota' }, { abbr: 'OH', name: 'Ohio' }, { abbr: 'OK', name: 'Oklahoma' },
  { abbr: 'OR', name: 'Oregon' }, { abbr: 'PA', name: 'Pennsylvania' }, { abbr: 'RI', name: 'Rhode Island' },
  { abbr: 'SC', name: 'South Carolina' }, { abbr: 'SD', name: 'South Dakota' }, { abbr: 'TN', name: 'Tennessee' },
  { abbr: 'TX', name: 'Texas' }, { abbr: 'UT', name: 'Utah' }, { abbr: 'VT', name: 'Vermont' },
  { abbr: 'VA', name: 'Virginia' }, { abbr: 'WA', name: 'Washington' }, { abbr: 'WV', name: 'West Virginia' },
  { abbr: 'WI', name: 'Wisconsin' }, { abbr: 'WY', name: 'Wyoming' }, { abbr: 'DC', name: 'Washington D.C.' },
];

export default function RegisterPage() {
  return (
    <Elements stripe={stripePromise}>
      <RegistrationForm />
    </Elements>
  );
}
