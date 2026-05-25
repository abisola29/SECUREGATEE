import Link from 'next/link'

export default function HomePage(): React.ReactElement {
  return (
    <div className="h-screen bg-zinc-950 flex flex-col justify-center items-center px-6 relative overflow-hidden">
      {/* Subtle Background Radial Gradient */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />

      {/* Clean Minimal Portal Card */}
      <div className="w-full sm:max-w-md sm:rounded-2xl sm:border sm:border-zinc-800 bg-zinc-900 p-8 sm:p-10 shadow-2xl relative z-10 text-center">
        {/* Logo Symbol */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 mx-auto mb-6 shadow-lg shadow-indigo-600/20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 className="text-3xl font-semibold text-zinc-50 tracking-tight mb-2">
          SecureGate Portal
        </h1>
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          Welcome to the SecureGate authentication system. Access your dashboard or verify your account details.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            className="w-full min-h-[44px] inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors duration-150 shadow-md shadow-indigo-600/10"
            id="portal-btn-signup"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="w-full min-h-[44px] inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:text-zinc-50 transition-colors duration-150"
            id="portal-btn-login"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
