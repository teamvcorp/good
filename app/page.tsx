export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-900 px-6 text-center">
      {/* Icon */}
      <div className="mb-8 text-7xl select-none">🌱</div>

      {/* Brand */}
      <h1 className="text-5xl font-bold tracking-tight text-emerald-800 dark:text-emerald-200 sm:text-6xl">
        Good Deeds
      </h1>

      {/* Tagline */}
      <p className="mt-4 text-lg text-emerald-700 dark:text-emerald-300 max-w-md">
        Something good is coming. We&apos;re building a place to share, inspire,
        and celebrate acts of kindness.
      </p>

      {/* Divider */}
      <div className="mt-10 mb-10 w-16 h-1 rounded-full bg-emerald-400 dark:bg-emerald-600" />

      {/* Coming soon badge */}
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-200 dark:bg-emerald-800 px-5 py-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200 tracking-wide uppercase">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Coming Soon
      </span>

      {/* Footer */}
      <p className="mt-16 text-xs text-emerald-500 dark:text-emerald-600">
        &copy; {new Date().getFullYear()} Good Deeds. All rights reserved.
      </p>
    </main>
  );
}
