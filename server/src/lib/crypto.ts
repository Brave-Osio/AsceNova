import { randomBytes, createHash } from 'node:crypto';

/** Opaque random token for refresh/password-reset tokens — never a JWT. */
export function generateOpaqueToken(bytes = 48): string {
  return randomBytes(bytes).toString('base64url');
}

/** Only the hash is ever persisted — a DB leak alone can't be replayed. */
export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
