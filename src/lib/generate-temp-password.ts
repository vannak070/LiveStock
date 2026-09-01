/**
 * Generates a random, URL-safe temporary password.
 *
 * Uses the Web Crypto API's `crypto.randomUUID()`, which is available as a
 * global in both the browser and Node.js (18.17+ / stable since Node 19) —
 * no import required, and safe to use from client components, server code,
 * and standalone scripts (e.g. `npx tsx` migrations) alike.
 *
 * Intentionally has zero other dependencies so it can be imported from
 * anywhere in the project without pulling in Next.js/App-Router-only code.
 */
export function generateTempPassword(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}
