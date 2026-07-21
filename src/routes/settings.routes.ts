import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';

const router = Router();

router.get('/', (req, res, next) => settingsController.get(req, res).catch(next));
router.put('/', (req, res, next) => settingsController.update(req, res).catch(next));

export default router;
