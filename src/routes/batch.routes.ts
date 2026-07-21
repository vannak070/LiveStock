import { Router } from 'express';
import { batchController } from '../controllers/batch.controller';

const router = Router();

router.get('/', (req, res, next) => batchController.getAll(req, res).catch(next));
router.post('/', (req, res, next) => batchController.create(req, res).catch(next));
router.post('/weights', (req, res, next) => batchController.recordBatchWeights(req, res).catch(next));
router.get('/:id', (req, res, next) => batchController.getById(req, res).catch(next));
router.put('/:id', (req, res, next) => batchController.update(req, res).catch(next));
router.post('/:id/assign', (req, res, next) => batchController.assignCows(req, res).catch(next));
router.delete('/:id/cows/:cowId', (req, res, next) => batchController.removeCow(req, res).catch(next));
router.post('/:id/health', (req, res, next) => batchController.recordBatchHealthLog(req, res).catch(next));
router.delete('/:id', (req, res, next) => batchController.delete(req, res).catch(next));

export default router;
