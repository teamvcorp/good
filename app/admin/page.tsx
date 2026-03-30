'use client';
import { useState, useEffect, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
interface KidAdmin {
  kidId: string;
  name: string;
  age: number;
  rank: string;
  program?: string;
  status: 'pending' | 'active' | 'inactive';
  expiresAt?: string;
  registrationPaid?: boolean;
  businessCardsPaid?: boolean;
  businessCardsOrdered?: boolean;
  communityFunds: { education: number; health: number; housing: number };
}

interface UserAdmin {
  id: string;
  username: string;
  parentName: string;
  parentAge: number;
  email?: string;
  phone?: string;
  address?: { street?: string; city?: string; state?: string; zip?: string };
  kids: KidAdmin[];
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
  active: 'bg-emerald-900/40 text-emerald-300 border-emerald-700',
  pending: 'bg-amber-900/40 text-amber-300 border-amber-700',
  inactive: 'bg-slate-800 text-slate-400 border-slate-700',
};

function kidFunds(kid: KidAdmin) {
  return (kid.communityFunds?.education ?? 0) +
    (kid.communityFunds?.health ?? 0) +
    (kid.communityFunds?.housing ?? 0);
}

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

// ── Small sub-components ───────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-slate-500 shrink-0 w-20">{label}:</span>
      <span className="text-slate-200 break-all">{value}</span>
    </div>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${
      ok
        ? 'border-emerald-700/60 text-emerald-400 bg-emerald-900/20'
        : 'border-slate-700 text-slate-500'
    }`}>
      {ok ? '✓' : '✗'} {label}
    </span>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function AdminPage() {
  /* ── auth state ── */
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  /* ── data state ── */
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ── reset-password state ── */
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPw, setNewPw] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // ── Login ──
  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoginLoading(false);
    if (res.ok) {
      setAuthed(true);
    } else {
      setLoginError('Invalid password.');
    }
  };

  const logout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setAuthed(false);
    setUsers([]);
    setPassword('');
  };

  // ── Load users after auth ──
  useEffect(() => {
    if (!authed) return;
    setDataLoading(true);
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => { setUsers(Array.isArray(d) ? d : []); setDataLoading(false); })
      .catch(() => setDataLoading(false));
  }, [authed]);

  // ── Search filter ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter((u) =>
      u.username.toLowerCase().includes(q) ||
      u.parentName.toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q) ||
      u.kids.some((k) => k.name.toLowerCase().includes(q) || k.kidId.toLowerCase().includes(q))
    );
  }, [users, search]);

  // ── Global stats ──
  const totalKids = users.reduce((s, u) => s + u.kids.length, 0);
  const activeKids = users.reduce((s, u) => s + u.kids.filter((k) => k.status === 'active').length, 0);
  const totalRaisedCents = users.reduce((s, u) => s + u.kids.reduce((ks, k) => ks + kidFunds(k), 0), 0);

  // ── Reset password ──
  const doReset = async (userId: string) => {
    if (newPw.length < 8) { setResetMsg('Minimum 8 characters.'); return; }
    setResetLoading(true);
    setResetMsg('');
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: newPw }),
    });
    setResetLoading(false);
    if (res.ok) {
      setResetMsg('Password updated!');
      setTimeout(() => { setResetUserId(null); setNewPw(''); setResetMsg(''); }, 1800);
    } else {
      const d = await res.json();
      setResetMsg(d.error ?? 'Failed.');
    }
  };

  // ══════════ LOGIN SCREEN ══════════
  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <form
          onSubmit={login}
          className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-8 space-y-5 shadow-2xl"
        >
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-sm text-slate-400">Good Deeds — Internal Dashboard</p>
          </div>
          {loginError && (
            <p className="text-sm text-red-400 text-center bg-red-950/40 border border-red-800 rounded-xl py-2">
              {loginError}
            </p>
          )}
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full rounded-xl border border-slate-600 bg-slate-800 text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 text-sm transition-colors"
          >
            {loginLoading ? 'Checking…' : 'Sign In'}
          </button>
        </form>
      </div>
    );
  }

  // ══════════ MAIN DASHBOARD ══════════
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Good Deeds Admin</h1>
          <p className="text-xs text-slate-500">Internal — do not share</p>
        </div>
        <button
          onClick={logout}
          className="text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg px-3 py-1.5 transition-colors"
        >
          Sign out
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Parent Accounts', value: users.length },
            { label: 'Students', value: totalKids },
            { label: 'Active Students', value: activeKids },
            { label: 'Total Raised', value: dollars(totalRaisedCents) },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          type="search"
          placeholder="Search by parent name, username, student name, or student ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
        />

        {/* User list */}
        {dataLoading ? (
          <p className="text-slate-400 text-sm text-center py-12">Loading accounts…</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-12">No accounts found.</p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">{filtered.length} account{filtered.length !== 1 ? 's' : ''}</p>
            {filtered.map((user) => {
              const isExpanded = expandedId === user.id;
              const userRaisedCents = user.kids.reduce((s, k) => s + kidFunds(k), 0);

              return (
                <div key={user.id} className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
                  {/* Clickable header row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : user.id)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center text-white font-bold text-sm shrink-0 select-none">
                        {user.parentName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{user.parentName}</p>
                        <p className="text-xs text-slate-400">
                          @{user.username} · {user.kids.length} student{user.kids.length !== 1 ? 's' : ''}
                          {user.email ? ` · ${user.email}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {userRaisedCents > 0 && (
                        <span className="text-xs text-emerald-400 font-medium hidden sm:block">
                          {dollars(userRaisedCents)} raised
                        </span>
                      )}
                      <span className="text-slate-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-slate-700/60 px-5 py-5 space-y-6">
                      {/* Parent info */}
                      <section>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Parent / Guardian</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                          <InfoRow label="Name" value={user.parentName} />
                          <InfoRow label="Age" value={String(user.parentAge)} />
                          <InfoRow label="Username" value={`@${user.username}`} />
                          <InfoRow label="Email" value={user.email || '—'} />
                          <InfoRow label="Phone" value={user.phone || '—'} />
                          <InfoRow label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
                          <InfoRow label="Updated" value={new Date(user.updatedAt).toLocaleDateString()} />
                          {user.address?.street && (
                            <InfoRow
                              label="Address"
                              value={`${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zip}`}
                            />
                          )}
                        </div>
                      </section>

                      {/* Students */}
                      <section>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Students</p>
                        {user.kids.length === 0 ? (
                          <p className="text-sm text-slate-500">No students added.</p>
                        ) : (
                          <div className="space-y-3">
                            {user.kids.map((kid) => {
                              const totalKidCents = kidFunds(kid);
                              const isExpired = kid.expiresAt ? new Date(kid.expiresAt) < new Date() : false;

                              return (
                                <div
                                  key={kid.kidId}
                                  className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3"
                                >
                                  {/* Kid name + status */}
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="font-semibold text-white">
                                        {kid.name}{' '}
                                        <span className="text-slate-400 font-normal text-sm">age {kid.age}</span>
                                      </p>
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        ID: {kid.kidId}
                                        {kid.rank ? ` · ${kid.rank}` : ''}
                                        {kid.program ? ` · ${kid.program}` : ''}
                                      </p>
                                    </div>
                                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold shrink-0 ${STATUS_STYLE[kid.status]}`}>
                                      {kid.status}
                                    </span>
                                  </div>

                                  {/* Payment / order badges */}
                                  <div className="flex flex-wrap gap-2">
                                    <Badge ok={!!kid.registrationPaid} label="Reg. paid" />
                                    <Badge ok={!!kid.businessCardsPaid} label="Cards paid" />
                                    <Badge ok={!!kid.businessCardsOrdered} label="Cards ordered" />
                                    {kid.expiresAt && (
                                      <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${
                                        isExpired
                                          ? 'border-red-700 text-red-400 bg-red-950/30'
                                          : 'border-slate-600 text-slate-400'
                                      }`}>
                                        {isExpired ? '⚠ Expired ' : 'Expires '}
                                        {new Date(kid.expiresAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>

                                  {/* Money raised by category */}
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1.5">Community funds raised</p>
                                    <div className="grid grid-cols-3 gap-2">
                                      {(['education', 'health', 'housing'] as const).map((cat) => (
                                        <div key={cat} className="bg-slate-900/70 rounded-lg px-2 py-2 text-center">
                                          <p className="text-emerald-400 font-bold text-sm">
                                            {dollars(kid.communityFunds?.[cat] ?? 0)}
                                          </p>
                                          <p className="text-slate-500 text-xs capitalize">{cat}</p>
                                        </div>
                                      ))}
                                    </div>
                                    {totalKidCents > 0 && (
                                      <p className="text-xs text-right text-slate-400 mt-1.5">
                                        Total:{' '}
                                        <span className="text-emerald-400 font-semibold">{dollars(totalKidCents)}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </section>

                      {/* Actions */}
                      <section className="pt-2 border-t border-slate-700/50">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Account Actions</p>
                        {resetUserId === user.id ? (
                          <div className="space-y-2">
                            <div className="flex gap-2 items-center">
                              <input
                                type="password"
                                placeholder="New password (min 8 chars)"
                                value={newPw}
                                onChange={(e) => setNewPw(e.target.value)}
                                className="flex-1 rounded-xl border border-slate-600 bg-slate-800 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
                              />
                              <button
                                onClick={() => doReset(user.id)}
                                disabled={resetLoading}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 transition-colors shrink-0"
                              >
                                {resetLoading ? '…' : 'Set'}
                              </button>
                              <button
                                onClick={() => { setResetUserId(null); setNewPw(''); setResetMsg(''); }}
                                className="text-slate-400 hover:text-white text-sm px-2 transition-colors shrink-0"
                              >
                                Cancel
                              </button>
                            </div>
                            {resetMsg && (
                              <p className={`text-xs px-1 ${resetMsg.includes('updated') ? 'text-emerald-400' : 'text-red-400'}`}>
                                {resetMsg}
                              </p>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => { setResetUserId(user.id); setNewPw(''); setResetMsg(''); }}
                            className="text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg px-3 py-1.5 transition-colors"
                          >
                            🔑 Reset password
                          </button>
                        )}
                      </section>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
