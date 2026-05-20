'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

import Spinner from '@/components/ui/spinner'
import { loginSchema } from '@/lib/validations/auth'

export default function LoginForm(): React.ReactElement {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const parsed = loginSchema.safeParse({ email, password })

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
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password.')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" id="login-form">
      {error && (
        <div className="rounded-lg bg-red-950 border border-red-800 px-4 py-3">
          <p className="auth-error" role="alert" aria-live="polite">{error}</p>
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
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <Link href="/forgot-password" className="auth-link text-xs">
            Forgot password?
          </Link>
        </div>
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
          autoComplete="current-password"
        />
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
        id="login-submit"
      >
        {isLoading ? <Spinner /> : 'Sign In'}
      </button>

      <p className="text-center text-sm text-zinc-400">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="auth-link">
          Create one
        </Link>
      </p>
    </form>
  )
}
