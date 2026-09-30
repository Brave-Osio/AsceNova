import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { HttpError } from '../middleware/errorHandler.js';

export interface GoogleIdentity {
  /** Google's stable, unique account ID (the ID token's `sub` claim). */
  googleId: string;
  email: string;
}

let client: OAuth2Client | null = null;

function getAllowedClientIds(): string[] {
  return (env.GOOGLE_CLIENT_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

/**
 * The one seam authService talks to for Google — mirrors lib/gemini.ts. Verifies the
 * ID token's signature, issuer, expiry and audience (must be one of our client IDs),
 * and refuses tokens whose email Google hasn't verified, since account linking in
 * authService trusts the email.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
  const audience = getAllowedClientIds();
  if (audience.length === 0) {
    throw new HttpError(503, 'Google sign-in is not configured');
  }
  if (!client) {
    client = new OAuth2Client();
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken, audience });
    payload = ticket.getPayload();
  } catch {
    throw new HttpError(401, 'Invalid Google credential');
  }

  if (!payload?.sub || !payload.email) {
    throw new HttpError(401, 'Invalid Google credential');
  }
  if (payload.email_verified !== true) {
    throw new HttpError(401, 'Your Google email address is not verified');
  }

  return { googleId: payload.sub, email: payload.email.trim().toLowerCase() };
}
