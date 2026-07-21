import { Router } from 'express';
import { stockController } from '../controllers/stock.controller';

const router = Router();

router.get('/', (req, res, next) => stockController.getAll(req, res).catch(next));
router.post('/', (req, res, next) => stockController.create(req, res).catch(next));
router.get('/:id', (req, res, next) => stockController.getById(req, res).catch(next));
router.put('/:id', (req, res, next) => stockController.update(req, res).catch(next));
router.delete('/:id', (req, res, next) => stockController.delete(req, res).catch(next));

export default router;
