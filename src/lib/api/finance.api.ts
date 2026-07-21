import { apiFetch } from './api-client';
import { ExpenseItem } from '../../types';

export const financeApi = {
  getAllExpenses: () => apiFetch<ExpenseItem[]>('/expenses'),
  createExpense: (expense: Omit<ExpenseItem, 'id'>) => apiFetch<ExpenseItem>('/expenses', { method: 'POST', body: JSON.stringify(expense) }),
  updateExpense: (id: string, updates: Partial<ExpenseItem>) => apiFetch<ExpenseItem>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteExpense: (id: string) => apiFetch<void>(`/expenses/${id}`, { method: 'DELETE' })
};
