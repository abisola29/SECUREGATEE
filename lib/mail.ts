const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'
const isDev = process.env.NODE_ENV !== 'production'
const BREVO_API_KEY = process.env.BREVO_API_KEY ?? ''
// Use the email address you verified as a single sender in your Brevo dashboard
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL ?? 'abisolaayantunji2004@gmail.com'

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'SecureGate', email: SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Brevo API error ${response.status}: ${errorBody}`)
  }
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
    await sendEmail(
      email,
      'Verify your email — SecureGate',
      `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #18181b; margin-bottom: 16px;">
            Verify your email
          </h1>
          <p style="font-size: 14px; color: #71717a; line-height: 1.6; margin-bottom: 24px;">
            Click the button below to verify your email address. This link expires in 15 minutes.
          </p>
          <a href="${verifyUrl}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
            Verify Email
          </a>
          <p style="font-size: 12px; color: #a1a1aa; margin-top: 32px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `
    )
    console.log('[MAIL] Verification email sent via Brevo to:', email)
  } catch (err) {
    // In development, a failed email send is non-fatal — the link is already logged above.
    // In production this should surface so it can be investigated.
    if (!isDev) throw err
    console.error('[DEV] Brevo send failed (link still logged above):', err)
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
    await sendEmail(
      email,
      'Reset your password — SecureGate',
      `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #18181b; margin-bottom: 16px;">
            Reset your password
          </h1>
          <p style="font-size: 14px; color: #71717a; line-height: 1.6; margin-bottom: 24px;">
            Click the button below to reset your password. This link expires in 1 hour.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
            Reset Password
          </a>
          <p style="font-size: 12px; color: #a1a1aa; margin-top: 32px;">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
      `
    )
    console.log('[MAIL] Password reset email sent via Brevo to:', email)
  } catch (err) {
    if (!isDev) throw err
    console.error('[DEV] Brevo send failed (link still logged above):', err)
  }
}
