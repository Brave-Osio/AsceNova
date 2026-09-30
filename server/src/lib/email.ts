import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.js';

let transporter: Transporter | null = null;

/** Email is opt-in: with no SMTP credentials configured, callers fall back (dev) or skip (prod). */
export function isEmailConfigured(): boolean {
  return Boolean(env.SMTP_USER && env.SMTP_PASS);
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.SMTP_USER,
        // Google shows App Passwords as four space-separated groups; the spaces aren't part of it.
        pass: (env.SMTP_PASS ?? '').replace(/\s+/g, ''),
      },
    });
  }
  return transporter;
}

function getFrontendBaseUrl(): string {
  // `||` (not `??`) on purpose: a blank `FRONTEND_URL=` line in .env loads as '' and must count as unset.
  const base = env.FRONTEND_URL || env.CORS_ORIGIN.split(',')[0] || '';
  return base.trim().replace(/\/+$/, '');
}

/**
 * The one seam authService talks to for email — mirrors lib/gemini.ts and lib/googleAuth.ts.
 * Throws on delivery failure; callers decide whether that may surface to the client.
 */
async function sendEmail(message: { to: string; subject: string; text: string; html: string }): Promise<void> {
  await getTransporter().sendMail({
    from: env.EMAIL_FROM || `AsceNova <${env.SMTP_USER}>`,
    ...message,
  });
}

export async function sendPasswordResetEmail(input: {
  to: string;
  token: string;
  expiresInMinutes: number;
}): Promise<void> {
  const resetUrl = `${getFrontendBaseUrl()}/reset-password?token=${encodeURIComponent(input.token)}`;

  const text = [
    'We received a request to reset your AsceNova password.',
    '',
    `Open this link to continue (it expires in ${input.expiresInMinutes} minutes and works once):`,
    resetUrl,
    '',
    "If you didn't request this, you can safely ignore this email — your account is unchanged.",
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#111">
      <h2 style="margin:0 0 16px">AsceNova</h2>
      <p>We received a request to reset your AsceNova password.</p>
      <p style="margin:24px 0">
        <a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">
          Continue
        </a>
      </p>
      <p style="font-size:13px;color:#555">
        This link expires in ${input.expiresInMinutes} minutes and works once. If the button doesn't work, copy this URL into your browser:<br />
        <span style="word-break:break-all">${resetUrl}</span>
      </p>
      <p style="font-size:13px;color:#555">If you didn't request this, you can safely ignore this email — your account is unchanged.</p>
    </div>`;

  await sendEmail({
    to: input.to,
    subject: 'Reset your AsceNova password',
    text,
    html,
  });
}
