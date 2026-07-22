import { query } from '../config/database';
import { ExpenseItem } from '../lib/types';
import { PoolClient } from 'pg';

export class ExpenseRepository {
  private async executeQuery(sql: string, params?: any[], client?: PoolClient) {
    if (client) {
      return client.query(sql, params);
    }
    return query(sql, params);
  }

  private mapRowToExpense(row: any): ExpenseItem {
    return {
      id: row.id,
      category: row.category,
      amount: parseFloat(row.amount || 0),
      date: row.date ? new Date(row.date).toISOString() : new Date().toISOString(),
      description: row.description || '',
      farmLocation: row.farm_location || undefined
    };
  }

  async findAll(): Promise<ExpenseItem[]> {
    const res = await query('SELECT * FROM expenses ORDER BY date DESC');
    return res.rows.map(row => this.mapRowToExpense(row));
  }

  async findById(id: string): Promise<ExpenseItem | null> {
    const res = await query('SELECT * FROM expenses WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return this.mapRowToExpense(res.rows[0]);
  }

  async create(expense: Omit<ExpenseItem, 'id'> & { id?: string; farmLocation?: string }, client?: PoolClient): Promise<ExpenseItem> {
    const id = expense.id || `EXP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const sql = `
      INSERT INTO expenses (id, category, amount, date, description, farm_location)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [
      id,
      expense.category,
      expense.amount || 0,
      expense.date ? new Date(expense.date) : new Date(),
      expense.description || '',
      expense.farmLocation || null
    ];

    const res = await this.executeQuery(sql, params, client);
    return this.mapRowToExpense(res.rows[0]);
  }

  async update(id: string, updates: Partial<ExpenseItem>, client?: PoolClient): Promise<ExpenseItem> {
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (updates.category !== undefined) { fields.push(`category = $${idx++}`); params.push(updates.category); }
    if (updates.amount !== undefined) { fields.push(`amount = $${idx++}`); params.push(updates.amount); }
    if (updates.date !== undefined) { fields.push(`date = $${idx++}`); params.push(new Date(updates.date)); }
    if (updates.description !== undefined) { fields.push(`description = $${idx++}`); params.push(updates.description); }
    if (updates.farmLocation !== undefined) { fields.push(`farm_location = $${idx++}`); params.push(updates.farmLocation || null); }

    if (fields.length === 0) {
      const existing = await this.findById(id);
      if (!existing) throw new Error(`Expense record ${id} not found`);
      return existing;
    }

    params.push(id);
    const sql = `UPDATE expenses SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await this.executeQuery(sql, params, client);
    if (res.rows.length === 0) throw new Error(`Expense record ${id} not found`);

    return this.mapRowToExpense(res.rows[0]);
  }

  async delete(id: string, client?: PoolClient): Promise<boolean> {
    const res = await this.executeQuery('DELETE FROM expenses WHERE id = $1 RETURNING id', [id], client);
    return res.rows.length > 0;
  }
}

export const expenseRepository = new ExpenseRepository();
