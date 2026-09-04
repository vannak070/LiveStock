import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', (req, res, next) => authController.login(req, res).catch(next));
router.post('/pin', (req, res, next) => authController.loginWithPin(req, res).catch(next));
router.get('/me', requireAuth, (req, res, next) => authController.me(req, res).catch(next));

export default router;
