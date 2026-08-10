'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'

import Spinner from '@/components/ui/spinner'

export default function SignOutButton(): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSignOut(): Promise<void> {
    setIsLoading(true)
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:text-zinc-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center gap-2"
    >
      {isLoading ? <Spinner /> : 'Sign Out'}
    </button>
  )
}
