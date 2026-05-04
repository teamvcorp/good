'use client';
import { useState, useEffect } from 'react';

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

type DirKid = {
  kidId: string;
  name: string;
  age: number;
  rank: string;
  program?: string;
  bio?: string;
  avatarUrl?: string;
  skills: { name: string; category: string; level: string }[];
  city?: string;
  state?: string;
  zip?: string;
  email?: string;
  phone?: string;
  totalFunds: number;
  commentCount: number;
};

function EmployerDirectory() {
  const [q, setQ] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [zipFilter, setZipFilter] = useState('');
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [kids, setKids] = useState<DirKid[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (stateFilter) params.set('state', stateFilter);
    if (zipFilter) params.set('zip', zipFilter);
    params.set('sort', sort);
    params.set('order', order);

    async function run() {
      setLoading(true);
      try {
        const res = await fetch(`/api/directory?${params}`);
        const data = await res.json();
        if (mounted) {
          setKids(data.kids ?? []);
          setTotal(data.total ?? 0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [q, stateFilter, zipFilter, sort, order]);

  const sel = 'rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500';

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Header */}
        <div>
          <p className="section-label mb-2">Employer Portal</p>
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">Student Directory</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base max-w-2xl">
            Browse verified Good Deeds students who have opted in to employer contact. Only students with public contact settings appear here.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-50">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block uppercase tracking-wide">Search</label>
              <input
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Name, skill, city, bio…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block uppercase tracking-wide">State</label>
              <select className={sel} value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
                <option value="">All states</option>
                {US_STATES.map((s) => <option key={s.abbr} value={s.abbr}>{s.abbr} — {s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block uppercase tracking-wide">ZIP</label>
              <input className={`${sel} w-32`} placeholder="75001" value={zipFilter} onChange={(e) => setZipFilter(e.target.value)} maxLength={10} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block uppercase tracking-wide">Sort by</label>
              <select className={sel} value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="name">Name</option>
                <option value="state">State</option>
                <option value="zip">ZIP</option>
                <option value="comments">Comments</option>
                <option value="funds">Funds Raised</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block uppercase tracking-wide">Order</label>
              <select className={sel} value={order} onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}>
                <option value="asc">A → Z / Low → High</option>
                <option value="desc">Z → A / High → Low</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
            {loading ? 'Searching…' : `${total} student${total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Empty state */}
        {!loading && kids.length === 0 && (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500">
            <div className="text-6xl mb-4 select-none">🎓</div>
            <p className="text-lg font-semibold text-slate-500">No students match your search.</p>
            <p className="text-sm mt-1">Try broadening your filters or clearing the search.</p>
          </div>
        )}

        {/* Results grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {kids.map((kid) => (
            <a
              key={kid.kidId}
              href={`/resume/${kid.kidId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all p-5 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl shrink-0 select-none overflow-hidden border border-slate-200 dark:border-slate-600">
                  {kid.avatarUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={kid.avatarUrl} alt={kid.name} className="w-14 h-14 object-cover" />
                    : '🌟'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">{kid.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{kid.rank}{kid.program ? ` · ${kid.program}` : ''} · Age {kid.age}</p>
                  {(kid.city || kid.state) && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">📍 {[kid.city, kid.state].filter(Boolean).join(', ')}{kid.zip ? ` ${kid.zip}` : ''}</p>
                  )}
                </div>
              </div>

              {kid.bio && <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">{kid.bio}</p>}

              {kid.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {kid.skills.slice(0, 4).map((s, i) => (
                    <span key={i} className="text-xs rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 font-medium">
                      {s.name}
                    </span>
                  ))}
                  {kid.skills.length > 4 && (
                    <span className="text-xs text-slate-400">+{kid.skills.length - 4}</span>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center gap-5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-3">
                <span>💬 {kid.commentCount} comments</span>
                <span>💚 ${(kid.totalFunds / 100).toFixed(2)}</span>
              </div>

              {(kid.email || kid.phone) && (
                <div className="mt-2 space-y-0.5">
                  {kid.email && <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">✉ {kid.email}</p>}
                  {kid.phone && <p className="text-xs text-emerald-600 dark:text-emerald-400">📞 {kid.phone}</p>}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState<'home' | 'employers'>('home');

  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      {/* Sticky Nav */}
      <nav className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between">
        <button
          onClick={() => setTab('home')}
          className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5 text-base"
        >
          <span className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-sm select-none">💡</span>
          Good Deeds
        </button>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setTab('home')}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${tab === 'home' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Home
          </button>
          <button
            onClick={() => setTab('employers')}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${tab === 'employers' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            For Employers
          </button>
          <a href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 transition-colors">
            Sign In
          </a>
          <a
            href="/register"
            className="text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-1.5 transition-colors shadow-sm"
          >
            Register
          </a>
        </div>
      </nav>

      {tab === 'employers' && <EmployerDirectory />}

      {tab === 'home' && (<>

      {/* Hero — gradient with diagonal accent (style from example) */}
      <section className="relative isolate overflow-hidden bg-linear-to-b from-emerald-50/20 dark:from-emerald-950/10 pt-14">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white dark:bg-slate-900 shadow-xl shadow-emerald-600/10 ring-1 ring-emerald-50 dark:ring-white/5 sm:-mr-80 lg:-mr-96"
        />
        <div className="mx-auto max-w-5xl px-6 py-32 sm:py-40 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6 xl:grid-cols-1 xl:grid-rows-1 xl:gap-x-8">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700/60 rounded-full px-4 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-widest uppercase mb-6 lg:col-span-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Now Enrolling · After-School &amp; Weekends
            </div>
            <h1 className="max-w-2xl text-balance text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-7xl lg:col-span-2 xl:col-auto leading-[1.1]">
              Build Character.<br />
              Build Community.<br />
              <span className="text-emerald-600 dark:text-emerald-400">Build a Future.</span>
            </h1>
            <div className="mt-6 max-w-xl lg:mt-0 xl:col-end-1 xl:row-start-1">
              <p className="text-pretty text-lg font-medium text-slate-500 dark:text-slate-400 sm:text-xl/8 leading-relaxed">
                Good Deeds gives young people a <strong className="text-slate-700 dark:text-slate-200">living resume</strong> that grows with every good action — documenting skills, community impact, and character in real time. Not just for today. For life.
              </p>
              <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                A <span className="font-semibold text-slate-600 dark:text-slate-300">Von Der Becke Academy Corp</span> Initiative ·{' '}
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">501(c)(3) Educational Nonprofit · EIN 46-1005883</span>
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 text-base transition-colors shadow-lg shadow-emerald-600/30">
                  Enroll Your Child →
                </a>
                <a href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold px-8 py-4 text-base transition-colors">
                  Sign In
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-t from-white dark:from-slate-900 sm:h-32" />
      </section>

      {/* Program Journey — timeline layout */}
      <section id="about" className="bg-white dark:bg-slate-900 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="section-label mb-3">The Journey</p>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              How Character Grows Over Time
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
              From day one, students start building a record of who they are — and who they&apos;re becoming.
            </p>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 overflow-hidden lg:mx-0 lg:max-w-none lg:grid-cols-4">
            {[
              { date: 'Week 1', dateTime: 'week-1', name: 'Enroll & Begin', desc: 'Create your living resume. Introduce yourself to the community. Your story starts here.' },
              { date: 'Months 1–3', dateTime: 'months-1-3', name: 'Earn Your Skills', desc: 'Document real accomplishments, earn skill badges, and start contributing to community projects.' },
              { date: 'Months 4–6', dateTime: 'months-4-6', name: 'Lead & Impact', desc: 'Take ownership of initiatives, mentor peers, and build a visible record of positive impact.' },
              { date: 'Ongoing', dateTime: 'ongoing', name: 'Career & College Ready', desc: 'Your living resume grows into a lifelong asset — ready for applications, internships, and employers.' },
            ].map((item) => (
              <div key={item.name}>
                <time
                  dateTime={item.dateTime}
                  className="flex items-center text-sm/6 font-semibold text-emerald-600 dark:text-emerald-400"
                >
                  <svg viewBox="0 0 4 4" aria-hidden="true" className="mr-4 size-1 flex-none">
                    <circle r={2} cx={2} cy={2} fill="currentColor" />
                  </svg>
                  {item.date}
                  <div
                    aria-hidden="true"
                    className="absolute -ml-2 h-px w-screen -translate-x-full bg-slate-900/10 dark:bg-white/10 sm:-ml-4 lg:static lg:-mr-6 lg:ml-8 lg:w-auto lg:flex-auto lg:translate-x-0"
                  />
                </time>
                <p className="mt-6 text-lg/8 font-bold tracking-tight text-slate-900 dark:text-white">{item.name}</p>
                <p className="mt-1 text-base/7 text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* What Kids Build — character-focused cards */}
      <section className="bg-white dark:bg-slate-900 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">The Program</p>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">What Kids Build &amp; Gain</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">Every session builds real character, real skills, and a permanent record that opens doors — in school, community, and careers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "🌱", title: "Character First", desc: "Every action builds integrity. Students learn that who you are matters more than what you have — and that reputation is built one choice at a time." },
              { icon: "🤝", title: "Meaningful Contribution", desc: "Real action through service projects and hands-on initiatives that make a measurable, lasting difference in the community." },
              { icon: "💚", title: "Positive Social Impact", desc: "Understanding how individual actions shape society and developing a deep ethic of care, equity, and responsibility toward others." },
              { icon: "🗣️", title: "Communication", desc: "Public speaking, active listening, and storytelling skills that help students advocate for themselves and lift up the people around them." },
              { icon: "🌐", title: "Community Networks", desc: "Building genuine relationships with peers, mentors, and community leaders that open doors and create lifelong bonds." },
              { icon: "🏆", title: "Earned Leadership", desc: "Students take real ownership of projects and mentor peers — developing leadership through accountability, not just title." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all group">
                <div className="text-3xl mb-4 select-none">{icon}</div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats — big numbers */}
      <section className="bg-slate-50 dark:bg-slate-800/40 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="section-label mb-3">Impact</p>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              We approach every session as a chance to make the world better
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Character is built gradually — through consistent positive actions, real accountability, and a community that cares.
            </p>
          </div>
          <div className="mx-auto mt-16 flex max-w-2xl flex-col gap-6 lg:mx-0 lg:mt-20 lg:max-w-none lg:flex-row lg:items-end">
            <div className="flex flex-col-reverse justify-between gap-x-16 gap-y-8 rounded-2xl bg-slate-50 dark:bg-white/5 dark:ring-1 dark:ring-inset dark:ring-white/10 p-8 sm:w-3/4 sm:max-w-md sm:flex-row-reverse sm:items-end lg:w-72 lg:max-w-none lg:flex-none lg:flex-col lg:items-start border border-slate-200 dark:border-slate-700">
              <p className="flex-none text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">3 Pillars</p>
              <div className="sm:w-80 sm:shrink lg:w-auto lg:flex-none">
                <p className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Education · Health · Housing</p>
                <p className="mt-2 text-base/7 text-slate-600 dark:text-slate-300">Every tip goes directly into one of three community impact funds — fully transparent.</p>
              </div>
            </div>
            <div className="flex flex-col-reverse justify-between gap-x-16 gap-y-8 rounded-2xl bg-slate-900 dark:bg-slate-800 p-8 sm:flex-row-reverse sm:items-end lg:w-full lg:max-w-sm lg:flex-auto lg:flex-col lg:items-start lg:gap-y-36 dark:ring-1 dark:ring-inset dark:ring-white/10">
              <p className="flex-none text-3xl font-extrabold tracking-tight text-white">Living Resumes</p>
              <div className="sm:w-80 sm:shrink lg:w-auto lg:flex-none">
                <p className="text-lg font-semibold tracking-tight text-white">Every student&apos;s journey — documented from day one.</p>
                <p className="mt-2 text-base/7 text-slate-400">Skills, accomplishments, community endorsements and academic records all in one beautiful profile.</p>
              </div>
            </div>
            <div className="flex flex-col-reverse justify-between gap-x-16 gap-y-8 rounded-2xl bg-emerald-600 p-8 sm:w-11/12 sm:max-w-xl sm:flex-row-reverse sm:items-end lg:w-full lg:max-w-none lg:flex-auto lg:flex-col lg:items-start lg:gap-y-28 dark:ring-1 dark:ring-inset dark:ring-white/10">
              <p className="flex-none text-3xl font-extrabold tracking-tight text-white">Lifelong Asset</p>
              <div className="sm:w-80 sm:shrink lg:w-auto lg:flex-none">
                <p className="text-lg font-semibold tracking-tight text-white">The resume that grows with them — forever.</p>
                <p className="mt-2 text-base/7 text-emerald-100">College applications. Internships. First jobs. Every milestone captured and ready to share.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Living Resume Feature — dark showcase card */}
      <section className="bg-white dark:bg-slate-900 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl bg-slate-900 overflow-hidden shadow-2xl flex flex-col lg:flex-row">
            <div className="flex-1 px-10 py-14 lg:py-16">
              <p className="section-label text-emerald-400 mb-4">Signature Feature</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-5">
                Their Own Living Resume —<br />Built by Them, for Life.
              </h2>
              <p className="text-slate-300 text-base leading-relaxed mb-4">
                Every student builds a living, interactive online resume from the very start of the program.
                Skills, projects, community service, and achievements all flow in automatically — documented in real time.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                This isn&apos;t a one-time assignment. It&apos;s a lifelong professional asset — ready for college applications, internships, and careers.
              </p>
              <a href="/register" className="inline-flex mt-8 items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 text-sm transition-colors shadow-lg shadow-emerald-900/30">
                Start Building Theirs →
              </a>
            </div>
            <div className="shrink-0 lg:w-72 px-8 py-10 bg-slate-800 flex flex-col justify-center gap-3">
              {[
                { icon: "📄", text: "Built online from day one" },
                { icon: "📈", text: "Grows with every skill earned" },
                { icon: "💬", text: "Community endorsements build trust" },
                { icon: "🎓", text: "Ready for college & careers" },
                { icon: "♾️", text: "A lifelong professional asset" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 rounded-xl bg-slate-700/60 border border-slate-700 px-4 py-3">
                  <span className="text-xl select-none">{icon}</span>
                  <span className="text-sm font-medium text-slate-200">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Where Funds Go */}
      <section className="bg-slate-50 dark:bg-slate-800/40 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Transparency</p>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Where Every Dollar Goes</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">All community tips flow directly into three pillars of lasting change — fully transparent, zero overhead confusion.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "📚", title: "Education", topColor: "border-t-emerald-500", desc: "Scholarships, school supplies, tutoring programs, and educational resources for underserved youth who deserve every opportunity." },
              { icon: "🏠", title: "Housing", topColor: "border-t-teal-500", desc: "Safe, stable housing through shelters, affordable housing initiatives, and transitional support for families in need." },
              { icon: "❤️", title: "Health & Wellness", topColor: "border-t-cyan-500", desc: "Equitable healthcare access, mental wellness resources, and sustainable practices that protect people and communities." },
            ].map(({ icon, title, topColor, desc }) => (
              <div key={title} className={`rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-t-4 ${topColor} p-8 shadow-sm hover:shadow-md transition-shadow`}>
                <div className="text-4xl mb-4 select-none">{icon}</div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — dark */}
      <section className="bg-slate-900 dark:bg-slate-950 px-6 py-24 text-center">
        <div className="relative isolate overflow-hidden mx-auto max-w-3xl">
          <p className="section-label text-emerald-400 mb-4">Get Started Today</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Invest in Who They&apos;re Becoming
          </h2>
          <p className="text-slate-300 mb-10 text-xl max-w-2xl mx-auto leading-relaxed">
            Character built through community engagement, documented through a living resume, and carried for a lifetime.
            Spots are limited — enroll your child today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="inline-flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-10 py-4 text-base transition-colors shadow-lg shadow-emerald-900/40">
              Enroll Your Child Now →
            </a>
            <a href="#about" className="inline-flex items-center justify-center rounded-xl border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white font-semibold px-10 py-4 text-base transition-colors">
              Learn More ↓
            </a>
          </div>
        </div>
      </section>

      </>)}

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800">
        <div className="mx-auto max-w-5xl px-6 pb-8 pt-16 sm:pt-20">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="xl:col-span-1">
              <div className="flex items-center gap-2.5 font-extrabold text-white text-base mb-4">
                <span className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-sm select-none">💡</span>
                Good Deeds
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                Building character, community, and futures — one documented good deed at a time.
              </p>
              <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                <span className="text-slate-300 font-semibold">Von Der Becke Academy Corp</span><br />
                <span className="text-emerald-500">501(c)(3) Educational Facility</span> · EIN 46-1005883
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm/6 font-semibold text-white">Program</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {[
                      { name: 'How It Works', href: '#about' },
                      { name: 'Enroll Your Child', href: '/register' },
                      { name: 'For Employers', href: '#' },
                    ].map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-sm/6 text-slate-400 hover:text-emerald-400 transition-colors">{item.name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm/6 font-semibold text-white">Impact</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {[
                      { name: 'Education Fund', href: '#' },
                      { name: 'Housing Fund', href: '#' },
                      { name: 'Health Fund', href: '#' },
                    ].map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-sm/6 text-slate-400 hover:text-emerald-400 transition-colors">{item.name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm/6 font-semibold text-white">Account</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {[
                      { name: 'Sign In', href: '/login' },
                      { name: 'Register', href: '/register' },
                      { name: 'Dashboard', href: '/dashboard' },
                    ].map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-sm/6 text-slate-400 hover:text-emerald-400 transition-colors">{item.name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm/6 font-semibold text-white">Legal</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {[
                      { name: 'Privacy Policy', href: '#' },
                      { name: 'Terms of Service', href: '#' },
                    ].map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-sm/6 text-slate-400 hover:text-emerald-400 transition-colors">{item.name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 border-t border-slate-800 pt-8 sm:mt-20 flex flex-col sm:flex-row items-center justify-between gap-4 lg:mt-24">
            <p className="text-xs/6 text-slate-500">
              &copy; {new Date().getFullYear()} The Good Deeds · Von Der Becke Academy Corp. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
