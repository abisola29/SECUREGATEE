# SKILL: Component Builder

## Purpose

Use this skill whenever you need to scaffold a new React component for SecureGate. It enforces the design system, accessibility rules, and code style standards defined in `.agents/rules/` before a single line of code is written.

---

## Before You Build — Read These First

- `.agents/rules/design-system.md` — colours, typography, spacing, component patterns
- `.agents/rules/code-style.md` — TypeScript rules, import order, naming conventions
- `.agents/rules/architecture.md` — where the component lives, Server vs Client boundary

---

## Component Types

### UI Components — `components/ui/`
Stateless, reusable, purely presentational. Accept props. No internal state. No API calls.

Examples: `Button`, `Input`, `Label`, `FormError`, `Spinner`, `SuccessBanner`

### Auth Components — `components/auth/`
Form-specific components with local state and submission logic.

Examples: `SignUpForm`, `LoginForm`, `ForgotPasswordForm`, `PasswordStrengthIndicator`, `ResetPasswordForm`

---

## Scaffolding Checklist

Before generating a component, answer all of these:

- [ ] Is it a UI component or an Auth component? → determines which folder it lives in
- [ ] Does it need state or browser APIs? → if yes, add `'use client'` at the top
- [ ] Does it have input fields? → every field needs a `<label>` with matching `htmlFor`
- [ ] Does it have a submit button? → it needs a loading state and disabled state
- [ ] Does it show errors? → use `role="alert"` and `aria-live="polite"` on error elements
- [ ] Is it a form? → it must preserve input values on error (do not reset the form)

---

## Component Template — Auth Form

```tsx
'use client'

import { useState } from 'react'
import { z } from 'zod'

// Define the schema inline or import from lib/validations/
const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormData = z.infer<typeof schema>
type FormErrors = Partial<Record<keyof FormData, string>>

export function ExampleForm() {
  const [values, setValues] = useState<FormData>({ email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')

    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: FormErrors = {}
      parsed.error.errors.forEach(err => {
        const field = err.path[0] as keyof FormData
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const data = await res.json()
      if (!data.success) {
        setServerError(data.error || 'Something went wrong. Please try again later.')
        return
      }
      setSuccess(true)
    } catch {
      setServerError('Something went wrong. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-lg bg-emerald-950 border border-emerald-800 px-4 py-3">
        <p className="text-sm text-emerald-400">Success message here.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {serverError && (
        <p className="text-sm text-red-400" role="alert" aria-live="polite">
          {serverError}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-300">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5
                     text-sm text-zinc-50 placeholder:text-zinc-500
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-red-400" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold
                   text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                   focus:ring-offset-zinc-900 transition-colors duration-150 min-h-[44px]"
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4 text-white mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          'Submit'
        )}
      </button>
    </form>
  )
}
```

---

## Password Strength Indicator Template

```tsx
'use client'

interface PasswordStrengthProps {
  password: string
}

function getStrength(password: string): { level: number; label: string } {
  if (password.length < 8) return { level: 1, label: 'Weak' }
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  if ((hasUpper || hasLower) && hasNumber && hasSpecial) return { level: 3, label: 'Strong' }
  if ((hasUpper || hasLower) && (hasNumber || hasSpecial)) return { level: 2, label: 'Fair' }
  return { level: 1, label: 'Weak' }
}

const barColour: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-amber-500',
  3: 'bg-emerald-500',
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthProps) {
  if (!password) return null
  const { level, label } = getStrength(password)

  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i <= level ? barColour[level] : 'bg-zinc-700'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-zinc-400 mt-1">{label}</p>
    </div>
  )
}
```

---

## Output Format

When this skill is used, produce:

1. The component file at the correct path
2. A one-line comment at the top of the file describing what it does
3. All imports in the correct order (see `code-style.md`)
4. No unused imports, no `any` types, no missing prop types