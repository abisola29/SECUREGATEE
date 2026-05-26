# SecureGate Build Checklist

Welcome to the master Build Checklist for **SecureGate**. This document acts as the definitive roadmap and compliance verification tracker for the entire authentication engine, architecture, and UI.

---

## 📊 Implementation Progress Summary

* **Phase 1: Project Scaffold & Database Setup** — **100% Complete**
* **Phase 2: Core Authentication Engine** — **100% Complete**
* **Phase 3: Email Verification Flow** — **100% Complete**
* **Phase 4: Password Recovery (Forgot/Reset) Flow** — **100% Complete**
* **Phase 5: Rate Limiting & Hardening** — **100% Complete**
* **Phase 6: UI/UX Refinement & Accessibility** — **100% Complete**

---

## 🗂️ Core Architecture Verification

All mandatory files and folders have been verified to exist in the exact required layout:

| File / Folder Path | Status | Purpose |
| :--- | :---: | :--- |
| `prisma/schema.prisma` | ✅ | PostgreSQL schema with User, Verification, & PasswordReset models |
| `lib/prisma.ts` | ✅ | Singleton Prisma client (avoids connection pool exhaustion) |
| `lib/auth.ts` | ✅ | NextAuth configuration with stateless JWT session strategy |
| `lib/mail.ts` | ✅ | Custom transactional email gateway (integrated with Brevo API) |
| `lib/rate-limit.ts` | ✅ | Upstash Redis rate limiter with local in-memory sliding window fallback |
| `lib/validations/auth.ts` | ✅ | Centralized Zod schemas for signup, login, and recovery inputs |
| `middleware.ts` | ✅ | Root middleware protecting `/dashboard` (validating session + verified email) |
| `app/(auth)/login/page.tsx` | ✅ | Accessible, glassmorphic Credentials sign-in page |
| `app/(auth)/signup/page.tsx` | ✅ | Credentials registration page with real-time password strength meter |
| `app/(auth)/verify-email/[token]/page.tsx` | ✅ | Dynamic token verification landing and status portal |
| `app/(auth)/forgot-password/page.tsx` | ✅ | Password reset request form (protects against email enumeration) |
| `app/(auth)/reset-password/[token]/page.tsx` | ✅ | Secure password reset submission portal |
| `app/dashboard/page.tsx` | ✅ | Protected single-column SaaS administration panel |

---

## 📝 Phase-by-Phase Checklist

### Phase 1: Database & Model Definitions
- [x] Configure PostgreSQL datasource connection in `prisma/schema.prisma`
- [x] Create the **`User`** model mapping to PostgreSQL tables
- [x] Create the **`VerificationToken`** model with `expires` time constraint
- [x] Create the **`PasswordResetToken`** model with `expires` time constraint
- [x] Establish the Prisma Singleton in `lib/prisma.ts` to prevent hot-reloading pool leaks

### Phase 2: NextAuth Engine & Protected Core
- [x] Install and configure `next-auth` using App Router route handlers
- [x] Establish route handlers under `app/api/auth/[...nextauth]/route.ts`
- [x] Configure stateless **JWT session strategy** in `lib/auth.ts` with 30-minute expiration
- [x] Implement robust password hashing with **`bcryptjs` using 12 salt rounds**
- [x] Write `middleware.ts` at the root of the project matching `/dashboard/:path*`
- [x] Enforce silent redirect inside `middleware.ts` for unauthenticated or unverified users

### Phase 3: Email Verification Flow
- [x] Implement cryptographically random token generation using `crypto.randomBytes(32).toString('hex')`
- [x] Configure token duration to expire in exactly **15 minutes**
- [x] Set up Brevo mail service delivery function in `lib/mail.ts`
- [x] Build the server API route `/api/auth/verify-email` handling activation and validation
- [x] Implement dynamic email verification page under `app/(auth)/verify-email/[token]/page.tsx`
- [x] Implement single-use constraints: delete verification tokens immediately on success

### Phase 4: Forgot & Reset Password Flow
- [x] Build dynamic password reset token generator with a **1-hour expiration**
- [x] Configure `/api/auth/forgot-password` request route returning generic, non-revealing messages
- [x] Implement Brevo-based secure reset email template sending a dynamic hex token link
- [x] Create `/api/auth/reset-password` endpoint to validation and update target credentials
- [x] Verify tokens are deleted from the database in the same transaction as the password update
- [x] Enforce Zod validators for schema checking, capping length at 72 characters

### Phase 5: Rate Limiting & Hardening
- [x] Integrate sliding-window rate limit checks inside `/api/auth/login` and `/api/auth/forgot-password`
- [x] Setup `@upstash/ratelimit` with Redis server client configurations
- [x] Build local in-memory sliding window fallback inside `lib/rate-limit.ts`
- [x] Limit requests to exactly **5 attempts per IP per 10 minutes**
- [x] Enforce security headers inside `next.config.js` (X-Frame-Options, X-Content-Type-Options)

### Phase 6: Design System & UX Polish
- [x] Configure global dark theme palette in `tailwind.config.ts` using modern zinc tones
- [x] Build responsive auth card container layout (full page on mobile, card on desktop)
- [x] Build custom interactive **Password Strength Indicator** under `components/auth/password-strength.tsx`
- [x] Link all form inputs cleanly with accessible `<label>` attributes and aria-describedby references
- [x] Add inline spinner SVGs and disabled states to prevent double-submitting forms

---

## 🔒 Pre-Deployment Security Audit Checklist

Verify this list completely before making your first production deploy:

- [ ] **Hash Verification**: Double-check in the database GUI that passwords are saved strictly as bcrypt hashes, never in plaintext.
- [ ] **Secret Safety**: Check that `.env` and `.env.local` are both added to your `.gitignore` to prevent secret leakage.
- [ ] **Production Keys**: Ensure all production API keys (`DATABASE_URL`, `NEXTAUTH_SECRET`, `RESEND_API_KEY`/`BREVO_API_KEY`, `UPSTASH_REDIS_REST_URL`) are set inside your hosting platform's (e.g. Vercel) dashboard.
- [ ] **Error Integrity**: Test that login errors return a generic `"Invalid email or password"` rather than stating whether the email exists.
- [ ] **Token Expirations**: Verify code matches `15 * 60 * 1000` (15 mins) for verification tokens and `60 * 60 * 1000` (1 hour) for reset tokens.
- [ ] **Single-Use Verification**: Attempt to reuse a verification or password reset token to confirm that the API rejects it on subsequent tries.
- [ ] **Middleware Integrity**: Navigate to `/dashboard` directly in an incognito page to guarantee a silent, automatic redirect to `/login` occurs.
