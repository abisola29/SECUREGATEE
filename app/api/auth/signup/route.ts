import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'
import { signUpSchema } from '@/lib/validations/auth'
import { sendVerificationEmail } from '@/lib/mail'
import { rateLimit } from '@/lib/rate-limit'
import {
  BCRYPT_SALT_ROUNDS,
  VERIFICATION_TOKEN_EXPIRY_MS,
} from '@/lib/constants'

interface SignUpResponse {
  success: boolean
  error?: string
}

export async function POST(req: NextRequest): Promise<NextResponse<SignUpResponse>> {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const rateLimitResult = await rateLimit(`signup:${ip}`)

    if (!rateLimitResult.success) {
      const minutes = Math.ceil(rateLimitResult.resetInMs / 60000)
      return NextResponse.json(
        { success: false, error: `Too many attempts. Please try again in ${minutes} minutes.` },
        { status: 429 }
      )
    }

    const body: unknown = await req.json()
    const parsed = signUpSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input.' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, BCRYPT_SALT_ROUNDS)

    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: hashedPassword,
      },
    })

    const token = crypto.randomBytes(32).toString('hex')

    await prisma.verificationToken.create({
      data: {
        email: parsed.data.email,
        token,
        expires: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
      },
    })

    await sendVerificationEmail(parsed.data.email, token)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[SIGNUP]', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
