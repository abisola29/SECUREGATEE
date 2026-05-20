'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import Spinner from '@/components/ui/spinner'

interface VerifyEmailCardProps {
  token: string
}

export default function VerifyEmailCard({ token }: VerifyEmailCardProps): React.ReactElement {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function verify() {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data: { success: boolean; error?: string } = await res.json()

        if (!active) return

        if (!data.success) {
          setStatus('error')
          setError(data.error ?? 'Verification failed.')
          return
        }

        setStatus('success')
      } catch {
        if (!active) return
        setStatus('error')
        setError('Something went wrong. Please try again later.')
      }
    }

    verify()

    return () => {
      active = false
    }
  }, [token])

  return (
    <div className="flex flex-col gap-5 text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Spinner />
          <p className="text-zinc-400 text-sm">Verifying your email address...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col gap-6 py-4">
          <div className="rounded-lg bg-emerald-950 border border-emerald-800 px-4 py-3">
            <p className="auth-success" role="alert" aria-live="polite">
              Your email has been successfully verified!
            </p>
          </div>
          <Link href="/login" className="auth-btn flex items-center justify-center">
            Sign In
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col gap-6 py-4">
          <div className="rounded-lg bg-red-950 border border-red-800 px-4 py-3">
            <p className="auth-error" role="alert" aria-live="polite">
              {error}
            </p>
          </div>
          <Link href="/login" className="auth-link">
            Back to login
          </Link>
        </div>
      )}
    </div>
  )
}
