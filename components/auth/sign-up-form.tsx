'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Spinner from '@/components/ui/spinner'
import PasswordStrength from '@/components/auth/password-strength'
import { signUpSchema } from '@/lib/validations/auth'

export default function SignUpForm(): React.ReactElement {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError('')
    setSuccess('')
    setFieldErrors({})

    const parsed = signUpSchema.safeParse({ name, email, password })

    if (!parsed.success) {
      const errors: Record<string, string> = {}
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (typeof field === 'string') {
          errors[field] = issue.message
        }
      })
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data: { success: boolean; error?: string } = await res.json()

      if (!data.success) {
        setError(data.error ?? 'Something went wrong.')
        return
      }

      setSuccess('Account created! Check your email to verify your account.')
      setTimeout(() => router.push('/login'), 3000)
    } catch {
      setError('Something went wrong. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" id="signup-form">
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
        <label htmlFor="name" className="auth-label">
          Full name
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          className="auth-input"
          aria-describedby="name-error"
          disabled={isLoading}
          autoComplete="name"
        />
        {fieldErrors.name && (
          <p id="name-error" className="auth-error" role="alert" aria-live="polite">
            {fieldErrors.name}
          </p>
        )}
      </div>

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
          aria-describedby="email-error"
          disabled={isLoading}
          autoComplete="email"
        />
        {fieldErrors.email && (
          <p id="email-error" className="auth-error" role="alert" aria-live="polite">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="auth-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="auth-input"
          aria-describedby="password-error"
          disabled={isLoading}
          autoComplete="new-password"
        />
        <PasswordStrength password={password} />
        {fieldErrors.password && (
          <p id="password-error" className="auth-error" role="alert" aria-live="polite">
            {fieldErrors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="auth-btn mt-1"
        id="signup-submit"
      >
        {isLoading ? <Spinner /> : 'Create Account'}
      </button>

      <p className="text-center text-sm text-zinc-400">
        Already have an account?{' '}
        <Link href="/login" className="auth-link">
          Sign in
        </Link>
      </p>
    </form>
  )
}
