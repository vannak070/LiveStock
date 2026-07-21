import { query } from '../config/database';
import { SalesRecord } from '../lib/xlsx-parser';
import { PoolClient } from 'pg';

export class SalesRepository {
  private async executeQuery(sql: string, params?: any[], client?: PoolClient) {
    if (client) {
      return client.query(sql, params);
    }
    return query(sql, params);
  }

  private mapRowToSalesRecord(row: any): SalesRecord {
    return {
      cowId: row.cow_id,
      breed: row.breed || '',
      age: row.age || '',
      weight: parseFloat(row.weight || 0),
      unitPrice: parseFloat(row.unit_price || 0),
      totalPrice: parseFloat(row.total_price || 0),
      status: row.status || 'Sold',
      salesDate: row.sales_date ? new Date(row.sales_date).toISOString() : null,
      saleType: row.sale_type || '',
      buyer: row.buyer || ''
    };
  }

  async findAll(): Promise<SalesRecord[]> {
    const res = await query('SELECT * FROM sales_tracking ORDER BY sales_date DESC');
    return res.rows.map(row => this.mapRowToSalesRecord(row));
  }

  async findByCowId(cowId: string): Promise<SalesRecord | null> {
    const res = await query('SELECT * FROM sales_tracking WHERE cow_id = $1', [cowId]);
    if (res.rows.length === 0) return null;
    return this.mapRowToSalesRecord(res.rows[0]);
  }

  async create(record: SalesRecord, client?: PoolClient): Promise<SalesRecord> {
    const sql = `
      INSERT INTO sales_tracking (
        cow_id, breed, age, weight, unit_price, total_price, status, sales_date, sale_type, buyer
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const params = [
      record.cowId,
      record.breed || '',
      record.age || '',
      record.weight || 0,
      record.unitPrice || 0,
      record.totalPrice || 0,
      record.status || 'Sold',
      record.salesDate ? new Date(record.salesDate) : new Date(),
      record.saleType || 'Lumpsum',
      record.buyer || 'Local Market'
    ];

    const res = await this.executeQuery(sql, params, client);
    return this.mapRowToSalesRecord(res.rows[0]);
  }

  async update(cowId: string, updates: Partial<SalesRecord>, client?: PoolClient): Promise<SalesRecord> {
    const existing = await this.findByCowId(cowId);
    if (!existing) {
      throw new Error(`Sales record for cow ${cowId} not found`);
    }

    const updated = { ...existing, ...updates };

    if (updates.weight !== undefined || updates.unitPrice !== undefined) {
      const weight = updates.weight ?? existing.weight;
      const unitPrice = updates.unitPrice ?? existing.unitPrice;
      updated.totalPrice = updated.saleType === 'Weight' || updated.saleType === 'Scale' ? weight * unitPrice : unitPrice;
    }

    const sql = `
      UPDATE sales_tracking
      SET weight = $1, unit_price = $2, total_price = $3, status = $4, sales_date = $5, sale_type = $6, buyer = $7
      WHERE cow_id = $8
      RETURNING *
    `;
    const params = [
      updated.weight,
      updated.unitPrice,
      updated.totalPrice,
      updated.status,
      updated.salesDate ? new Date(updated.salesDate) : new Date(),
      updated.saleType,
      updated.buyer,
      cowId
    ];

    const res = await this.executeQuery(sql, params, client);
    return this.mapRowToSalesRecord(res.rows[0]);
  }

  async delete(cowId: string, client?: PoolClient): Promise<boolean> {
    const res = await this.executeQuery('DELETE FROM sales_tracking WHERE cow_id = $1 RETURNING id', [cowId], client);
    return res.rows.length > 0;
  }
}

export const salesRepository = new SalesRepository();
