import bcrypt from 'bcryptjs';

// bcryptjs is a pure-JS implementation (no native binary) — this app's
// password hashing needs to run correctly wherever `npm install` happens,
// so we avoid a native bcrypt build that only loads on one platform.
const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

// Recognizes an existing bcrypt hash (e.g. "$2b$10$...") so callers can tell
// an already-hashed value apart from plaintext that still needs hashing.
export function isBcryptHash(value: string | null | undefined): boolean {
  return !!value && /^\$2[aby]\$\d{2}\$/.test(value);
}
