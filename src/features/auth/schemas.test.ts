import { describe, expect, it } from 'vitest';
import { forgotPasswordSchema, loginSchema, registerSchema } from './schemas';

const validRegister = {
  fullName: 'Brave Osio',
  email: 'brave_01',
  recoveryEmail: '',
  password: 'password1',
  confirmPassword: 'password1',
  acceptedTerms: true,
};

describe('registerSchema', () => {
  it('accepts a plain username and no Gmail', () => {
    expect(registerSchema.safeParse(validRegister).success).toBe(true);
  });

  it('rejects signup until the terms are accepted', () => {
    expect(registerSchema.safeParse({ ...validRegister, acceptedTerms: false }).success).toBe(false);
  });

  it('accepts a Gmail recovery address', () => {
    expect(registerSchema.safeParse({ ...validRegister, recoveryEmail: 'Brave@Gmail.com' }).success).toBe(true);
  });

  it.each(['brave@yahoo.com', 'brave@gmail.co', 'nope'])('rejects the non-Gmail recovery address %j', (recoveryEmail) => {
    expect(registerSchema.safeParse({ ...validRegister, recoveryEmail }).success).toBe(false);
  });

  it.each(['ab', 'has space', 'bad/char'])('rejects the invalid username %j', (email) => {
    expect(registerSchema.safeParse({ ...validRegister, email }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('lets an old email-style username through, so existing accounts can log in', () => {
    expect(loginSchema.safeParse({ email: 'Old.User@School.edu', password: 'x', rememberMe: false }).success).toBe(true);
  });
});

describe('forgotPasswordSchema', () => {
  it('needs a username and a Gmail address', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'brave', recoveryEmail: 'brave@gmail.com' }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: 'brave', recoveryEmail: '' }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: 'brave', recoveryEmail: 'brave@outlook.com' }).success).toBe(false);
  });
});
