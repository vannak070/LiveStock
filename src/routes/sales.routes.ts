import { Router } from 'express';
import { salesController } from '../controllers/sales.controller';

const router = Router();

router.get('/', (req, res, next) => salesController.getAll(req, res).catch(next));
router.post('/', (req, res, next) => salesController.create(req, res).catch(next));
router.post('/batch', (req, res, next) => salesController.recordBatchSale(req, res).catch(next));
router.put('/:cowId', (req, res, next) => salesController.update(req, res).catch(next));
router.delete('/:cowId', (req, res, next) => salesController.delete(req, res).catch(next));

export default router;
