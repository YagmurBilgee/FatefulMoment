/**
 * Local-only authentication. The assignment has no backend, so credentials
 * are checked against a hardcoded demo account.
 */
export const MOCK_USER = {
  email: 'test@fatefulmoment.com',
  password: 'Password123',
} as const;

// Simulated network latency so the button's loading state is visible.
const MOCK_DELAY_MS = 600;

export type SignInResult = { ok: true } | { ok: false; reason: 'invalid' };

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
  return matches ? { ok: true } : { ok: false, reason: 'invalid' };
}
