import { apiFetch } from './api-client';
import { StockItem, WeightRecord, SalesRecord } from '../../types';

export const stockApi = {
  getAllStock: () => apiFetch<StockItem[]>('/stock'),
  createStock: (item: Partial<StockItem>) => apiFetch<StockItem>('/stock', { method: 'POST', body: JSON.stringify(item) }),
  getById: (id: string) => apiFetch<StockItem>(`/stock/${id}`),
  updateStock: (id: string, updates: Partial<StockItem>) => apiFetch<StockItem>(`/stock/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteStock: (id: string) => apiFetch<void>(`/stock/${id}`, { method: 'DELETE' }),

  getAllWeightRecords: () => apiFetch<WeightRecord[]>('/weight'),
  addWeightRecord: (data: { cowId: string; currentWeight: number; healthStatus: string; trackingDate?: string }) =>
    apiFetch<WeightRecord>('/weight', { method: 'POST', body: JSON.stringify(data) }),

  getAllSales: () => apiFetch<SalesRecord[]>('/sales'),
  recordSale: (data: { cowId: string; unitPrice: number; saleType: string; salesDate?: string; buyer?: string }) =>
    apiFetch<SalesRecord>('/sales', { method: 'POST', body: JSON.stringify(data) })
};
