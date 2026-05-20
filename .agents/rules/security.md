---
trigger: always_on
---

# Security Rules — SecureGate

## The Core Principle

Security in SecureGate does not come from hiding implementation details. It comes from:

1. The mathematical strength of bcrypt hashing
2. The cryptographic randomness of token generation
3. The correct handling and storage of secrets
4. The design of error messages that reveal nothing

This is Kerckhoffs's Principle. Every agent building this system must internalise it.

---

## Password Rules

### Hashing
- Always use `bcrypt.hash(password, 12)` — salt rounds must be 12
- Never reduce salt rounds for performance — the slowness is the protection
- Never store, log, or transmit plain text passwords at any point in the flow
- Never compare passwords with `===` — always use `bcryptjs.compare()`

```ts
// Correct — hashing on sign up
const hashedPassword = await bcrypt.hash(parsed.data.password, 12)

// Correct — comparing on login
const isValid = await bcrypt.compare(inputPassword, user.password)
```

### Validation
- Minimum password length: 8 characters (enforced by Zod schema)
- Maximum password length: 72 characters (bcrypt silently truncates beyond this — enforce at schema level)
- Password strength indicator on the sign-up form is UI only — enforcement is server-side

---

## Token Rules

### Generation
- All tokens generated with `crypto.randomBytes(32).toString('hex')`
- This produces 64 hex characters — cryptographically random, not guessable
- Never use `Math.random()` or UUID libraries for security tokens

```ts
import crypto from 'crypto'
const token = crypto.randomBytes(32).toString('hex')
```

### Expiry
- Verification tokens: expire in **15 minutes** (`Date.now() + 15 * 60 * 1000`)
- Reset tokens: expire in **1 hour** (`Date.now() + 60 * 60 * 1000`)
- Always check `token.expires > new Date()` before accepting a token
- Expired tokens must be rejected with a clear error — never silently accepted

### Single Use
- Delete every token from the database immediately after it is used
- A used verification token must not work a second time
- A used reset token must not work a second time
- Deletion must happen in the same DB transaction as the action it unlocks

---

## Error Message Rules

Every error message shown to a user must be reviewed against this table:

| Scenario | Correct Message | What It Must Not Say |
|---|---|---|
| Wrong email or password | "Invalid email or password." | Which field was wrong |
| Email not found (forgot password) | "If this email exists, a link has been sent." | That the email does not exist |
| Expired token | "This link has expired. Request a new one." | When it expired or why |
| Invalid token | "This reset link is invalid or has already been used." | Whether it was used or never existed |
| Rate limit exceeded | "Too many attempts. Please try again in X minutes." | The IP or request count |
| Server error | "Something went wrong. Please try again later." | Stack trace, DB error, internal message |
| Duplicate email (sign up) | "An account with this email already exists." | Any other account details |

**Rule:** If an error message could help an attacker narrow down a guess, rewrite it to be more generic.

---

## Rate Limiting Rules

### Login Endpoint
- Maximum: **5 attempts per IP per 10 minutes**
- On breach: return HTTP 429 with `"Too many attempts. Please try again in X minutes."`
- Counter resets after the 10-minute window expires
- Rate limit applies even when the email does not exist in the system

### Forgot Password Endpoint
- Rate limited per IP — same logic as login
- Must be rate limited even though it always returns a success message
- Prevents abuse of the email sending infrastructure

### Implementation
- Use Upstash Redis with `@upstash/ratelimit` if available
- Fall back to an in-memory sliding window counter if Upstash is not configured
- Rate limit must run before any DB query — check IP first, query DB second

---

## Session & Cookie Rules

- Sessions use JWT strategy — stateless, signed with `NEXTAUTH_SECRET`
- Session cookie must be set as: `HttpOnly`, `Secure`, `SameSite=Lax`
- JWT access token validity: 30 minutes
- On logout, `signOut()` destroys the JWT and clears the cookie server-side
- Never manually set or read auth cookies — let NextAuth handle all cookie logic
- After logout, navigating back to `/dashboard` must redirect to `/login` — not serve cached content

---

## HTTP Security Headers

Add to `next.config.js`:

```js
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}
```

---

## Input Validation Rules

- **All user input must be validated server-side with Zod** before any DB operation
- Client-side validation is supplementary — never the sole line of defence
- Use `schema.safeParse(body)` — never `schema.parse(body)` (throws on failure)
- Reject requests with unexpected or missing fields
- SQL injection is prevented by Prisma's parameterised queries — never use raw SQL with interpolated user input

---

## Environment Variable Rules

| Variable | Purpose | Where to Store |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `.env.local` / Vercel dashboard |
| `NEXTAUTH_SECRET` | JWT signing secret | `.env.local` / Vercel dashboard |
| `NEXTAUTH_URL` | Base URL of the app | `.env.local` / Vercel dashboard |
| `RESEND_API_KEY` | Resend transactional email | `.env.local` / Vercel dashboard |
| `UPSTASH_REDIS_REST_URL` | Upstash rate limiting | `.env.local` / Vercel dashboard |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash rate limiting | `.env.local` / Vercel dashboard |

- `.env.local` must be in `.gitignore` before the first commit — check this before every `git push`
- Never hardcode any of these values in source files
- Never log environment variable values — even in development

---

## Pre-Deployment Security Checklist

Before deploying to Vercel, verify:

- [ ] Passwords in DB are hashed — verified in DB client, not assumed
- [ ] `.env.local` is absent from the GitHub repo
- [ ] All env variables are set in the Vercel dashboard
- [ ] Login error messages do not reveal email existence
- [ ] Forgot password response does not confirm email existence
- [ ] Verification token expires after 15 minutes
- [ ] Reset token expires after 1 hour
- [ ] Both tokens are deleted after use
- [ ] HTTP security headers are present in `next.config.js`
- [ ] Rate limiting is active on login and forgot-password endpoints
- [ ] Dashboard redirects unauthenticated and unverified users to `/login`