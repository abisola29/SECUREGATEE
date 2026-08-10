# SKILL: API Route Scaffolder

## Purpose

Use this skill whenever you need to scaffold a new API route for SecureGate. Every route in this project follows a strict pattern — Zod validation first, rate limiting where required, generic error messages always, and no information leaked to the client.

---

## Before You Build — Read These First

- `.agents/rules/security.md` — error messages, rate limiting, token rules, password rules
- `.agents/rules/code-style.md` — TypeScript patterns, import order, API route structure
- `.agents/rules/architecture.md` — where routes live, Prisma usage, library imports

---

## Route Registry

All SecureGate API routes and their security requirements:

| Route | Method | Rate Limited | Auth Required | Zod Required |
|---|---|---|---|---|
| `/api/auth/signup` | POST | No | No | Yes |
| `/api/auth/[...nextauth]` | POST/GET | Yes (login) | No | Handled by NextAuth |
| `/api/auth/verify-email` | GET | No | No | No (token from URL) |
| `/api/auth/forgot-password` | POST | Yes | No | Yes |
| `/api/auth/reset-password` | POST | No | No | Yes |

---

## Scaffolding Checklist

Before writing any route code, answer all of these:

- [ ] What is the HTTP method? → only handle the correct method, return 405 for others
- [ ] Does this route require rate limiting? → check the registry above
- [ ] What is the Zod schema for the request body?
- [ ] What DB models does this route touch?
- [ ] What are the possible error states? → map each to a generic message
- [ ] What does the success response look like?
- [ ] Does this route involve a token? → check expiry, delete after use
- [ ] Does this route involve a password? → hash with bcrypt at salt rounds 12

---

## Base Route Template

```ts
// app/api/auth/[route-name]/route.ts
// [One-line description of what this route does]

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

// Define Zod schema — import from lib/validations/ if shared
const requestSchema = z.object({
  // define fields here
})

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await req.json()
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input.' },
        { status: 400 }
      )
    }

    // 2. Business logic here
    // ...

    // 3. Return success
    return NextResponse.json(
      { success: true, message: 'Action completed successfully.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[ROUTE_NAME]', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
```

---

## Rate-Limited Route Template

```ts
// app/api/auth/[route-name]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

const requestSchema = z.object({
  // fields here
})

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limit check — before any DB query
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success: withinLimit, resetIn } = await rateLimit(ip)

    if (!withinLimit) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many attempts. Please try again in ${resetIn} minutes.`,
        },
        { status: 429 }
      )
    }

    // 2. Parse and validate
    const body = await req.json()
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input.' },
        { status: 400 }
      )
    }

    // 3. Business logic here
    // ...

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

---

## Token Handling Template

For routes that validate a token (verification, reset):

```ts
// Step-by-step token validation pattern
const tokenRecord = await prisma.verificationToken.findUnique({
  where: { token: parsed.data.token },
})

// 1. Check existence
if (!tokenRecord) {
  return NextResponse.json(
    { success: false, error: 'This link is invalid or has already been used.' },
    { status: 400 }
  )
}

// 2. Check expiry
if (tokenRecord.expires < new Date()) {
  return NextResponse.json(
    { success: false, error: 'This link has expired. Request a new one.' },
    { status: 400 }
  )
}

// 3. Perform the action
await prisma.user.update({
  where: { email: tokenRecord.identifier },
  data: { emailVerified: new Date() },
})

// 4. Delete the token — always, immediately after use
await prisma.verificationToken.delete({
  where: { token: parsed.data.token },
})
```

---

## Sign-Up Route — Full Reference

```ts
// app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/mail'

const BCRYPT_SALT_ROUNDS = 12
const VERIFICATION_TOKEN_EXPIRY_MS = 15 * 60 * 1000

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = signUpSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input.' },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    // Check for existing user — return generic error
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    // Hash password immediately
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)

    // Save user — emailVerified is null until verified
    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    })

    // Generate and store verification token
    const token = crypto.randomBytes(32).toString('hex')
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
      },
    })

    // Send verification email
    await sendVerificationEmail(email, token)

    return NextResponse.json(
      { success: true, message: 'Account created. Check your email to verify your account.' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[SIGNUP]', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
```

---

