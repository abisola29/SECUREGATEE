import Link from 'next/link'

export default function HomePage(): React.ReactElement {
  return (
    <div className="h-screen bg-zinc-950 flex flex-col justify-between overflow-hidden">
      {/* Navigation */}
      <nav className="w-full bg-zinc-950/80 backdrop-blur-xl">
        <div className="w-full flex items-center justify-between py-5" style={{ paddingLeft: '40px', paddingRight: '40px' }}>
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
      <section className="relative flex-1 flex flex-col items-center justify-center px-6">
        {/* Gradient Orb */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
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
              Get Started
            </Link>
          </div>
        </div>
      </section>


    </div>
  )
}
