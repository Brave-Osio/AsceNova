import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().min(1),

  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  // Optional: when unset, access tokens never expire (see lib/jwt.ts).
  JWT_ACCESS_EXPIRES_IN: z.string().optional(),
  REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce.number().default(30),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),

  // Optional: comma-separated Google OAuth client IDs (web/iOS/Android) whose ID tokens
  // POST /api/auth/google accepts. When unset that endpoint returns 503 (see lib/googleAuth.ts).
  GOOGLE_CLIENT_IDS: z.string().optional(),

  // Optional: Gmail SMTP credentials for transactional email (password reset). SMTP_PASS is a
  // Google *App Password*, not the account password. When unset, email is disabled (see lib/email.ts).
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  // Optional display name/address; defaults to "AsceNova <SMTP_USER>".
  EMAIL_FROM: z.string().optional(),
  // Optional: public frontend URL used in email links. Falls back to the first CORS_ORIGIN entry.
  FRONTEND_URL: z.string().optional(),

  ADMIN_SEED_EMAIL: z.string().email().optional(),
  ADMIN_SEED_PASSWORD: z.string().optional(),

  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  // Optional daily request quota (free tier is capped by requests per day) shown as the limit in the admin AI-usage graph (blank = no limit line).
  GEMINI_DAILY_REQUEST_LIMIT: z
    .string()
    .optional()
    .transform((v) => (v && Number.isFinite(Number(v)) && Number(v) > 0 ? Math.floor(Number(v)) : undefined)),
  ENABLE_SIMULATE_PROGRESS: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
});

/**
 * Fails fast on boot with a readable error rather than surfacing cryptic
 * `undefined` failures deep in a request handler.
 */
function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration — see errors above.');
  }
  return parsed.data;
}

export const env = loadEnv();
