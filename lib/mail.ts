import { Resend } from 'resend'

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'
const isDev = process.env.NODE_ENV !== 'production'

function getResendInstance(): Resend {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    return new Resend('re_dummy_key_for_build')
  }
  return new Resend(apiKey)
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${BASE_URL}/verify-email/${token}`

  if (isDev) {
    console.log('\n📧 [DEV] Verification email link (use this to verify):')
    console.log(`   → ${verifyUrl}\n`)
  }

  try {
    const { data, error } = await getResendInstance().emails.send({
      from: 'SecureGate <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your email — SecureGate',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #fafafa; margin-bottom: 16px;">
            Verify your email
          </h1>
          <p style="font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px;">
            Click the button below to verify your email address. This link expires in 15 minutes.
          </p>
          <a href="${verifyUrl}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
            Verify Email
          </a>
          <p style="font-size: 12px; color: #71717a; margin-top: 32px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `,
    })
    
    if (error) {
      throw new Error(`Resend Error: ${error.message}`);
    }
    console.log('[DEV] Verification email actually sent via Resend! ID:', data?.id);
  } catch (err) {
    // In development, a failed email send is non-fatal — the link is already logged above.
    // In production this should surface so it can be investigated.
    if (!isDev) throw err
    console.error('[DEV] Resend send failed (link still logged above):', err)
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${BASE_URL}/reset-password/${token}`

  if (isDev) {
    console.log('\n📧 [DEV] Password reset email link (use this to reset):')
    console.log(`   → ${resetUrl}\n`)
  }

  try {
    const { data, error } = await getResendInstance().emails.send({
      from: 'SecureGate <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your password — SecureGate',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #fafafa; margin-bottom: 16px;">
            Reset your password
          </h1>
          <p style="font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px;">
            Click the button below to reset your password. This link expires in 1 hour.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
            Reset Password
          </a>
          <p style="font-size: 12px; color: #71717a; margin-top: 32px;">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
      `,
    })
    
    if (error) {
      throw new Error(`Resend Error: ${error.message}`);
    }
    console.log('[DEV] Reset password email actually sent via Resend! ID:', data?.id);
  } catch (err) {
    if (!isDev) throw err
    console.error('[DEV] Resend send failed (link still logged above):', err)
  }
}
