import Link from 'next/link'

export default function HomePage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2" id="nav-logo">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-zinc-50">SecureGate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-50 transition-colors duration-150"
              id="nav-btn-login"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors duration-150"
              id="nav-btn-signup"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20">
        {/* Gradient Orb */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-700/50 bg-zinc-800/50 px-4 py-1.5 text-xs font-medium text-zinc-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Production-ready authentication
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-zinc-50 sm:text-6xl sm:leading-[1.1]">
            Auth that&apos;s built{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              for security
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
            A standalone authentication system with email verification, password
            reset, rate limiting, and role-based access — engineered for
            production from day one.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-indigo-600/30 transition-all duration-200"
              id="hero-cta-signup"
            >
              Start Building
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/50 px-8 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 transition-all duration-200"
              id="hero-cta-login"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="relative z-10 mx-auto mt-24 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              ),
              title: 'Bcrypt Hashing',
              desc: 'Passwords hashed with 12 salt rounds. No plain text, ever.',
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
              ),
              title: 'Email Verification',
              desc: 'Cryptographic tokens with 15-minute expiry. Single use.',
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              ),
              title: 'Rate Limiting',
              desc: '5 attempts per 10 minutes. Upstash Redis or in-memory fallback.',
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ),
              title: 'JWT Sessions',
              desc: '30-minute stateless sessions. HttpOnly, Secure, SameSite.',
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
              title: 'Access Control',
              desc: 'Middleware-enforced route protection. Verified users only.',
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              ),
              title: 'Zod Validation',
              desc: 'Server-side schema validation on every endpoint. No exceptions.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 group-hover:bg-indigo-600/20 transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-sm font-semibold text-zinc-50">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-24 pb-12 text-center">
          <p className="text-xs text-zinc-600">
            Built with Next.js 14, TypeScript, Prisma, NextAuth, and Tailwind CSS
          </p>
        </footer>
      </section>
    </div>
  )
}
