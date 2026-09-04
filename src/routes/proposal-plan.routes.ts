import { Router } from 'express';
import { proposalPlanController } from '../controllers/proposal-plan.controller';

const router = Router();

router.get('/', (req, res, next) => proposalPlanController.get(req, res).catch(next));
router.post('/', (req, res, next) => proposalPlanController.save(req, res).catch(next));

export default router;
