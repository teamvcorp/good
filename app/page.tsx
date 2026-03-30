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

      {/* Hero — dark */}
      <section className="bg-slate-900 dark:bg-slate-950 text-white px-6 pt-24 pb-28 flex flex-col items-center text-center">
        <p className="section-label text-emerald-400 mb-4">After-School &amp; Weekends</p>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl">
          The Next Generation<br />
          <span className="text-emerald-400">Living Resume</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
          Connecting kids, building community, and driving positive change — one documented milestone at a time.
        </p>
        <p className="mt-3 text-xs text-slate-400 tracking-wide">
          A{' '}<span className="text-slate-300 font-medium">Von Der Becke Academy Corp</span>{' '}Initiative &mdash;{' '}
          <span className="text-emerald-500">501(c)(3) Educational Nonprofit</span>
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <a href="/register" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-4 text-base transition-colors shadow-lg shadow-emerald-900/40">
            Enroll Your Child →
          </a>
          <a href="/login" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white font-semibold px-8 py-4 text-base transition-colors">
            Sign In
          </a>
          <a href="#about" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 font-semibold px-8 py-4 text-base transition-colors">
            Learn More ↓
          </a>
        </div>
        <div className="mt-8 inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-700/60 rounded-full px-4 py-1.5 text-xs font-semibold text-emerald-400 tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Now enrolling
        </div>
      </section>

      {/* What Kids Learn */}
      <section id="about" className="bg-white dark:bg-slate-900 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Program</p>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">What Kids Learn &amp; Gain</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Every session builds real-world skills that open doors in school, community, and careers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "🌐", title: "Networking", desc: "Building genuine relationships with peers, mentors, and community leaders that open doors and create lasting bonds." },
              { icon: "🤝", title: "Meaningful Contribution", desc: "Real action through service projects and hands-on initiatives that make a measurable community difference." },
              { icon: "💚", title: "Positive Social Impact", desc: "Understanding how individual actions shape society and developing an ethic of care, equity, and responsibility." },
              { icon: "🗣️", title: "Communication", desc: "Public speaking, active listening, and storytelling skills that help students advocate for themselves and others." },
              { icon: "🌟", title: "Soft Skills", desc: "Teamwork, empathy, creative thinking, and conflict resolution — the human skills that define great leaders." },
              { icon: "🏆", title: "Leadership", desc: "Students take ownership of service projects and mentor peers, building real-world leadership experience from day one." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all">
                <div className="text-3xl mb-4 select-none">{icon}</div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Resume Feature — dark card */}
      <section className="bg-slate-50 dark:bg-slate-800/30 px-6 py-20">
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
              <a href="/register" className="inline-flex mt-8 items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 text-sm transition-colors">
                Start Building Theirs →
              </a>
            </div>
            <div className="shrink-0 lg:w-72 px-8 py-10 bg-slate-800 flex flex-col justify-center gap-3">
              {[
                { icon: "📄", text: "Built online from day one" },
                { icon: "📈", text: "Grows with every skill earned" },
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
      <section className="bg-white dark:bg-slate-900 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Impact</p>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">Where Every Dollar Goes</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">All funds flow directly into three pillars of lasting community change — fully transparent.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "📚", title: "Education", topColor: "border-t-emerald-500", desc: "Scholarships, school supplies, tutoring programs, and educational resources for underserved youth." },
              { icon: "🏠", title: "Housing", topColor: "border-t-teal-500", desc: "Safe, stable housing through shelters, affordable housing initiatives, and transitional support programs." },
              { icon: "❤️", title: "Health & Sustainability", topColor: "border-t-cyan-500", desc: "Equitable healthcare access, mental wellness resources, and sustainable practices that protect people and planet." },
            ].map(({ icon, title, topColor, desc }) => (
              <div key={title} className={`rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-t-4 ${topColor} p-8 shadow-sm hover:shadow-md transition-shadow`}>
                <div className="text-4xl mb-4 select-none">{icon}</div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — dark */}
      <section className="bg-slate-900 dark:bg-slate-950 px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="section-label text-emerald-400 mb-4">Get Started</p>
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to Join?</h2>
          <p className="text-slate-300 mb-10 text-lg max-w-xl mx-auto">
            Our after-school and weekend sessions are open now. Spots are limited — reach out today to secure your child&apos;s place.
          </p>
          <a href="/register" className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-10 py-4 text-base transition-colors shadow-lg shadow-emerald-900/40">
            Enroll Your Child Now →
          </a>
        </div>
      </section>

      </>)}

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 py-10 px-6 border-t border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-white font-bold">
            <span className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center text-sm select-none">💡</span>
            Good Deeds
          </div>
          <p className="text-xs text-slate-500 text-center">
            &copy; {new Date().getFullYear()} The Good Deeds. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <a href="/register" className="hover:text-emerald-400 transition-colors">Enroll</a>
            <a href="/login" className="hover:text-emerald-400 transition-colors">Sign In</a>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-6 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500 leading-relaxed">
            A project of{' '}
            <span className="text-slate-300 font-semibold">Von Der Becke Academy Corp</span>
            {' '}·{' '}
            <span className="text-emerald-500 font-medium">501(c)(3) Educational Facility</span>
            {' '}· EIN&nbsp;46-1005883
          </p>
        </div>
      </footer>
    </main>
  );
}
