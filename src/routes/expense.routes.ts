import { Router } from 'express';
import { expenseController } from '../controllers/expense.controller';
import { requirePermission } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requirePermission('expenses_view'), (req, res, next) => expenseController.getAll(req, res).catch(next));
router.post('/', requirePermission('expenses_record'), (req, res, next) => expenseController.create(req, res).catch(next));
router.put('/:id', requirePermission('expenses_record'), (req, res, next) => expenseController.update(req, res).catch(next));
router.delete('/:id', requirePermission('expenses_delete'), (req, res, next) => expenseController.delete(req, res).catch(next));

export default router;
