import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import SignOutButton from '@/components/auth/sign-out-button'

export const metadata: Metadata = {
  title: 'Dashboard — SecureGate',
  description: 'Your SecureGate dashboard.',
}

export default async function DashboardPage(): Promise<React.ReactElement> {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !(session.user as { emailVerified?: Date | null }).emailVerified) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top Nav */}
      <nav className="border-b border-zinc-800 bg-zinc-900 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-zinc-50">SecureGate</span>
          </div>
          <SignOutButton />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-zinc-50">Dashboard</h1>
            <p className="text-sm text-zinc-400">Manage your secure environment and user details.</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
            <h2 className="text-lg font-medium text-zinc-200 mb-4">User Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Name</span>
                <span className="text-sm text-zinc-200">{session.user.name ?? 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-1.5 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Email</span>
                <span className="text-sm text-zinc-200">{session.user.email ?? 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
