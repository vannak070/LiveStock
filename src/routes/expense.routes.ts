import { Router } from 'express';
import { expenseController } from '../controllers/expense.controller';

const router = Router();

router.get('/', (req, res, next) => expenseController.getAll(req, res).catch(next));
router.post('/', (req, res, next) => expenseController.create(req, res).catch(next));
router.put('/:id', (req, res, next) => expenseController.update(req, res).catch(next));
router.delete('/:id', (req, res, next) => expenseController.delete(req, res).catch(next));

export default router;
