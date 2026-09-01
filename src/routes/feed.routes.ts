import { Router } from 'express';
import { feedController } from '../controllers/feed.controller';

const router = Router();

router.get('/products', (req, res, next) => feedController.getProducts(req, res).catch(next));
router.get('/transactions', (req, res, next) => feedController.getTransactions(req, res).catch(next));

export default router;
