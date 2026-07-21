import { Request, Response } from 'express';
import { expenseService } from '../services/expense.service';

export class ExpenseController {
  async getAll(req: Request, res: Response): Promise<void> {
    const expenses = await expenseService.getAllExpenses();
    res.status(200).json({
      success: true,
      message: 'Expenses retrieved successfully',
      data: expenses
    });
  }

  async create(req: Request, res: Response): Promise<void> {
    const expense = await expenseService.addExpense(req.body);
    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: expense
    });
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const updated = await expenseService.updateExpense(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: updated
    });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await expenseService.deleteExpense(id);
    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: null
    });
  }
}

export const expenseController = new ExpenseController();
