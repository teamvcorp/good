'use client';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { Kid, CommunityComment, CommunityCategory } from '@/lib/types';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CATEGORY_ICON: Record<CommunityCategory, string> = {
  education: '📚',
  health: '❤️',
  housing: '🏠',
};
const CATEGORY_COLOR: Record<CommunityCategory, string> = {
  education: 'from-emerald-500 to-teal-400',
  health: 'from-teal-500 to-cyan-400',
  housing: 'from-cyan-500 to-emerald-400',
};
// ── Accent theme system ───────────────────────────────────────────────────
const THEMES = {
  emerald: {
    pageBg: 'bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-950 dark:to-emerald-950',
    headerBorder: 'border-emerald-100 dark:border-emerald-900/40',
    logoText: 'text-emerald-700 dark:text-emerald-300',
    btnSolid: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    supportBtn: 'border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30',
    cardBorder: 'border-emerald-100 dark:border-emerald-900',
    heading: 'text-emerald-800 dark:text-emerald-200',
    accent: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
    commentCard: 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800',
    divider: 'border-emerald-100 dark:border-emerald-800',
    avatarGrad: 'from-emerald-400 to-teal-400',
    accentStrip: 'from-emerald-400 to-teal-400',
    tipActive: 'bg-emerald-600 text-white',
    tipInactive: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
    focusRing: 'focus:ring-emerald-500',
    levelBeginner: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  },
  violet: {
    pageBg: 'bg-gradient-to-br from-violet-50 to-purple-100 dark:from-gray-950 dark:to-violet-950',
    headerBorder: 'border-violet-100 dark:border-violet-900/40',
    logoText: 'text-violet-700 dark:text-violet-300',
    btnSolid: 'bg-violet-600 hover:bg-violet-700 text-white',
    supportBtn: 'border-2 border-violet-500 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30',
    cardBorder: 'border-violet-100 dark:border-violet-900',
    heading: 'text-violet-800 dark:text-violet-200',
    accent: 'text-violet-700 dark:text-violet-300',
    badge: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300',
    commentCard: 'bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800',
    divider: 'border-violet-100 dark:border-violet-800',
    avatarGrad: 'from-violet-400 to-purple-400',
    accentStrip: 'from-violet-400 to-purple-400',
    tipActive: 'bg-violet-600 text-white',
    tipInactive: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700',
    focusRing: 'focus:ring-violet-500',
    levelBeginner: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
  },
  sky: {
    pageBg: 'bg-gradient-to-br from-sky-50 to-blue-100 dark:from-gray-950 dark:to-sky-950',
    headerBorder: 'border-sky-100 dark:border-sky-900/40',
    logoText: 'text-sky-700 dark:text-sky-300',
    btnSolid: 'bg-sky-600 hover:bg-sky-700 text-white',
    supportBtn: 'border-2 border-sky-500 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/30',
    cardBorder: 'border-sky-100 dark:border-sky-900',
    heading: 'text-sky-800 dark:text-sky-200',
    accent: 'text-sky-700 dark:text-sky-300',
    badge: 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300',
    commentCard: 'bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800',
    divider: 'border-sky-100 dark:border-sky-800',
    avatarGrad: 'from-sky-400 to-blue-400',
    accentStrip: 'from-sky-400 to-blue-400',
    tipActive: 'bg-sky-600 text-white',
    tipInactive: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-700',
    focusRing: 'focus:ring-sky-500',
    levelBeginner: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
  },
  rose: {
    pageBg: 'bg-gradient-to-br from-rose-50 to-pink-100 dark:from-gray-950 dark:to-rose-950',
    headerBorder: 'border-rose-100 dark:border-rose-900/40',
    logoText: 'text-rose-700 dark:text-rose-300',
    btnSolid: 'bg-rose-600 hover:bg-rose-700 text-white',
    supportBtn: 'border-2 border-rose-500 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30',
    cardBorder: 'border-rose-100 dark:border-rose-900',
    heading: 'text-rose-800 dark:text-rose-200',
    accent: 'text-rose-700 dark:text-rose-300',
    badge: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300',
    commentCard: 'bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800',
    divider: 'border-rose-100 dark:border-rose-800',
    avatarGrad: 'from-rose-400 to-pink-400',
    accentStrip: 'from-rose-400 to-pink-400',
    tipActive: 'bg-rose-600 text-white',
    tipInactive: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700',
    focusRing: 'focus:ring-rose-500',
    levelBeginner: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  },
  amber: {
    pageBg: 'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-950 dark:to-amber-950',
    headerBorder: 'border-amber-100 dark:border-amber-900/40',
    logoText: 'text-amber-700 dark:text-amber-300',
    btnSolid: 'bg-amber-600 hover:bg-amber-700 text-white',
    supportBtn: 'border-2 border-amber-500 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30',
    cardBorder: 'border-amber-100 dark:border-amber-900',
    heading: 'text-amber-800 dark:text-amber-200',
    accent: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
    commentCard: 'bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800',
    divider: 'border-amber-100 dark:border-amber-800',
    avatarGrad: 'from-amber-400 to-orange-400',
    accentStrip: 'from-amber-400 to-orange-400',
    tipActive: 'bg-amber-600 text-white',
    tipInactive: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
    focusRing: 'focus:ring-amber-500',
    levelBeginner: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  },
};

type ThemeObj = typeof THEMES[keyof typeof THEMES];

const LEVEL_COLOR = (t: ThemeObj, level: string) => {
  if (level === 'intermediate') return 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300';
  if (level === 'advanced') return 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300';
  return t.levelBeginner;
};

// ── Tip Form ───────────────────────────────────────────────────────────────
function TipForm({ kidId, kidName, defaultCategory, theme: t }: { kidId: string; kidName: string; defaultCategory: CommunityCategory; theme: ThemeObj }) {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState('5');
  const [category, setCategory] = useState<CommunityCategory>(defaultCategory);
  const [tipperName, setTipperName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const inp = `w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 ${t.focusRing}`;

  const handleTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setErrMsg('');

    const amountCents = Math.round(parseFloat(amount) * 100);

    // Create payment intent
    const res = await fetch(`/api/kids/${kidId}/tip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountCents, category, tipperName, message }),
    });
    const { clientSecret, error } = await res.json();
    if (!res.ok || !clientSecret) {
      setErrMsg(error ?? 'Could not create tip.');
      setLoading(false);
      return;
    }

    const cardEl = elements.getElement(CardElement);
    if (!cardEl) { setLoading(false); return; }

    const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardEl, billing_details: { name: tipperName || 'Anonymous' } },
    });

    setLoading(false);
    if (confirmError) {
      setErrMsg(confirmError.message ?? 'Payment failed.');
    } else {
      setStatus('success');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-3 select-none">🎉</div>
        <p className={`font-bold ${t.accent} text-lg`}>Thank you!</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Your ${amount} tip will go toward {kidName}&apos;s {category} fund.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleTip} className="space-y-4">
      {errMsg && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3">
          {errMsg}
        </div>
      )}
      <div>
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Tip Amount ($)</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {['5', '10', '25', '50'].map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => setAmount(v)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${amount === v ? t.tipActive : t.tipInactive}`}
            >
              ${v}
            </button>
          ))}
        </div>
        <input
          className={inp}
          type="number"
          min="1"
          max="1000"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Direct funds toward</label>
        <div className="flex gap-2 flex-wrap">
          {(['education', 'health', 'housing'] as CommunityCategory[]).map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${category === cat ? t.tipActive : t.tipInactive}`}
            >
              {CATEGORY_ICON[cat]} {cat}
            </button>
          ))}
        </div>
      </div>
      <input className={inp} placeholder="Your name (optional)" value={tipperName} onChange={(e) => setTipperName(e.target.value)} />
      <textarea className={inp + ' h-20 resize-none'} placeholder="Leave a positive message (optional — will go to moderation)" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={300} />
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800">
        <CardElement options={{ style: { base: { fontSize: '15px', color: '#1f2937', '::placeholder': { color: '#9ca3af' } } } }} />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full rounded-full ${t.btnSolid} disabled:opacity-50 font-bold px-6 py-3 text-sm transition-colors shadow`}
      >
        {loading ? 'Processing…' : `Send $${amount} tip`}
      </button>
    </form>
  );
}

// ── Comment Submission Form ────────────────────────────────────────────────
function CommentForm({ kidId, theme: t }: { kidId: string; theme: ThemeObj }) {
  const [authorName, setAuthorName] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const inp = `w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 ${t.focusRing}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`/api/kids/${kidId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName, body }),
    });
    if (res.ok) {
      setSent(true);
    } else {
      const d = await res.json();
      setError(d.error ?? 'Could not submit comment.');
    }
  };

  if (sent) {
    return (
      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold text-center py-4">
        ✓ Comment submitted for review. Thank you!
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <input className={inp} placeholder="Your name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required maxLength={80} />
      <textarea className={inp + ' h-24 resize-none'} placeholder="Leave a positive comment…" value={body} onChange={(e) => setBody(e.target.value)} required maxLength={1000} />
      <button className={`rounded-full ${t.btnSolid} font-semibold px-6 py-2.5 text-sm transition-colors`}>
        Submit Comment
      </button>
      <p className="text-xs text-gray-400 dark:text-gray-500">All comments are reviewed by the family before appearing publicly.</p>
    </form>
  );
}

// ── Main Public Resume ─────────────────────────────────────────────────────
type AccentKey = keyof typeof THEMES;
export default function PublicResume({ kid, comments }: { kid: Kid; comments: CommunityComment[] }) {
  const [showTip, setShowTip] = useState(false);

  const t: ThemeObj = THEMES[(kid.accentColor as AccentKey) in THEMES ? (kid.accentColor as AccentKey) : 'emerald'] ?? THEMES.emerald;

  const totalFunds =
    (kid.communityFunds.education ?? 0) +
    (kid.communityFunds.health ?? 0) +
    (kid.communityFunds.housing ?? 0);

  return (
    <div className={`min-h-screen ${t.pageBg}`}>
      {/* Header */}
      <header className={`sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b ${t.headerBorder} px-4 py-3 flex items-center justify-between`}>
        <a href="/" className={`flex items-center gap-2 font-extrabold ${t.logoText} text-base`}>
          <span className="text-xl select-none">💡</span> Good Deeds
        </a>
        <button
          onClick={() => setShowTip(true)}
          className={`rounded-full ${t.btnSolid} font-semibold px-5 py-2 text-sm shadow transition-colors`}
        >
          💚 Send a Tip
        </button>
      </header>

      <main>
        {/* ── Hero — full-width gradient with diagonal accent ── */}
        <div className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white/70 dark:bg-gray-900/60 shadow-xl ring-1 ring-black/5 sm:-mr-80 lg:-mr-96"
          />
          <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
            <div className="flex flex-col sm:flex-row items-center gap-10">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className={`w-36 h-36 rounded-3xl bg-linear-to-br ${t.avatarGrad} flex items-center justify-center text-6xl select-none shadow-2xl ring-4 ring-white dark:ring-gray-800`}>
                  {kid.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={kid.avatarUrl} alt={kid.name} className="w-36 h-36 rounded-3xl object-cover" />
                  ) : '🌟'}
                </div>
                <span className={`absolute -bottom-2 -right-2 text-xs font-bold ${t.badge} px-2.5 py-1 rounded-full ring-2 ring-white dark:ring-gray-900`}>
                  {kid.rank}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${t.badge} px-3 py-1 rounded-full mb-4`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  Living Resume · Growing in Real Time
                </div>
                <h1 className={`text-4xl sm:text-5xl font-extrabold ${t.heading} tracking-tight leading-tight`}>
                  {kid.name}
                </h1>
                <p className={`mt-2 text-base ${t.accent} font-semibold`}>
                  {kid.rank}{kid.program ? ` · ${kid.program}` : ''} · Age {kid.age}
                </p>
                {kid.bio ? (
                  <p className="mt-3 text-gray-600 dark:text-gray-300 text-base leading-relaxed max-w-xl">
                    {kid.bio}
                  </p>
                ) : (
                  <p className="mt-3 text-gray-400 italic text-sm">No bio added yet.</p>
                )}

                {/* Key stats row */}
                <div className="mt-6 flex flex-wrap gap-6 justify-center sm:justify-start">
                  <div className="text-center sm:text-left">
                    <p className={`text-3xl font-extrabold ${t.heading}`}>{kid.skills.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Skills Earned</p>
                  </div>
                  <div className="hidden sm:block w-px bg-gray-200 dark:bg-gray-700 self-stretch" />
                  <div className="text-center sm:text-left">
                    <p className={`text-3xl font-extrabold ${t.heading}`}>{kid.accomplishments.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Accomplishments</p>
                  </div>
                  <div className="hidden sm:block w-px bg-gray-200 dark:bg-gray-700 self-stretch" />
                  <div className="text-center sm:text-left">
                    <p className={`text-3xl font-extrabold ${t.heading}`}>${(totalFunds / 100).toFixed(0)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Community Raised</p>
                  </div>
                  <div className="hidden sm:block w-px bg-gray-200 dark:bg-gray-700 self-stretch" />
                  <div className="text-center sm:text-left">
                    <p className={`text-3xl font-extrabold ${t.heading}`}>{comments.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Endorsements</p>
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="mt-6 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    onClick={() => setShowTip(true)}
                    className={`rounded-full ${t.btnSolid} font-bold px-6 py-2.5 text-sm shadow-md transition-colors`}
                  >
                    💚 Support {kid.name}
                  </button>
                  {!kid.hideContactInfo && kid.email && (
                    <a href={`mailto:${kid.email}`} className={`rounded-full ${t.supportBtn} font-semibold px-5 py-2.5 text-sm transition-colors`}>
                      ✉ Get in Touch
                    </a>
                  )}
                  <span className={`self-center text-xs rounded-full ${t.badge} px-3 py-1 font-mono font-semibold`}>
                    ID: {kid.kidId}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-t from-white/60 dark:from-gray-950/60" />
        </div>

        {/* ── Content sections ── */}
        <div className="mx-auto max-w-4xl px-6 pb-20 space-y-8">

          {/* Community Impact — big stat boxes */}
          <div>
            <h2 className={`text-xs font-bold ${t.accent} uppercase tracking-widest mb-4`}>Community Impact</h2>
            <div className="grid grid-cols-1 gap-6 overflow-hidden sm:grid-cols-3">
              {(['education', 'health', 'housing'] as CommunityCategory[]).map((cat) => {
                const amount = kid.communityFunds[cat] ?? 0;
                const pct = totalFunds > 0 ? Math.round((amount / totalFunds) * 100) : 0;
                return (
                  <div key={cat} className="flex flex-col-reverse justify-between gap-y-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize flex items-center gap-2">
                        {CATEGORY_ICON[cat]} {cat}
                      </p>
                      <div className="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-linear-to-r ${CATEGORY_COLOR[cat]}`}
                          style={{ width: `${Math.max(pct, amount > 0 ? 6 : 0)}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">{pct}% of total raised</p>
                    </div>
                    <p className={`text-3xl font-extrabold ${t.accent}`}>${(amount / 100).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Total raised: <span className={t.accent}>${(totalFunds / 100).toFixed(2)}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Every dollar goes directly to education, health, or housing funds
                </p>
              </div>
              <button
                onClick={() => setShowTip(true)}
                className={`shrink-0 rounded-full ${t.supportBtn} font-semibold px-6 py-2.5 text-sm transition-colors`}
              >
                💚 Contribute
              </button>
            </div>
          </div>

          {/* Skills & Expertise */}
          <div className={`rounded-2xl bg-white dark:bg-gray-900 border ${t.cardBorder} shadow-sm p-6 sm:p-8`}>
            <h2 className={`text-xl font-extrabold ${t.heading} mb-1`}>Skills &amp; Expertise</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {kid.skills.length > 0
                ? `${kid.skills.length} skill${kid.skills.length !== 1 ? 's' : ''} earned through real-world practice`
                : 'Skills will appear here as they are earned'}
            </p>
            {kid.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {kid.skills.map((s) => (
                  <div key={s.id} className={`rounded-xl px-4 py-2 text-sm font-semibold ${LEVEL_COLOR(t, s.level)} flex items-center gap-2`}>
                    <span>{s.name}</span>
                    {s.category && <span className="text-xs opacity-60">{s.category}</span>}
                    <span className="text-xs font-medium bg-white/40 rounded-full px-2 py-0.5 capitalize">{s.level}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">No skills added yet.</p>
            )}
          </div>

          {/* Growth Story — Timeline layout */}
          <div className={`rounded-2xl bg-white dark:bg-gray-900 border ${t.cardBorder} shadow-sm p-6 sm:p-8`}>
            <h2 className={`text-xl font-extrabold ${t.heading} mb-1`}>Growth Story</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Every milestone — documented, celebrated, remembered
            </p>
            {kid.accomplishments.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 overflow-hidden sm:grid-cols-2">
                {kid.accomplishments.map((a) => (
                  <div key={a.id}>
                    <time className={`flex items-center text-sm/6 font-semibold ${t.accent}`}>
                      <svg viewBox="0 0 4 4" aria-hidden="true" className="mr-4 size-1 flex-none">
                        <circle r={2} cx={2} cy={2} fill="currentColor" />
                      </svg>
                      {a.date || 'Recent'}{a.category ? ` · ${a.category}` : ''}
                      <div
                        aria-hidden="true"
                        className="absolute -ml-2 h-px w-screen -translate-x-full bg-gray-900/10 dark:bg-white/10 sm:-ml-4 lg:static lg:-mr-6 lg:ml-8 lg:w-auto lg:flex-auto lg:translate-x-0"
                      />
                    </time>
                    <p className="mt-4 text-base/7 font-bold text-gray-900 dark:text-white">{a.title}</p>
                    {a.description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{a.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">Accomplishments will appear here as they are earned.</p>
            )}
          </div>

          {/* Academic Record */}
          <div className={`rounded-2xl bg-white dark:bg-gray-900 border ${t.cardBorder} shadow-sm p-6 sm:p-8`}>
            <h2 className={`text-xl font-extrabold ${t.heading} mb-1`}>Academic Record</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Verified grades &amp; coursework</p>
            {kid.grades.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {kid.grades.map((g) => (
                  <div key={g.id} className="flex items-center justify-between py-3.5">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{g.subject}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-base font-extrabold ${t.accent}`}>{g.grade}</span>
                      <span className={`text-xs ${t.badge} px-2.5 py-1 rounded-full`}>{g.period}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">No grades added yet.</p>
            )}
          </div>

          {/* Work Experience */}
          {(kid.employment?.length ?? 0) > 0 && (
            <div className={`rounded-2xl bg-white dark:bg-gray-900 border ${t.cardBorder} shadow-sm p-6 sm:p-8`}>
              <h2 className={`text-xl font-extrabold ${t.heading} mb-1`}>Work Experience</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Real-world professional experience</p>
              <div className="space-y-6">
                {kid.employment!.map((e) => (
                  <div key={e.id} className="flex gap-5">
                    <div className={`mt-1 w-1.5 rounded-full bg-linear-to-b ${t.accentStrip} shrink-0`} />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-gray-100">{e.title}</p>
                      <p className={`text-sm font-semibold ${t.accent} mt-0.5`}>{e.employer}</p>
                      <p className="text-xs text-gray-400 mt-1">{e.startDate}{e.endDate ? ` — ${e.endDate}` : ' — Present'}</p>
                      {e.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{e.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education History */}
          {(kid.education?.length ?? 0) > 0 && (
            <div className={`rounded-2xl bg-white dark:bg-gray-900 border ${t.cardBorder} shadow-sm p-6 sm:p-8`}>
              <h2 className={`text-xl font-extrabold ${t.heading} mb-1`}>Education</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Academic institutions &amp; credentials</p>
              <div className="space-y-6">
                {kid.education!.map((e) => (
                  <div key={e.id} className="flex gap-5">
                    <div className="mt-1 w-1.5 rounded-full bg-linear-to-b from-cyan-400 to-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-gray-100">{e.institution}</p>
                      {e.degree && <p className={`text-sm font-semibold ${t.accent} mt-0.5`}>{e.degree}{e.field ? `, ${e.field}` : ''}</p>}
                      <p className="text-xs text-gray-400 mt-1">{e.startDate}{e.endDate ? ` — ${e.endDate}` : ' — In Progress'}</p>
                      {e.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{e.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community Voices — testimonial grid */}
          <div className={`rounded-2xl bg-white dark:bg-gray-900 border ${t.cardBorder} shadow-sm overflow-hidden`}>
            <div className={`h-1.5 bg-linear-to-r ${t.accentStrip}`} />
            <div className="p-6 sm:p-8">
              <h2 className={`text-xl font-extrabold ${t.heading} mb-1`}>Community Voices</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                What the community says — real endorsements, real impact
              </p>
              {comments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {comments.map((c) => (
                    <div key={c.id} className={`rounded-2xl ${t.commentCard} px-5 py-5`}>
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 italic">&ldquo;{c.body}&rdquo;</p>
                      <div className="mt-4 flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full bg-linear-to-br ${t.avatarGrad} flex items-center justify-center text-sm font-extrabold text-white select-none`}>
                          {c.authorName.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{c.authorName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 mb-6">
                  <div className="text-5xl mb-3 select-none">💬</div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Be the first voice</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                    Your endorsement becomes a permanent part of {kid.name}&apos;s living record.
                  </p>
                </div>
              )}
              <div className={`border-t ${t.divider} pt-6`}>
                <h3 className={`text-base font-extrabold ${t.heading} mb-1`}>Leave an Endorsement</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                  Positive words become part of {kid.name}&apos;s permanent story. All comments are reviewed by the family.
                </p>
                <CommentForm kidId={kid.kidId} theme={t} />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Tip Modal */}
      {showTip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-7 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowTip(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 text-xl transition-colors"
            >
              ×
            </button>
            <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${t.avatarGrad} flex items-center justify-center text-2xl mb-5 select-none shadow-lg`}>
              💚
            </div>
            <h2 className={`text-xl font-extrabold ${t.heading} mb-1`}>Support {kid.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Your contribution goes directly to {kid.name}&apos;s education, health, or housing fund.
            </p>
            <Elements stripe={stripePromise}>
              <TipForm kidId={kid.kidId} kidName={kid.name} defaultCategory={kid.selectedCategory} theme={t} />
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
}

