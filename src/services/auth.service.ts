import { settingsRepository } from '../repositories/settings.repository';
import { verifyPassword } from '../lib/password';
import { signAuthToken } from '../lib/jwt';
import { UserRoleItem } from '../lib/types';

export interface AppError extends Error {
  statusCode?: number;
}

function makeError(message: string, statusCode: number): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  return err;
}

export class AuthService {
  async login(email: string, password: string): Promise<{ token: string; user: UserRoleItem }> {
    if (!email || !password) {
      throw makeError('Email and password are required.', 400);
    }

    const user = await settingsRepository.getUserWithPasswordHashByEmail(email.trim());
    if (!user) {
      throw makeError('Invalid email or password.', 401);
    }
    if (user.status !== 'Active') {
      throw makeError('This account is inactive. Contact your administrator.', 403);
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      throw makeError('Invalid email or password.', 401);
    }

    const token = signAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      farmLocation: user.farmLocation
    });

    const { password: _discard, ...safeUser } = user;
    return { token, user: safeUser as UserRoleItem };
  }

  async getCurrentUser(userId: string): Promise<UserRoleItem | null> {
    const settings = await settingsRepository.getSettings();
    return settings.users.find(u => u.id === userId) || null;
  }
}

export const authService = new AuthService();
