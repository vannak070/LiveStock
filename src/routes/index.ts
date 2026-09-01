import { Router } from 'express';
import stockRoutes from './stock.routes';
import weightRoutes from './weight.routes';
import salesRoutes from './sales.routes';
import batchRoutes from './batch.routes';
import healthRoutes from './health.routes';
import expenseRoutes from './expense.routes';
import settingsRoutes from './settings.routes';
import authRoutes from './auth.routes';
import feedRoutes from './feed.routes';

const router = Router();

// Mount modular feature routes under API v1 path structure
router.use('/stock', stockRoutes);
router.use('/weight', weightRoutes);
router.use('/sales', salesRoutes);
router.use('/batches', batchRoutes);
router.use('/health', healthRoutes);
router.use('/expenses', expenseRoutes);
router.use('/settings', settingsRoutes);
router.use('/auth', authRoutes);
router.use('/feed', feedRoutes);

export default router;
