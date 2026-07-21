import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

const router = Router();

router.get('/', (req, res, next) => healthController.getAll(req, res).catch(next));
router.post('/', (req, res, next) => healthController.create(req, res).catch(next));
router.put('/:id', (req, res, next) => healthController.update(req, res).catch(next));
router.delete('/:id', (req, res, next) => healthController.delete(req, res).catch(next));

export default router;
