# AGENTS.md — SecureGate

## What This Project Is

SecureGate is a standalone, production-ready authentication system built with Next.js 14 (App Router), TypeScript, Prisma, PostgreSQL, NextAuth.js, bcryptjs, Zod, Resend, and Tailwind CSS.

It is not a full product. It is the auth layer — one job, done correctly. Every agent operating in this project must treat security as a non-negotiable constraint, not an afterthought.

---

## Agent Behaviour Rules

### Always
- Read the relevant rules file in `.agents/rules/` before generating any code
- Validate all user input server-side with Zod before touching the database
- Hash all passwords with `bcrypt.hash(password, 12)` — never store plain text
- Use `crypto.randomBytes(32).toString('hex')` for all token generation
- Return generic, non-revealing error messages to the client
- Delete tokens from the database immediately after they are used
- Keep all secrets in environment variables — never hardcode them

### Never
- Return stack traces, DB errors, or internal messages to the client
- Confirm whether an email exists in the system through any API response
- Store plain text passwords at any point — even temporarily
- Skip server-side Zod validation, even if client-side validation is present
- Generate a component without accessible labels on all input fields
- Create a protected route without middleware session and `emailVerified` checks
- Add complexity that is not required by the PRD — keep it MVP-focused

---

## Project Structure

```
securegate/
├── app/
│   ├── (auth)/
│   │   ├── signup/page.tsx
│   │   ├── login/page.tsx
│   │   ├── verify-email/[token]/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/[token]/page.tsx
│   ├── dashboard/page.tsx
│   └── api/
│       └── auth/
│           ├── signup/route.ts
│           ├── forgot-password/route.ts
│           ├── reset-password/route.ts
│           ├── verify-email/route.ts
│           └── [...nextauth]/route.ts
├── components/
│   ├── ui/
│   └── auth/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── mail.ts
│   ├── rate-limit.ts
│   └── validations/
├── prisma/
│   └── schema.prisma
├── middleware.ts
├── .agents/
│   └── rules/
│       ├── architecture.md
│       ├── code-style.md
│       ├── design-system.md
│       └── security.md
├── skills/
│   ├── component-builder/SKILL.md
│   ├── api-route-scaffolder/SKILL.md
│   └── database-migration-runner/SKILL.md
└── workflows/
    ├── new-component.md
    └── new-api-route.md
```

---

## Rules Files

All agent rules live in `.agents/rules/`. Read the relevant file before every task:

| Task Type | Rules File to Read |
|---|---|
| Building any page or component | `architecture.md` + `design-system.md` |
| Writing any API route | `architecture.md` + `security.md` |
| Writing any auth logic | `security.md` |
| Styling any UI | `design-system.md` |
| Writing any TypeScript | `code-style.md` |
| Running any DB migration | `architecture.md` |

---

## Skills

Use the relevant skill file for scaffolding tasks:

| Task | Skill File |
|---|---|
| Building a new UI component | `skills/component-builder/SKILL.md` |
| Scaffolding a new API route | `skills/api-route-scaffolder/SKILL.md` |
| Running a Prisma migration | `skills/database-migration-runner/SKILL.md` |

---

## Environment Variables Required

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
RESEND_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Never generate code that hardcodes any of these values. Always reference `process.env.VARIABLE_NAME`.

---

## Pages & Routes Reference

| Route | Access | Purpose |
|---|---|---|
| `/signup` | Public | Registration form |
| `/login` | Public | Email + password login |
| `/verify-email/[token]` | Public | Token validation + account verification |
| `/forgot-password` | Public | Request password reset email |
| `/reset-password/[token]` | Public | Submit new password |
| `/dashboard` | Protected | Verified + authenticated users only |

---

