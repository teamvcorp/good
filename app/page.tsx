export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-gray-950 dark:via-emerald-950 dark:to-teal-900 text-gray-900 dark:text-gray-100">

      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 px-6 pt-20 pb-16 text-center">
        {/* Logo mark */}
        <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-300/40 dark:shadow-emerald-900/60 text-4xl select-none">
          💡
        </div>

        {/* Live badge */}
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 tracking-widest uppercase mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Now Live — After School &amp; Weekends
        </span>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-emerald-800 dark:text-emerald-200 leading-tight max-w-3xl">
          The Good Deeds
        </h1>

        <p className="mt-5 text-xl sm:text-2xl font-medium text-teal-700 dark:text-teal-300 max-w-xl">
          Teaching kids to code, connect, and give back.
        </p>

        <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
          The Good Deeds is an after-school and weekend initiative that introduces
          kids to computer coding, networking, and community service. Students build
          real-world hard and soft skills — and grow into confident leaders along the way.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:info@thegooddeeds.org"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold px-8 py-3.5 text-base transition-colors shadow-md shadow-emerald-400/30"
          >
            Get Involved
          </a>
          <a
            href="#about"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-semibold px-8 py-3.5 text-base transition-colors"
          >
            Learn More ↓
          </a>
        </div>
      </section>

      {/* What We Offer */}
      <section id="about" className="px-6 py-16 bg-white/60 dark:bg-black/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-emerald-800 dark:text-emerald-200 mb-12">
            What Kids Learn &amp; Gain
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "💻",
                title: "Computer Coding",
                desc: "Hands-on coding fundamentals — from logic and algorithms to building real projects.",
              },
              {
                icon: "🌐",
                title: "Networking Basics",
                desc: "How the internet works, digital communication, and building a professional presence.",
              },
              {
                icon: "🤝",
                title: "Community Impact",
                desc: "Using technology as a tool for positive change and giving back to the community.",
              },
              {
                icon: "🧠",
                title: "Hard Skills",
                desc: "Problem-solving, debugging, project management, and technical literacy.",
              },
              {
                icon: "🌟",
                title: "Soft Skills",
                desc: "Teamwork, communication, public speaking, and creative thinking.",
              },
              {
                icon: "🏆",
                title: "Leadership",
                desc: "Students take ownership of projects and mentor peers, building real leadership experience.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-900 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-3 select-none">{icon}</div>
                <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Details banner */}
      <section className="px-6 py-14 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-emerald-800 dark:text-emerald-200 mb-4">
            Ready to Join?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-base sm:text-lg">
            Our after-school and weekend sessions are open now. Spots are limited —
            reach out today to secure your child&apos;s place.
          </p>
          <a
            href="mailto:info@thegooddeeds.org"
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-10 py-4 text-base transition-colors shadow-md shadow-emerald-400/30"
          >
            Contact Us
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-gray-400 dark:text-gray-600 border-t border-emerald-100 dark:border-emerald-900/40">
        &copy; {new Date().getFullYear()} The Good Deeds. All rights reserved.
      </footer>
    </main>
  );
}
