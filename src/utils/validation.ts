// Error copy from the Figma "Error Cases" frames.
export const INVALID_EMAIL_MESSAGE = 'Please enter a valid email address.';
export const SHORT_NAME_MESSAGE = 'Enter at least 3 characters.';

// Deliberately simple: something@something.tld without spaces.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function isValidFullName(name: string): boolean {
  return name.trim().length >= 3;
}

// Rules shown under the password field on Create Account, in Figma order.
export const PASSWORD_RULES = [
  {
    label: 'Must be at least 8 characters long',
    test: (p: string) => p.length >= 8,
  },
  {
    label: 'Must contain at least 1 uppercase letter',
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    label: 'Must contain at least 1 lowercase letter',
    test: (p: string) => /[a-z]/.test(p),
  },
  { label: 'Must contain at least 1 digit', test: (p: string) => /\d/.test(p) },
] as const;
