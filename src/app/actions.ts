'use server';

import { 
  getDbData, 
  addStockItem, 
  updateStockItem, 
  addWeightRecord, 
  recordSale,
  recordBatchSale,
  updateSettings,
  createBatch,
  assignCowsToBatch,
  addHealthLog,
  addExpense,
  updateExpense,
  deleteExpense,
  removeCowFromBatch,
  updateBatch,
  recordBatchWeights,
  recordBatchHealthLog,
  deleteStockItem,
  deleteBatch,
  deleteHealthLog,
  updateHealthLog,
  deleteWeightRecord,
  updateWeightRecord,
  deleteSalesRecord,
  updateSalesRecord,
  updateStockLocation,
  saveFeedProduct,
  deleteFeedProduct,
  addFeedTransaction,
  saveProposalPlan
} from '@/lib/db';
import { StockItem, WeightRecord, SalesRecord } from '@/lib/xlsx-parser';
import { MasterSetup, BatchItem, HealthLogItem, ExpenseItem, FeedProductItem, FeedStockTransaction, ProposalPlanParams } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { authService } from '@/services/auth.service';
import { requireSessionActor, startSession, endSession } from '@/lib/session';
import { scopeDataForActor } from '@/lib/data-scope';

// Every action below is a public endpoint as far as the network is
// concerned, so each one checks the caller's session and permissions itself
// before touching the database.

export async function loginAction(email: string, password: string) {
  try {
    const { user } = await authService.login(email, password);
    await startSession(user);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Invalid email or password.' };
  }
}

export async function logoutAction() {
  await endSession();
  return { success: true };
}

export async function getLivestockDataAction() {
  try {
    const actor = await requireSessionActor();
    const data = scopeDataForActor(await getDbData(), actor);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, status: error.statusCode as number | undefined, error: error.message || 'Failed to fetch livestock data' };
  }
}

export async function addStockItemAction(item: Omit<StockItem, 'no'>) {
  try {
    await requireSessionActor('stock_create');
    const newItem = await addStockItem(item);
    revalidatePath('/');
    return { success: true, data: newItem };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add stock item' };
  }
}

export async function updateStockItemAction(id: string, updates: Partial<StockItem>) {
  try {
    await requireSessionActor('stock_edit');
    const updated = await updateStockItem(id, updates);
    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update stock item' };
  }
}

export async function updateStockLocationAction(oldLocation: string, newLocation: string) {
  try {
    await requireSessionActor('farms_manage', 'settings_manage');
    await updateStockLocation(oldLocation, newLocation);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update stock location' };
  }
}

export async function addWeightRecordAction(cowId: string, currentWeight: number, healthStatus: string, trackingDate?: string) {
  try {
    await requireSessionActor('weight_record');
    const record = await addWeightRecord(cowId, currentWeight, healthStatus, trackingDate);
    revalidatePath('/');
    return { success: true, data: record };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add weight record' };
  }
}

export async function recordSaleAction(cowId: string, unitPrice: number, saleType: 'Weight' | 'Lumpsum', salesDate?: string, buyer?: string) {
  try {
    await requireSessionActor('sales_record');
    const record = await recordSale(cowId, unitPrice, saleType, salesDate, buyer);
    revalidatePath('/');
    return { success: true, data: record };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record sale' };
  }
}

export async function recordBatchSaleAction(batchId: string, unitPrice: number, saleType: 'Weight' | 'Lumpsum', salesDate?: string) {
  try {
    await requireSessionActor('sales_record');
    const records = await recordBatchSale(batchId, unitPrice, saleType, salesDate);
    revalidatePath('/');
    return { success: true, data: records };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record batch sale' };
  }
}

export async function updateSettingsAction(settings: MasterSetup) {
  try {
    // Which parts of settings this user may change is checked section by
    // section inside the settings service.
    const actor = await requireSessionActor();
    const res = await updateSettings(settings, actor);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update setup configurations' };
  }
}

export async function createBatchAction(batch: Omit<BatchItem, 'cowIds'>) {
  try {
    await requireSessionActor('batch_create');
    const res = await createBatch(batch);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create batch' };
  }
}

export async function assignCowsToBatchAction(batchId: string, cowIds: string[]) {
  try {
    await requireSessionActor('batch_edit');
    const res = await assignCowsToBatch(batchId, cowIds);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to assign cows' };
  }
}

export async function addHealthLogAction(log: Omit<HealthLogItem, 'id'>) {
  try {
    await requireSessionActor('health_record');
    const res = await addHealthLog(log);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add medical/vaccination log' };
  }
}

// feed_manage too: the feed screen can post a feed purchase straight to expenses.
export async function addExpenseAction(expense: Omit<ExpenseItem, 'id'>) {
  try {
    await requireSessionActor('expenses_record', 'feed_manage');
    const res = await addExpense(expense);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record expense' };
  }
}

export async function updateExpenseAction(expenseId: string, updates: Partial<ExpenseItem>) {
  try {
    await requireSessionActor('expenses_record');
    const res = await updateExpense(expenseId, updates);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update expense record' };
  }
}

export async function deleteExpenseAction(expenseId: string) {
  try {
    await requireSessionActor('expenses_delete');
    await deleteExpense(expenseId);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete expense record' };
  }
}

export async function removeCowFromBatchAction(batchId: string, cowId: string) {
  try {
    await requireSessionActor('batch_edit');
    const res = await removeCowFromBatch(batchId, cowId);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove cow from batch' };
  }
}

export async function updateBatchAction(batchId: string, updates: Partial<BatchItem>) {
  try {
    await requireSessionActor('batch_edit');
    const res = await updateBatch(batchId, updates);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update batch details' };
  }
}

export async function recordBatchWeightsAction(records: { cowId: string; currentWeight: number; healthStatus: string; trackingDate?: string }[]) {
  try {
    await requireSessionActor('weight_record');
    await recordBatchWeights(records);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record batch weights' };
  }
}

export async function recordBatchHealthLogAction(batchId: string, log: Omit<HealthLogItem, 'id' | 'cowId'>) {
  try {
    await requireSessionActor('health_record');
    const records = await recordBatchHealthLog(batchId, log);
    revalidatePath('/');
    return { success: true, data: records };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record batch health log' };
  }
}

export async function deleteStockItemAction(cowId: string) {
  try {
    await requireSessionActor('stock_delete');
    await deleteStockItem(cowId);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete stock item' };
  }
}

export async function deleteBatchAction(batchId: string) {
  try {
    await requireSessionActor('batch_delete');
    await deleteBatch(batchId);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete batch' };
  }
}

export async function deleteHealthLogAction(logId: string) {
  try {
    await requireSessionActor('health_delete');
    await deleteHealthLog(logId);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete health log' };
  }
}

export async function updateHealthLogAction(logId: string, updates: Partial<HealthLogItem>) {
  try {
    await requireSessionActor('health_record');
    const res = await updateHealthLog(logId, updates);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update health log' };
  }
}

export async function deleteWeightRecordAction(cowId: string, trackingDate: string) {
  try {
    await requireSessionActor('weight_delete');
    await deleteWeightRecord(cowId, trackingDate);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete weight record' };
  }
}

export async function updateWeightRecordAction(cowId: string, trackingDate: string, currentWeight: number, healthStatus: string) {
  try {
    await requireSessionActor('weight_record');
    await updateWeightRecord(cowId, trackingDate, currentWeight, healthStatus);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update weight record' };
  }
}

export async function deleteSalesRecordAction(cowId: string) {
  try {
    await requireSessionActor('sales_delete');
    await deleteSalesRecord(cowId);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete sales record' };
  }
}

export async function updateSalesRecordAction(cowId: string, updates: Partial<SalesRecord>) {
  try {
    await requireSessionActor('sales_record');
    const res = await updateSalesRecord(cowId, updates);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update sales record' };
  }
}

export async function saveFeedProductAction(product: FeedProductItem) {
  try {
    await requireSessionActor('feed_manage');
    const res = await saveFeedProduct(product);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save feed product' };
  }
}

export async function deleteFeedProductAction(productId: string) {
  try {
    await requireSessionActor('feed_manage');
    await deleteFeedProduct(productId);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete feed product' };
  }
}

export async function addFeedTransactionAction(tx: FeedStockTransaction) {
  try {
    await requireSessionActor('feed_manage');
    const res = await addFeedTransaction(tx);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add feed transaction' };
  }
}

export async function saveProposalPlanAction(params: ProposalPlanParams) {
  try {
    await requireSessionActor('analytics_view');
    const res = await saveProposalPlan(params);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save proposal plan' };
  }
}
