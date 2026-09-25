/**
 * Local-only authentication. The assignment has no backend, so credentials
 * are checked against a hardcoded demo account.
 */
export const MOCK_USER = {
  name: 'John Doe',
  email: 'test@fatefulmoment.com',
  password: 'Password123',
} as const;

// Simulated network latency so the button's loading state is visible.
const MOCK_DELAY_MS = 600;

export type MockProfile = { name: string; email: string };

export type SignInResult =
  | { ok: true; user: MockProfile }
  | { ok: false; reason: 'invalid' };

const wait = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

export async function mockSignIn(
  email: string,
  password: string,
  delayMs: number = MOCK_DELAY_MS,
): Promise<SignInResult> {
  await wait(delayMs);
  const matches =
    email.trim().toLowerCase() === MOCK_USER.email &&
    password === MOCK_USER.password;
  return matches
    ? { ok: true, user: { name: MOCK_USER.name, email: MOCK_USER.email } }
    : { ok: false, reason: 'invalid' };
}

/**
 * Accepts any validated input and starts a mock session for it. Nothing is
 * stored, so the new account cannot be used with mockSignIn later.
 */
export async function mockSignUp(
  name: string,
  email: string,
  delayMs: number = MOCK_DELAY_MS,
): Promise<MockProfile> {
  await wait(delayMs);
  return { name: name.trim(), email: email.trim() };
}
