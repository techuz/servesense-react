/* ============================================================================
   Sign-up validation — SOW v2 §5.1.2 (self-service manager registration).
   Mirrors the inline touched-state pattern used on the login form.
   ============================================================================ */

export interface SignUpValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  restaurantName: string;
  restaurantAddress: string;
}

export type SignUpField = keyof SignUpValues;
export type SignUpErrors = Partial<Record<SignUpField, string>>;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[+0-9\s()-]{7,}$/;

/** §5.1.2: min 8 chars, uppercase + number + special char. */
export function passwordIssue(pw: string): string | undefined {
  if (pw.length < 8) return 'At least 8 characters';
  if (!/[A-Z]/.test(pw)) return 'Add an uppercase letter';
  if (!/[0-9]/.test(pw)) return 'Add a number';
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Add a special character';
  return undefined;
}

export function validateAll(v: SignUpValues): SignUpErrors {
  const errors: SignUpErrors = {};

  if (!v.fullName.trim()) errors.fullName = 'Your full name is required';
  else if (v.fullName.trim().length > 100) errors.fullName = 'Keep this under 100 characters';

  if (!v.email.trim()) errors.email = 'Email is required';
  else if (!emailRe.test(v.email.trim())) errors.email = 'Enter a valid email address';

  if (!v.phone.trim()) errors.phone = 'Phone number is required';
  else if (!phoneRe.test(v.phone.trim())) errors.phone = 'Enter a valid phone number';

  const pwIssue = passwordIssue(v.password);
  if (pwIssue) errors.password = pwIssue;

  if (!v.confirmPassword) errors.confirmPassword = 'Re-enter your password';
  else if (v.confirmPassword !== v.password) errors.confirmPassword = 'Passwords do not match';

  if (!v.restaurantName.trim()) errors.restaurantName = 'Restaurant name is required';
  else if (v.restaurantName.trim().length > 200) errors.restaurantName = 'Keep this under 200 characters';

  if (v.restaurantAddress.trim().length > 500)
    errors.restaurantAddress = 'Keep this under 500 characters';

  return errors;
}

export function hasErrors(errors: SignUpErrors): boolean {
  return Object.values(errors).some(Boolean);
}
