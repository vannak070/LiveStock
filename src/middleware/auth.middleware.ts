import { Request, Response, NextFunction } from 'express';
import { verifyAuthToken, AuthTokenPayload } from '../lib/jwt';

export interface AuthedRequest extends Request {
  authUser?: AuthTokenPayload;
}

// Protects report/data endpoints for the mobile app: requires a valid
// "Authorization: Bearer <token>" header issued by POST /api/v1/auth/login.
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ success: false, message: 'Missing or invalid Authorization header.', data: null });
    return;
  }

  try {
    req.authUser = verifyAuthToken(token);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.', data: null });
  }
}
