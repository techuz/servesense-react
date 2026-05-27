/**
 * Login field validation.
 *
 * Identifier is "email or phone". We accept whichever the user provided:
 *  - If it contains an "@", validate as email.
 *  - If it starts with "+" or is mostly digits, validate as phone.
 *  - Otherwise, ask the user to choose one.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const PHONE_RE = /^\+?[\d\s\-()]{7,20}$/;

export type LoginFieldErrors = {
  identifier?: string;
  password?: string;
};

export function validateIdentifier(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return 'Enter your email or phone number.';
  if (value.includes('@')) {
    if (!EMAIL_RE.test(value)) return 'That email address doesn’t look right.';
    return undefined;
  }
  // looks like phone
  if (/^\+?[\d\s\-()]+$/.test(value)) {
    if (!PHONE_RE.test(value)) return 'Phone numbers should be 7–20 digits.';
    return undefined;
  }
  return 'Use an email (with @) or a phone number.';
}

export function validatePassword(raw: string): string | undefined {
  if (!raw) return 'Enter your password.';
  if (raw.length < 6) return 'Password must be at least 6 characters.';
  if (raw.length > 128) return 'Password is too long.';
  return undefined;
}

export function validateAll(identifier: string, password: string): LoginFieldErrors {
  return {
    identifier: validateIdentifier(identifier),
    password: validatePassword(password),
  };
}

export const hasErrors = (errors: LoginFieldErrors): boolean =>
  Object.values(errors).some((v) => !!v);
