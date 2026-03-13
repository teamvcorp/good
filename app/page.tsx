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
          Connecting kids, building community, and driving positive change.
        </p>

        <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
          The Good Deeds is an after-school and weekend initiative that empowers
          kids through networking, meaningful contribution, and positive social impact. Students develop
          the relationships, values, and skills needed to become confident, compassionate leaders.
          Every milestone lives inside a <span className="font-semibold text-emerald-600 dark:text-emerald-400">personal interactive resume</span> that
          grows with them from day one through adulthood.
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
                icon: "🌐",
                title: "Networking",
                desc: "Building genuine relationships — with peers, mentors, and community leaders — that open doors and create lasting bonds.",
              },
              {
                icon: "🤝",
                title: "Meaningful Contribution",
                desc: "Taking real action in the community through service projects, collaboration, and hands-on initiatives that make a difference.",
              },
              {
                icon: "💚",
                title: "Positive Social Impact",
                desc: "Understanding how individual actions shape society and developing an ethic of care, equity, and responsibility.",
              },
              {
                icon: "🗣️",
                title: "Communication",
                desc: "Public speaking, active listening, and storytelling skills that help students advocate for themselves and others.",
              },
              {
                icon: "🌟",
                title: "Soft Skills",
                desc: "Teamwork, empathy, creative thinking, and conflict resolution — the human skills that define great leaders.",
              },
              {
                icon: "🏆",
                title: "Leadership",
                desc: "Students take ownership of service projects and mentor peers, building real-world leadership experience from the ground up.",
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

      {/* Interactive Resume Feature */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-500 dark:from-emerald-700 dark:to-teal-600 p-1 shadow-xl shadow-emerald-300/30 dark:shadow-emerald-900/50">
            <div className="rounded-[calc(1.5rem-4px)] bg-white dark:bg-gray-950 px-8 py-12 sm:px-14 flex flex-col lg:flex-row items-center gap-10">
              {/* Left: text */}
              <div className="flex-1 text-center lg:text-left">
                <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-widest uppercase px-4 py-1.5 mb-5">
                  Signature Feature
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-800 dark:text-emerald-200 leading-tight mb-4">
                  Their Own Interactive Resume — Built by Them, for Life.
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed mb-6">
                  Every student builds a living, interactive online resume from the very start of the program.
                  As they learn to code, complete projects, and serve their community, their resume grows
                  automatically — documenting skills, achievements, and contributions in real time.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                  This isn&apos;t a one-time assignment. It&apos;s a lifelong professional asset —
                  ready for college applications, internships, jobs, and beyond.
                </p>
              </div>
              {/* Right: highlights */}
              <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 w-full lg:w-64">
                {[
                  { icon: "📄", text: "Built online from day one" },
                  { icon: "📈", text: "Grows with every skill earned" },
                  { icon: "🎓", text: "Ready for college & careers" },
                  { icon: "♾️", text: "A lifelong professional asset" },
                ].map(({ icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 px-4 py-3"
                  >
                    <span className="text-2xl select-none">{icon}</span>
                    <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Where Funds Go */}
      <section className="px-6 py-16 bg-white/60 dark:bg-black/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-emerald-800 dark:text-emerald-200 mb-4">
            Where Every Dollar Goes
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            All funds generated by The Good Deeds are channeled directly into three pillars of lasting community change.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: "📚",
                title: "Education",
                color: "from-emerald-500 to-teal-400",
                desc: "Expanding access to quality learning — scholarships, school supplies, tutoring programs, and educational resources for underserved youth.",
              },
              {
                icon: "🏠",
                title: "Housing",
                color: "from-teal-500 to-cyan-400",
                desc: "Supporting stable, safe housing through partnerships with shelters, affordable housing initiatives, and transitional support programs.",
              },
              {
                icon: "❤️",
                title: "Health Equality & Sustainability",
                color: "from-cyan-500 to-emerald-400",
                desc: "Promoting equitable access to healthcare, mental wellness resources, and sustainable practices that protect people and the planet.",
              },
            ].map(({ icon, title, color, desc }) => (
              <div
                key={title}
                className="rounded-2xl bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-900 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl mb-5 shadow-md select-none`}>
                  {icon}
                </div>
                <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-3">
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
