import jwt from 'jsonwebtoken';

// Fail loudly in production if no real secret is configured — mirrors the
// DB_PASSWORD guard in src/config/database.ts. In development, fall back to
// a clearly-labeled insecure default so local/dev servers still boot.
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('[Auth] JWT_SECRET environment variable is required when NODE_ENV=production.');
}
const SECRET: string = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';
const EXPIRES_IN = '30d';

export interface AuthTokenPayload {
  sub: string;        // user id
  email: string;
  role: string;
  farmLocation?: string;
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, SECRET) as AuthTokenPayload;
}
