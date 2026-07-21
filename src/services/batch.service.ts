import { batchRepository } from '../repositories/batch.repository';
import { stockRepository } from '../repositories/stock.repository';
import { weightService } from './weight.service';
import { healthService } from './health.service';
import { withTransaction } from '../config/database';
import { BatchItem, HealthLogItem } from '../lib/types';

export class BatchService {
  async getAllBatches(): Promise<BatchItem[]> {
    return batchRepository.findAll();
  }

  async getBatchById(id: string): Promise<BatchItem | null> {
    return batchRepository.findById(id);
  }

  async createBatch(batch: Omit<BatchItem, 'cowIds'>): Promise<BatchItem> {
    return batchRepository.create(batch);
  }

  async updateBatch(id: string, updates: Partial<BatchItem>): Promise<BatchItem> {
    return batchRepository.update(id, updates);
  }

  async assignCowsToBatch(batchId: string, cowIds: string[]): Promise<BatchItem> {
    return withTransaction(async (client) => {
      return batchRepository.assignCows(batchId, cowIds, client);
    });
  }

  async removeCowFromBatch(batchId: string, cowId: string): Promise<BatchItem> {
    return batchRepository.removeCow(batchId, cowId);
  }

  async recordBatchWeights(records: { cowId: string; currentWeight: number; healthStatus: string; trackingDate?: string }[]): Promise<void> {
    for (const rec of records) {
      await weightService.addWeightRecord(rec.cowId, rec.currentWeight, rec.healthStatus, rec.trackingDate);
    }
  }

  async recordBatchHealthLog(batchId: string, log: Omit<HealthLogItem, 'id' | 'cowId'>): Promise<HealthLogItem[]> {
    const batch = await batchRepository.findById(batchId);
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }

    const allStock = await stockRepository.findAll();
    const activeCows = allStock.filter(c => batch.cowIds.includes(c.id) && c.status.toLowerCase() === 'active');

    const results: HealthLogItem[] = [];
    for (const cow of activeCows) {
      const addedLog = await healthService.addHealthLog({
        cowId: cow.id,
        ...log
      });
      results.push(addedLog);
    }

    return results;
  }

  async deleteBatch(id: string): Promise<boolean> {
    return batchRepository.delete(id);
  }
}

export const batchService = new BatchService();
