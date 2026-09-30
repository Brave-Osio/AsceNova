import { describe, expect, it } from 'vitest';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  setRecoveryEmailSchema,
} from './auth.validators.js';

const validRegister = { email: 'brave_01', password: 'password1', fullName: 'Brave Osio' };

describe('registerSchema', () => {
  it('accepts a plain username and lowercases it', () => {
    const parsed = registerSchema.parse({ ...validRegister, email: '  Brave.Osio  ' });
    expect(parsed.email).toBe('brave.osio');
  });

  it('still accepts an email-shaped username, so existing accounts keep their names', () => {
    expect(registerSchema.safeParse({ ...validRegister, email: 'old.user@school.edu' }).success).toBe(true);
  });

  it.each(['ab', 'has space', 'bad/char', 'emoji😀'])('rejects the invalid username %j', (email) => {
    expect(registerSchema.safeParse({ ...validRegister, email }).success).toBe(false);
  });

  it('treats a blank recovery email as not provided', () => {
    const parsed = registerSchema.parse({ ...validRegister, recoveryEmail: '' });
    expect(parsed.recoveryEmail).toBeUndefined();
  });

  it('accepts a Gmail recovery email and normalises its case', () => {
    const parsed = registerSchema.parse({ ...validRegister, recoveryEmail: ' Brave@Gmail.com ' });
    expect(parsed.recoveryEmail).toBe('brave@gmail.com');
  });

  it.each(['brave@yahoo.com', 'brave@gmail.co', 'brave@mail.gmail.com', 'not-an-email'])(
    'rejects the non-Gmail recovery email %j',
    (recoveryEmail) => {
      expect(registerSchema.safeParse({ ...validRegister, recoveryEmail }).success).toBe(false);
    },
  );
});

describe('loginSchema', () => {
  it('stays lenient so pre-username accounts can still log in', () => {
    expect(loginSchema.safeParse({ email: 'Old.User@School.edu', password: 'x' }).success).toBe(true);
    expect(loginSchema.parse({ email: 'Brave', password: 'x' }).email).toBe('brave');
  });

  it('requires a username', () => {
    expect(loginSchema.safeParse({ email: '   ', password: 'x' }).success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('requires both the username and a Gmail address', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'brave', recoveryEmail: 'brave@gmail.com' }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: 'brave' }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: 'brave', recoveryEmail: 'brave@yahoo.com' }).success).toBe(false);
  });
});

describe('setRecoveryEmailSchema', () => {
  it('needs the current password and a Gmail address', () => {
    expect(setRecoveryEmailSchema.safeParse({ currentPassword: 'pw', recoveryEmail: 'me@gmail.com' }).success).toBe(true);
    expect(setRecoveryEmailSchema.safeParse({ currentPassword: '', recoveryEmail: 'me@gmail.com' }).success).toBe(false);
    expect(setRecoveryEmailSchema.safeParse({ currentPassword: 'pw', recoveryEmail: 'me@outlook.com' }).success).toBe(false);
  });
});
