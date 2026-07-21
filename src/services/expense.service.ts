import { expenseRepository } from '../repositories/expense.repository';
import { ExpenseItem } from '../lib/types';

export class ExpenseService {
  async getAllExpenses(): Promise<ExpenseItem[]> {
    return expenseRepository.findAll();
  }

  async getExpenseById(id: string): Promise<ExpenseItem | null> {
    return expenseRepository.findById(id);
  }

  async addExpense(expense: Omit<ExpenseItem, 'id'>): Promise<ExpenseItem> {
    return expenseRepository.create(expense);
  }

  async updateExpense(id: string, updates: Partial<ExpenseItem>): Promise<ExpenseItem> {
    return expenseRepository.update(id, updates);
  }

  async deleteExpense(id: string): Promise<boolean> {
    return expenseRepository.delete(id);
  }
}

export const expenseService = new ExpenseService();
