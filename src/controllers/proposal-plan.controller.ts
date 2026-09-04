import { Request, Response } from 'express';
import { proposalPlanService } from '../services/proposal-plan.service';

export class ProposalPlanController {
  async get(req: Request, res: Response): Promise<void> {
    const plan = await proposalPlanService.getPlan();
    res.status(200).json({ success: true, message: 'Proposal plan retrieved successfully', data: plan });
  }

  async save(req: Request, res: Response): Promise<void> {
    const saved = await proposalPlanService.savePlan(req.body);
    res.status(200).json({ success: true, message: 'Proposal plan saved successfully', data: saved });
  }
}

export const proposalPlanController = new ProposalPlanController();
