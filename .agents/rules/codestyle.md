---
trigger: always_on
---

# Code Style Rules — SecureGate

## Language

- **TypeScript strictly** — no `any`, no untyped function parameters
- Enable `strict: true` in `tsconfig.json`
- All function return types must be explicitly declared
- Use `interface` for object shapes, `type` for unions and primitives

## File & Folder Naming

- Folders: `kebab-case` — e.g. `forgot-password/`, `api-route-scaffolder/`
- Files: `kebab-case` — e.g. `rate-limit.ts`, `sign-up-form.tsx`
- React components: `PascalCase` for the component name, `kebab-case` for the file
- Zod schemas: suffix with `Schema` — e.g. `signUpSchema`, `resetPasswordSchema`

## Imports

- Use absolute imports via `@/` alias — configure in `tsconfig.json`
- Group imports in this order, with a blank line between each group:
  1. React and Next.js core
  2. Third-party libraries
  3. Internal `@/lib/` utilities
  4. Internal `@/components/`
  5. Types

```ts
// Correct import order
import { NextResponse } from 'next/server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/mail'

import type { ApiResponse } from '@/types'
```

## API Route Pattern

Every API route must follow this exact structure:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({ /* fields */ })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input.' },
        { status: 400 }
      )
    }

    // business logic here

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[ROUTE_NAME]', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
```

## Error Handling

- Always wrap API route bodies in `try/catch`
- Log errors server-side using `console.error('[ROUTE_NAME]', error)`
- Never return the raw error object to the client
- Use `safeParse` from Zod — never `parse` (throws on failure)
- Return `{ success: boolean, error?: string, data?: unknown }` consistently

## React Components

- Use **functional components** only — no class components
- Use `'use client'` only when state or browser APIs are required
- Prefer Server Components by default — add `'use client'` only when necessary
- Never fetch data directly inside a Client Component — use Server Components or API routes
- All form components must have:
  - Accessible `<label>` elements linked via `htmlFor`
  - Inline error messages beneath each field
  - A loading state on the submit button (disabled + spinner while pending)

```tsx
// Correct: accessible form field pattern
<div className="flex flex-col gap-1">
  <label htmlFor="email" className="text-sm font-medium">
    Email address
  </label>
  <input
    id="email"
    type="email"
    name="email"
    aria-describedby="email-error"
    className="..."
  />
  {errors.email && (
    <p id="email-error" className="text-sm text-red-500">
      {errors.email}
    </p>
  )}
</div>
```

## Zod Schemas

- Define schemas in `lib/validations/` — one file per domain
- Export schemas and their inferred types together:

```ts
// lib/validations/auth.ts
import { z } from 'zod'

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type SignUpInput = z.infer<typeof signUpSchema>
```

## Constants

- No magic strings or numbers in business logic
- Define token expiry durations as named constants:

```ts
export const VERIFICATION_TOKEN_EXPIRY_MS = 15 * 60 * 1000   // 15 minutes
export const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000          // 1 hour
export const BCRYPT_SALT_ROUNDS = 12
export const RATE_LIMIT_MAX = 5
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000           // 10 minutes
```

## Comments

- No inline comments explaining what code does — the code should be self-explanatory
- Use comments only to explain **why** a decision was made, not what it does
- Security-critical decisions must have a one-line comment explaining the reason:

```ts
// Generic message — do not reveal whether the email exists in the system
return NextResponse.json({ success: true, message: 'If this email exists, a link has been sent.' })
```