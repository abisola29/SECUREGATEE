---
trigger: always_on
---

# Architecture Rules — SecureGate

## Framework & Routing

- Use **Next.js 14 App Router** exclusively — no Pages Router
- All pages live under `app/` using folder-based routing
- Auth pages are grouped under `app/(auth)/` using a route group — this keeps them visually separated without affecting the URL
- The dashboard lives at `app/dashboard/page.tsx` — not inside the auth group
- All API routes live under `app/api/auth/` as `route.ts` files
- NextAuth handler lives at `app/api/auth/[...nextauth]/route.ts`

## Middleware

- `middleware.ts` lives at the project root — not inside `app/`
- Middleware runs on every request matching the protected routes config
- It must check two conditions before allowing access to `/dashboard`:
  1. A valid NextAuth session exists
  2. `session.user.emailVerified` is not null
- If either check fails, redirect to `/login`
- Middleware must never expose why access was denied — redirect silently

```ts
// middleware.ts — required matcher config
export const config = {
  matcher: ['/dashboard/:path*'],
}
```

## Library Structure

All shared logic lives in `lib/`:

| File | Purpose |
|---|---|
| `lib/prisma.ts` | Singleton Prisma client — prevents connection pool exhaustion |
| `lib/auth.ts` | NextAuth config — providers, session callbacks, JWT strategy |
| `lib/mail.ts` | Resend email sender — verification and reset email functions |
| `lib/rate-limit.ts` | Rate limiting logic — Upstash or in-memory fallback |
| `lib/validations/` | Zod schemas — one file per domain (auth.ts, password.ts) |

## Prisma

- Define all models in `prisma/schema.prisma` before running any migration
- Run `npx prisma migrate dev --name init` once all three models are defined
- Never run migrations piecemeal — schema drift causes hard-to-debug errors
- Use `lib/prisma.ts` as the single Prisma client instance across the app:

```ts
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma || new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Data Models

All four models must be defined in `schema.prisma`:

- `User` — core identity record
- `VerificationToken` — email verification (expires in 15 minutes)
- `PasswordResetToken` — password reset (expires in 1 hour)
- `Session` — optional DB session model if using database session strategy

## Session Strategy

- Use **JWT sessions** for MVP — stateless, no DB session table required
- Configure in `lib/auth.ts` under `session: { strategy: 'jwt' }`
- JWT access token validity: 30 minutes
- Session cookie: `HttpOnly`, `Secure`, `SameSite=Lax`

## Component Structure

```
components/
├── ui/          # Generic reusable UI: Button, Input, Label, FormError
└── auth/        # Auth-specific: SignUpForm, LoginForm, PasswordStrength
```

- `ui/` components are stateless and purely presentational
- `auth/` components contain form state and submission logic
- Never mix DB logic into components — all data fetching goes in Server Components or API routes

## Phase Order — Do Not Skip

1. Scaffold + DB Schema
2. Auth Core (NextAuth sign-up + login + protected dashboard)
3. Email Verification Flow
4. Forgot Password Flow
5. Rate Limiting + Security Hardening
6. UI Polish + Deployment

