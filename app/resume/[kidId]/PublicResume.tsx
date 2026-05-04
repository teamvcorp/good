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

// ── Minimal accent system — zinc base, one highlight color ────────────────
const ACCENTS = {
  emerald: {
    btn: 'bg-teal-600 hover:bg-teal-500 text-white',
    outlineBtn: 'ring-1 ring-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-400/10',
    text: 'text-teal-600 dark:text-teal-400',
    badge: 'bg-teal-50 dark:bg-teal-400/10 text-teal-600 dark:text-teal-400 ring-1 ring-inset ring-teal-600/20 dark:ring-teal-400/20',
    bar: 'bg-teal-500',
    dot: 'bg-teal-500',
    pill: 'bg-teal-600 text-white',
    pillInactive: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700',
    ring: 'focus:ring-teal-500',
    avatarRing: 'ring-teal-100 dark:ring-teal-900/30',
    leftBar: 'bg-teal-500',
  },
  violet: {
    btn: 'bg-violet-600 hover:bg-violet-500 text-white',
    outlineBtn: 'ring-1 ring-violet-500 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-400/10',
    text: 'text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-50 dark:bg-violet-400/10 text-violet-600 dark:text-violet-400 ring-1 ring-inset ring-violet-600/20 dark:ring-violet-400/20',
    bar: 'bg-violet-500',
    dot: 'bg-violet-500',
    pill: 'bg-violet-600 text-white',
    pillInactive: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700',
    ring: 'focus:ring-violet-500',
    avatarRing: 'ring-violet-100 dark:ring-violet-900/30',
    leftBar: 'bg-violet-500',
  },
  sky: {
    btn: 'bg-sky-600 hover:bg-sky-500 text-white',
    outlineBtn: 'ring-1 ring-sky-500 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-400/10',
    text: 'text-sky-600 dark:text-sky-400',
    badge: 'bg-sky-50 dark:bg-sky-400/10 text-sky-600 dark:text-sky-400 ring-1 ring-inset ring-sky-600/20 dark:ring-sky-400/20',
    bar: 'bg-sky-500',
    dot: 'bg-sky-500',
    pill: 'bg-sky-600 text-white',
    pillInactive: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700',
    ring: 'focus:ring-sky-500',
    avatarRing: 'ring-sky-100 dark:ring-sky-900/30',
    leftBar: 'bg-sky-500',
  },
  rose: {
    btn: 'bg-rose-600 hover:bg-rose-500 text-white',
    outlineBtn: 'ring-1 ring-rose-500 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-400/10',
    text: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-50 dark:bg-rose-400/10 text-rose-600 dark:text-rose-400 ring-1 ring-inset ring-rose-600/20 dark:ring-rose-400/20',
    bar: 'bg-rose-500',
    dot: 'bg-rose-500',
    pill: 'bg-rose-600 text-white',
    pillInactive: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700',
    ring: 'focus:ring-rose-500',
    avatarRing: 'ring-rose-100 dark:ring-rose-900/30',
    leftBar: 'bg-rose-500',
  },
  amber: {
    btn: 'bg-amber-600 hover:bg-amber-500 text-white',
    outlineBtn: 'ring-1 ring-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-400/10',
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-50 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/20',
    bar: 'bg-amber-500',
    dot: 'bg-amber-500',
    pill: 'bg-amber-600 text-white',
    pillInactive: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700',
    ring: 'focus:ring-amber-500',
    avatarRing: 'ring-amber-100 dark:ring-amber-900/30',
    leftBar: 'bg-amber-500',
  },
};

type Accent = typeof ACCENTS[keyof typeof ACCENTS];

const LEVEL_STYLE = (level: string) => {
  if (level === 'advanced') return 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900';
  if (level === 'intermediate') return 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200';
  return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400';
};

// ── Tip Form ───────────────────────────────────────────────────────────────
function TipForm({ kidId, kidName, defaultCategory, accent: a }: { kidId: string; kidName: string; defaultCategory: CommunityCategory; accent: Accent }) {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState('5');
  const [category, setCategory] = useState<CommunityCategory>(defaultCategory);
  const [tipperName, setTipperName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const inp = `w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 ${a.ring} transition`;

  const handleTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setErrMsg('');

    const amountCents = Math.round(parseFloat(amount) * 100);

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
      <div className="text-center py-8">
        <div className="text-5xl mb-4 select-none">🎉</div>
        <p className={`font-semibold ${a.text} text-lg`}>Thank you!</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
          Your ${amount} tip will go toward {kidName}&apos;s {category} fund.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleTip} className="space-y-4">
      {errMsg && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/50 ring-1 ring-red-200 dark:ring-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3">
          {errMsg}
        </div>
      )}
      <div>
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block tracking-wide uppercase">Amount ($)</label>
        <div className="flex gap-2 flex-wrap mb-3">
          {['5', '10', '25', '50'].map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => setAmount(v)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${amount === v ? a.pill : a.pillInactive}`}
            >
              ${v}
            </button>
          ))}
        </div>
        <input className={inp} type="number" min="1" max="1000" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block tracking-wide uppercase">Direct toward</label>
        <div className="flex gap-2 flex-wrap">
          {(['education', 'health', 'housing'] as CommunityCategory[]).map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors ${category === cat ? a.pill : a.pillInactive}`}
            >
              {CATEGORY_ICON[cat]} {cat}
            </button>
          ))}
        </div>
      </div>
      <input className={inp} placeholder="Your name (optional)" value={tipperName} onChange={(e) => setTipperName(e.target.value)} />
      <textarea className={inp + ' h-20 resize-none'} placeholder="Leave a message (optional — goes to moderation)" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={300} />
      <div className="ring-1 ring-zinc-200 dark:ring-zinc-700 rounded-lg px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50">
        <CardElement options={{ style: { base: { fontSize: '14px', color: '#18181b', '::placeholder': { color: '#a1a1aa' } } } }} />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full rounded-full ${a.btn} disabled:opacity-40 font-semibold px-6 py-2.5 text-sm transition-all shadow-sm`}
      >
        {loading ? 'Processing…' : `Send $${amount} tip`}
      </button>
    </form>
  );
}

// ── Comment Submission Form ────────────────────────────────────────────────
function CommentForm({ kidId, accent: a }: { kidId: string; accent: Accent }) {
  const [authorName, setAuthorName] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const inp = `w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 ${a.ring} transition`;

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
      <p className={`text-sm ${a.text} font-medium text-center py-4`}>
        ✓ Comment submitted for review. Thank you!
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <input className={inp} placeholder="Your name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required maxLength={80} />
      <textarea className={inp + ' h-24 resize-none'} placeholder="Leave a positive comment…" value={body} onChange={(e) => setBody(e.target.value)} required maxLength={1000} />
      <button className={`rounded-full ${a.btn} font-medium px-6 py-2.5 text-sm transition-all shadow-sm`}>
        Submit Endorsement
      </button>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">All comments are reviewed by the family before appearing publicly.</p>
    </form>
  );
}

// ── Main Public Resume ─────────────────────────────────────────────────────
type AccentKey = keyof typeof ACCENTS;
export default function PublicResume({ kid, comments }: { kid: Kid; comments: CommunityComment[] }) {
  const [showTip, setShowTip] = useState(false);

  const a: Accent = ACCENTS[(kid.accentColor as AccentKey) in ACCENTS ? (kid.accentColor as AccentKey) : 'emerald'] ?? ACCENTS.emerald;

  const totalFunds =
    (kid.communityFunds.education ?? 0) +
    (kid.communityFunds.health ?? 0) +
    (kid.communityFunds.housing ?? 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 antialiased">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm ring-1 ring-zinc-900/10 dark:ring-zinc-800">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-100 text-sm tracking-tight">
            <span className="text-lg select-none">💡</span> Good Deeds
          </a>
          <button
            onClick={() => setShowTip(true)}
            className={`rounded-full ${a.btn} font-medium px-5 py-2 text-sm shadow-sm transition-all`}
          >
            Support {kid.name}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-20">

        {/* ── Hero ── */}
        <div className="pt-12 pb-10 sm:pt-16 sm:pb-14">
          <div className="flex flex-col sm:flex-row items-start gap-8 sm:gap-12">

            {/* Avatar */}
            <div className="shrink-0">
              <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-4 ${a.avatarRing} bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-5xl select-none shadow-md overflow-hidden`}>
                {kid.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={kid.avatarUrl} alt={kid.name} className="w-full h-full object-cover" />
                ) : '🌟'}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className={`inline-flex items-center gap-1.5 text-xs font-medium ${a.badge} px-2.5 py-1 rounded-full mb-3`}>
                <span className={`w-1.5 h-1.5 rounded-full ${a.dot} animate-pulse`} />
                Living Resume · Growing in Real Time
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
                {kid.name}
              </h1>
              <p className={`mt-1 text-base font-medium ${a.text}`}>
                {kid.rank}{kid.program ? ` · ${kid.program}` : ''} · Age {kid.age}
              </p>
              {kid.bio ? (
                <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-base leading-relaxed max-w-xl">
                  {kid.bio}
                </p>
              ) : (
                <p className="mt-3 text-zinc-400 dark:text-zinc-500 italic text-sm">No bio added yet.</p>
              )}

              {/* Stats row */}
              <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
                <div>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{kid.skills.length}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Skills</p>
                </div>
                <div className="hidden sm:block h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
                <div>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{kid.accomplishments.length}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Accomplishments</p>
                </div>
                <div className="hidden sm:block h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
                <div>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">${(totalFunds / 100).toFixed(0)}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Community Raised</p>
                </div>
                <div className="hidden sm:block h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
                <div>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{comments.length}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Endorsements</p>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowTip(true)}
                  className={`rounded-full ${a.btn} font-medium px-6 py-2.5 text-sm shadow-sm transition-all`}
                >
                  💚 Support {kid.name}
                </button>
                {!kid.hideContactInfo && kid.email && (
                  <a
                    href={`mailto:${kid.email}`}
                    className={`rounded-full ${a.outlineBtn} font-medium px-5 py-2.5 text-sm transition-all`}
                  >
                    ✉ Get in Touch
                  </a>
                )}
                <span className="self-center text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-3 py-1 font-mono">
                  ID: {kid.kidId}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-zinc-100 dark:border-zinc-800" />

        {/* ── Content Sections ── */}
        <div className="mt-10 space-y-6">

          {/* Community Impact */}
          <section>
            <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-4">Community Impact</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {(['education', 'health', 'housing'] as CommunityCategory[]).map((cat) => {
                const amount = kid.communityFunds[cat] ?? 0;
                const pct = totalFunds > 0 ? Math.round((amount / totalFunds) * 100) : 0;
                return (
                  <div key={cat} className="rounded-2xl border border-zinc-100 dark:border-zinc-700/40 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                    <p className={`text-2xl font-bold ${a.text}`}>${(amount / 100).toFixed(2)}</p>
                    <p className="mt-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 capitalize flex items-center gap-1.5">
                      {CATEGORY_ICON[cat]} {cat}
                    </p>
                    <div className="mt-3 h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div className={`h-full rounded-full ${a.bar} transition-all`} style={{ width: `${Math.max(pct, amount > 0 ? 6 : 0)}%` }} />
                    </div>
                    <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">{pct}% of total</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-2xl border border-zinc-100 dark:border-zinc-700/40 bg-white dark:bg-zinc-900 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  Total raised: <span className={a.text}>${(totalFunds / 100).toFixed(2)}</span>
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Every dollar goes directly to education, health, or housing funds
                </p>
              </div>
              <button
                onClick={() => setShowTip(true)}
                className={`shrink-0 rounded-full ${a.outlineBtn} font-medium px-5 py-2 text-sm transition-all`}
              >
                💚 Contribute
              </button>
            </div>
          </section>

          {/* Skills */}
          <section className="rounded-2xl border border-zinc-100 dark:border-zinc-700/40 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Skills &amp; Expertise</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {kid.skills.length > 0
                ? `${kid.skills.length} skill${kid.skills.length !== 1 ? 's' : ''} earned through real-world practice`
                : 'Skills will appear here as they are earned'}
            </p>
            {kid.skills.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {kid.skills.map((s) => (
                  <div key={s.id} className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${LEVEL_STYLE(s.level)} flex items-center gap-1.5`}>
                    <span>{s.name}</span>
                    {s.category && <span className="opacity-50">·</span>}
                    {s.category && <span className="opacity-60">{s.category}</span>}
                    <span className="opacity-50 capitalize">{s.level}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-400 dark:text-zinc-500 italic">No skills added yet.</p>
            )}
          </section>

          {/* Growth Story */}
          <section className="rounded-2xl border border-zinc-100 dark:border-zinc-700/40 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Growth Story</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Every milestone — documented, celebrated, remembered</p>
            {kid.accomplishments.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
                {kid.accomplishments.map((acc) => (
                  <div key={acc.id} className="relative">
                    <div className={`flex items-center gap-2 text-sm font-medium ${a.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${a.dot} shrink-0`} />
                      <time>{acc.date || 'Recent'}{acc.category ? ` · ${acc.category}` : ''}</time>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">{acc.title}</p>
                    {acc.description && (
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{acc.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-400 dark:text-zinc-500 italic">Accomplishments will appear here as they are earned.</p>
            )}
          </section>

          {/* Academic Record */}
          <section className="rounded-2xl border border-zinc-100 dark:border-zinc-700/40 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Academic Record</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Verified grades &amp; coursework</p>
            {kid.grades.length > 0 ? (
              <div className="mt-5 divide-y divide-zinc-100 dark:divide-zinc-800">
                {kid.grades.map((g) => (
                  <div key={g.id} className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{g.subject}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${a.text}`}>{g.grade}</span>
                      <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2.5 py-0.5 rounded-full">{g.period}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-400 dark:text-zinc-500 italic">No grades added yet.</p>
            )}
          </section>

          {/* Work Experience */}
          {(kid.employment?.length ?? 0) > 0 && (
            <section className="rounded-2xl border border-zinc-100 dark:border-zinc-700/40 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
              <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Work Experience</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Real-world professional experience</p>
              <div className="mt-5 space-y-6">
                {kid.employment!.map((e) => (
                  <div key={e.id} className="flex gap-4">
                    <div className={`mt-1 w-0.5 self-stretch rounded-full ${a.leftBar} shrink-0 opacity-50`} />
                    <div>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{e.title}</p>
                      <p className={`text-sm ${a.text} mt-0.5`}>{e.employer}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{e.startDate}{e.endDate ? ` — ${e.endDate}` : ' — Present'}</p>
                      {e.description && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">{e.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education History */}
          {(kid.education?.length ?? 0) > 0 && (
            <section className="rounded-2xl border border-zinc-100 dark:border-zinc-700/40 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
              <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Education</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Academic institutions &amp; credentials</p>
              <div className="mt-5 space-y-6">
                {kid.education!.map((e) => (
                  <div key={e.id} className="flex gap-4">
                    <div className={`mt-1 w-0.5 self-stretch rounded-full ${a.leftBar} shrink-0 opacity-50`} />
                    <div>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{e.institution}</p>
                      {e.degree && (
                        <p className={`text-sm ${a.text} mt-0.5`}>{e.degree}{e.field ? `, ${e.field}` : ''}</p>
                      )}
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{e.startDate}{e.endDate ? ` — ${e.endDate}` : ' — In Progress'}</p>
                      {e.description && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">{e.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Community Voices */}
          <section className="rounded-2xl border border-zinc-100 dark:border-zinc-700/40 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
            <div className={`h-1 ${a.bar}`} />
            <div className="p-6 sm:p-8">
              <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Community Voices</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                What the community says — real endorsements, real impact
              </p>
              {comments.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {comments.map((c) => (
                    <figure key={c.id} className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 ring-1 ring-zinc-100 dark:ring-zinc-700/40 px-5 py-5">
                      <blockquote className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                        &ldquo;{c.body}&rdquo;
                      </blockquote>
                      <figcaption className="mt-4 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-600 dark:text-zinc-300 select-none">
                          {c.authorName.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{c.authorName}</p>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 mb-6">
                  <div className="text-4xl mb-3 select-none">💬</div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Be the first voice</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-sm mx-auto">
                    Your endorsement becomes a permanent part of {kid.name}&apos;s living record.
                  </p>
                </div>
              )}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1">Leave an Endorsement</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
                  Positive words become part of {kid.name}&apos;s permanent story. All comments are reviewed by the family.
                </p>
                <CommentForm kidId={kid.kidId} accent={a} />
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ── Tip Modal ── */}
      {showTip && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl ring-1 ring-zinc-900/10 dark:ring-zinc-700 p-7 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowTip(false)}
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 text-lg transition-colors"
            >
              ×
            </button>
            <div className={`w-12 h-12 rounded-xl ${a.btn} flex items-center justify-center text-xl mb-5 select-none shadow-sm`}>
              💚
            </div>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Support {kid.name}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-6">
              Your contribution goes directly to {kid.name}&apos;s education, health, or housing fund.
            </p>
            <Elements stripe={stripePromise}>
              <TipForm kidId={kid.kidId} kidName={kid.name} defaultCategory={kid.selectedCategory} accent={a} />
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
}

