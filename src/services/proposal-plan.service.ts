import { proposalPlanRepository } from '../repositories/proposal-plan.repository';
import { ProposalPlanParams, ProposalPlanRecord } from '../types/proposal.types';

export class ProposalPlanService {
  async getPlan(): Promise<ProposalPlanRecord | null> {
    return proposalPlanRepository.get();
  }

  async savePlan(params: ProposalPlanParams): Promise<ProposalPlanRecord> {
    return proposalPlanRepository.save(params);
  }
}

export const proposalPlanService = new ProposalPlanService();
