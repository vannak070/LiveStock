import { apiFetch } from './api-client';
import { BatchItem } from '../../types';

export const batchApi = {
  getAllBatches: () => apiFetch<BatchItem[]>('/batches'),
  createBatch: (batch: Partial<BatchItem>) => apiFetch<BatchItem>('/batches', { method: 'POST', body: JSON.stringify(batch) }),
  getById: (id: string) => apiFetch<BatchItem>(`/batches/${id}`),
  updateBatch: (id: string, updates: Partial<BatchItem>) => apiFetch<BatchItem>(`/batches/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  assignCows: (id: string, cowIds: string[]) => apiFetch<BatchItem>(`/batches/${id}/assign`, { method: 'POST', body: JSON.stringify({ cowIds }) }),
  removeCow: (id: string, cowId: string) => apiFetch<BatchItem>(`/batches/${id}/cows/${cowId}`, { method: 'DELETE' }),
  deleteBatch: (id: string) => apiFetch<void>(`/batches/${id}`, { method: 'DELETE' })
};
