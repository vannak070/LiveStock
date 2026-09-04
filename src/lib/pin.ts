/**
 * Shared PIN policy. A PIN is deliberately weaker than a password — it is
 * short, and on the mobile app it both identifies and authenticates (there
 * is no separate username field). So it is held to a floor: digits only,
 * a minimum length, and not one of the sequences/repeats any guessing
 * script tries first.
 *
 * Used by both the `set-pin` CLI script and the Settings UI's create/edit
 * user write path, so a PIN typed into either place is judged the same way.
 */

export const MIN_PIN_LENGTH = 6;

// Sequences and repeats are the first things any guessing script tries.
function predictabilityReason(pin: string): string | null {
  if (/^(\d)\1+$/.test(pin)) return 'every digit is the same';
  const asc = pin.split('').every((d, i, a) => i === 0 || Number(d) === Number(a[i - 1]) + 1);
  const desc = pin.split('').every((d, i, a) => i === 0 || Number(d) === Number(a[i - 1]) - 1);
  if (asc || desc) return 'the digits run in sequence';
  if (['123456', '654321', '000000', '111111', '121212', '112233'].includes(pin)) return 'it is a commonly used PIN';
  return null;
}

// Returns a human-readable problem description, or null if the PIN is fine.
export function validatePinStrength(pin: string): string | null {
  if (!/^\d+$/.test(pin)) return 'A PIN must be digits only.';
  if (pin.length < MIN_PIN_LENGTH) return `A PIN must be at least ${MIN_PIN_LENGTH} digits — shorter PINs are quick to guess.`;
  const predictable = predictabilityReason(pin);
  if (predictable) return `That PIN is too easy to guess (${predictable}).`;
  return null;
}
