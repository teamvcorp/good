'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await signIn('credentials', {
      username: username.toLowerCase().trim(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError('Invalid username or password.');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50 dark:from-slate-950 dark:to-emerald-950 flex items-center justify-center p-4">
      {/* Decorative background */}
      <div aria-hidden="true" className="fixed inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white dark:bg-slate-900 shadow-xl ring-1 ring-emerald-50 dark:ring-white/5 sm:-mr-80 lg:-mr-96" />

      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30 select-none">
              💡
            </div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Good Deeds</span>
          </a>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome back</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to your family dashboard</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8">
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">Username</label>
              <input
                className={input}
                placeholder="your_username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">Password</label>
              <input
                className={input}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-6 py-3 text-sm transition-colors shadow-md shadow-emerald-600/20 mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            New here?{' '}
            <a href="/register" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              Enroll your child
            </a>
          </p>
        </div>

        <p className="mt-6 text-center">
          <a href="/" className="text-xs text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            ← Back to home
          </a>
        </p>
        <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
          <span className="font-medium text-slate-500 dark:text-slate-400">Von Der Becke Academy Corp</span>
          {' '}· 501(c)(3) · EIN 46-1005883
        </p>
      </div>
    </div>
  );
}

const input =
  'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';
