import { Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthedRequest } from '../middleware/auth.middleware';

export class AuthController {
  async login(req: AuthedRequest, res: Response): Promise<void> {
    const { email, password } = req.body || {};
    const { token, user } = await authService.login(email, password);
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: { token, user }
    });
  }

  async me(req: AuthedRequest, res: Response): Promise<void> {
    const userId = req.authUser?.sub;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.', data: null });
      return;
    }
    const user = await authService.getCurrentUser(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User no longer exists.', data: null });
      return;
    }
    res.status(200).json({ success: true, message: 'OK', data: user });
  }
}

export const authController = new AuthController();
