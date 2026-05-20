'use client'

import { useState } from 'react'
import Link from 'next/link'

import Spinner from '@/components/ui/spinner'
import { forgotPasswordSchema } from '@/lib/validations/auth'

export default function ForgotPasswordForm(): React.ReactElement {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError('')
    setSuccess('')

    const parsed = forgotPasswordSchema.safeParse({ email })

    if (!parsed.success) {
      setError('Enter a valid email address.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data: { success: boolean; message?: string; error?: string } = await res.json()

      if (!data.success) {
        setError(data.error ?? 'Something went wrong.')
        return
      }

      setSuccess(data.message ?? 'If this email exists, a link has been sent.')
    } catch {
      setError('Something went wrong. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" id="forgot-password-form">
      {error && (
        <div className="rounded-lg bg-red-950 border border-red-800 px-4 py-3">
          <p className="auth-error" role="alert" aria-live="polite">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-950 border border-emerald-800 px-4 py-3">
          <p className="auth-success" role="alert" aria-live="polite">{success}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="auth-label">
          Email address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="auth-input"
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="auth-btn mt-1"
        id="forgot-password-submit"
      >
        {isLoading ? <Spinner /> : 'Send Reset Link'}
      </button>

      <p className="text-center text-sm text-zinc-400">
        Remember your password?{' '}
        <Link href="/login" className="auth-link">
          Sign in
        </Link>
      </p>
    </form>
  )
}
