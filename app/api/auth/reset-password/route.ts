import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'
import { resetPasswordSchema } from '@/lib/validations/auth'
import { BCRYPT_SALT_ROUNDS } from '@/lib/constants'

interface ResetPasswordResponse {
  success: boolean
  error?: string
}

export async function POST(req: NextRequest): Promise<NextResponse<ResetPasswordResponse>> {
  try {
    const body: unknown = await req.json()
    const parsed = resetPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input.' },
        { status: 400 }
      )
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: parsed.data.token },
    })

    if (!resetToken) {
      return NextResponse.json(
        { success: false, error: 'This reset link is invalid or has already been used.' },
        { status: 400 }
      )
    }

    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      })

      return NextResponse.json(
        { success: false, error: 'This link has expired. Request a new one.' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, BCRYPT_SALT_ROUNDS)

    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
    ])

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[RESET_PASSWORD]', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
