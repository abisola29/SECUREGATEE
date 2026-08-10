# SKILL: Database Migration Runner

## Purpose

Use this skill before running any Prisma migration in SecureGate. Migrations are irreversible operations that modify the database schema. Running them incorrectly causes schema drift, data loss, and hard-to-debug errors. This skill defines the correct process, order, and verification steps.

---

## Before You Migrate — Read These First

- `.agents/rules/architecture.md` — Prisma setup, model definitions, DB connection

---

## The Golden Rule

**Define all three models in `schema.prisma` before running any migration.**

Do not run migrations one model at a time. Schema drift between your Prisma schema and your actual database causes runtime errors that are difficult to trace. Define everything first, migrate once.

---

## Required Models

All four of these must be in `prisma/schema.prisma` before the first migration:

1. `User`
2. `VerificationToken`
3. `PasswordResetToken`
4. `Session` (only required if using database session strategy)

---

## Full schema.prisma Reference

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  emailVerified DateTime?
  role          Role      @default(MEMBER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
}

enum Role {
  ADMIN
  MEMBER
}

model VerificationToken {
  id         String   @id @default(cuid())
  identifier String
  token      String   @unique
  expires    DateTime
}

model PasswordResetToken {
  id      String   @id @default(cuid())
  email   String
  token   String   @unique
  expires DateTime
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Migration Steps — Follow in Order

### Step 1 — Verify DATABASE_URL

Confirm the environment variable is set and pointing to the correct database:

```bash
# Check .env.local contains this line (value will differ per environment)
DATABASE_URL="postgresql://user:password@host:5432/securegate"
```

Never run a migration without confirming which database it will modify.

---

### Step 2 — Verify schema.prisma is complete

Before running the migration, confirm:

- [ ] `User` model is defined with all fields
- [ ] `VerificationToken` model is defined
- [ ] `PasswordResetToken` model is defined
- [ ] `Session` model is defined (if using DB sessions)
- [ ] `Role` enum is defined
- [ ] Datasource block points to `postgresql`
- [ ] Generator block specifies `prisma-client-js`

---

### Step 3 — Run the Migration

```bash
npx prisma migrate dev --name init
```

This command:
1. Compares your `schema.prisma` against the current database state
2. Generates a SQL migration file in `prisma/migrations/`
3. Applies the migration to the database
4. Regenerates the Prisma client

Only use `--name init` for the first migration. For subsequent migrations, use a descriptive name:

```bash
npx prisma migrate dev --name add_session_model
npx prisma migrate dev --name add_role_to_user
```

---

### Step 4 — Verify Tables in DB Client

After the migration completes, open your database client (TablePlus, Prisma Studio, psql) and confirm:

- [ ] `User` table exists with all columns
- [ ] `VerificationToken` table exists
- [ ] `PasswordResetToken` table exists
- [ ] `Session` table exists (if applicable)
- [ ] No unexpected tables or columns

```bash
# Use Prisma Studio to inspect the DB visually
npx prisma studio
```

---

### Step 5 — Regenerate Prisma Client (if needed)

If the client is not automatically regenerated after migration:

```bash
npx prisma generate
```

Run this whenever `schema.prisma` changes — the client must match the schema.

---

## Resetting the Database (Development Only)

If schema drift occurs during development and you need to start fresh:

```bash
npx prisma migrate reset
```

**Warning:** This drops all tables and data in the database. Never run this in production.

After resetting:
1. Confirm all models are correctly defined in `schema.prisma`
2. Re-run `npx prisma migrate dev --name init`
3. Verify tables again in your DB client

---

## Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `Environment variable not found: DATABASE_URL` | `.env.local` not loaded or variable missing | Check `.env.local` exists and contains `DATABASE_URL` |
| `P1001: Can't reach database server` | Wrong host or DB not running | Verify DB connection string and DB status |
| `P3005: Database schema is not empty` | Running init migration on existing DB | Use `prisma migrate dev` not `migrate deploy` for dev |
| `P2002: Unique constraint failed` | Duplicate data violating a unique field | Check for duplicate `email` or `token` values |
| `Table does not exist` | Migration not run or Prisma client not generated | Run `prisma migrate dev` then `prisma generate` |
| Client types out of sync with schema | Schema changed but client not regenerated | Run `npx prisma generate` |

---

## Production Migration

In production (Vercel), never run `migrate dev`. Use:

```bash
npx prisma migrate deploy
```

This applies pending migrations without generating new ones. Set this as part of the Vercel build command:

```
npx prisma migrate deploy && next build
```

---

## Output Format

When this skill is used, produce:

1. The complete `schema.prisma` file if it does not exist
2. The exact migration command to run
3. The verification checklist to confirm after migration
4. A note of which DB client to use for verification