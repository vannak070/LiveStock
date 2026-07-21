import { Router } from 'express';
import { weightController } from '../controllers/weight.controller';

const router = Router();

router.get('/', (req, res, next) => weightController.getAll(req, res).catch(next));
router.post('/', (req, res, next) => weightController.create(req, res).catch(next));
router.get('/cow/:cowId', (req, res, next) => weightController.getByCowId(req, res).catch(next));
router.put('/cow/:cowId', (req, res, next) => weightController.update(req, res).catch(next));
router.delete('/cow/:cowId', (req, res, next) => weightController.delete(req, res).catch(next));

export default router;
