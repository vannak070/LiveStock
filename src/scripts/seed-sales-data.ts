import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

interface SalesItem {
  cowId: string;
  breed: string;
  weight: number;
  unitPrice: number;
  totalPrice: number;
  salesDate: string;
}

const salesData: SalesItem[] = [
  { cowId: "C-002", breed: "គោទន្លេ", weight: 286, unitPrice: 9700, totalPrice: 2774200, salesDate: "2026-04-20T00:00:00.000Z" },
  { cowId: "F-12", breed: "គោទន្លេ", weight: 1, unitPrice: 860000, totalPrice: 860000, salesDate: "2026-04-20T00:00:00.000Z" },
  { cowId: "C-004", breed: "គោទន្លេ", weight: 283, unitPrice: 9700, totalPrice: 2745100, salesDate: "2026-04-20T00:00:00.000Z" },
  { cowId: "C-005", breed: "គោទន្លេ", weight: 340, unitPrice: 9700, totalPrice: 3298000, salesDate: "2026-04-20T00:00:00.000Z" },
  { cowId: "C-006", breed: "គោទន្លេ", weight: 252, unitPrice: 9700, totalPrice: 2444400, salesDate: "2026-04-20T00:00:00.000Z" },
  { cowId: "C-007", breed: "គោទន្លេ", weight: 226, unitPrice: 9700, totalPrice: 2192200, salesDate: "2026-04-20T00:00:00.000Z" },
  { cowId: "C-008", breed: "គោទន្លេ", weight: 256, unitPrice: 9700, totalPrice: 2483200, salesDate: "2026-04-20T00:00:00.000Z" },
  { cowId: "C-009", breed: "គោទន្លេ", weight: 257, unitPrice: 9700, totalPrice: 2492900, salesDate: "2026-04-20T00:00:00.000Z" },
  { cowId: "C-011", breed: "គោទន្លេ", weight: 275, unitPrice: 9700, totalPrice: 2667500, salesDate: "2026-04-20T00:00:00.000Z" },
  { cowId: "F-09", breed: "គោទន្លេ", weight: 339, unitPrice: 12000, totalPrice: 4068000, salesDate: "2026-04-30T00:00:00.000Z" },
  { cowId: "F-10", breed: "គោទន្លេ", weight: 358, unitPrice: 11500, totalPrice: 4117000, salesDate: "2026-04-30T00:00:00.000Z" },
  { cowId: "F-11", breed: "គោទន្លេ", weight: 337, unitPrice: 11500, totalPrice: 3875500, salesDate: "2026-04-30T00:00:00.000Z" },
  { cowId: "F-00", breed: "គោទន្លេ", weight: 1, unitPrice: 4100000, totalPrice: 4100000, salesDate: "2026-04-23T00:00:00.000Z" },
  { cowId: "F-01", breed: "គោទន្លេ", weight: 1, unitPrice: 1000000, totalPrice: 1000000, salesDate: "2026-05-18T00:00:00.000Z" },
  { cowId: "F-06", breed: "គោទន្លេ", weight: 156, unitPrice: 11000, totalPrice: 1716000, salesDate: "2026-05-29T00:00:00.000Z" },
  { cowId: "F-07", breed: "គោទន្លេ", weight: 118, unitPrice: 11000, totalPrice: 1298000, salesDate: "2026-05-29T00:00:00.000Z" },
  { cowId: "F-08", breed: "គោទន្លេ", weight: 70, unitPrice: 11000, totalPrice: 770000, salesDate: "2026-05-29T00:00:00.000Z" },
  { cowId: "C-018_", breed: "គោទន្លេ", weight: 276, unitPrice: 13200, totalPrice: 3643200, salesDate: "2026-06-08T00:00:00.000Z" },
  { cowId: "C-013_", breed: "គោទន្លេ", weight: 327, unitPrice: 13200, totalPrice: 4316400, salesDate: "2026-06-08T00:00:00.000Z" }
];

async function seedSales() {
  console.log("=== Seeding Revenue of Sales Dataset ===");

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Clear old sales records
    await client.query('DELETE FROM sales_tracking');

    for (const s of salesData) {
      // 1. Insert into sales_tracking
      await client.query(
        `INSERT INTO sales_tracking (cow_id, breed, weight, unit_price, total_price, sales_date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [s.cowId, s.breed, s.weight, s.unitPrice, s.totalPrice, new Date(s.salesDate)]
      );

      // 2. Set cow status to Sold in stock table
      await client.query(
        `UPDATE stock SET status = 'Sold' WHERE id = $1`,
        [s.cowId]
      );
    }

    await client.query('COMMIT');
    console.log(`[PostgreSQL] Seeded ${salesData.length} sales items into database successfully.`);
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error("[PostgreSQL Error]", err.message);
  } finally {
    client.release();
  }

  // Update db.json
  const dbPath = path.join(process.cwd(), 'src/data/db.json');
  let data: any = {};
  if (fs.existsSync(dbPath)) {
    data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }
  
  data.sales = salesData.map((s, idx) => ({
    id: `SALE-${String(idx + 1).padStart(3, '0')}`,
    cowId: s.cowId,
    salePrice: s.totalPrice,
    saleDate: s.salesDate.split('T')[0],
    weight: s.weight,
    buyerName: 'System Import',
    notes: `System seeded revenue sale for ${s.cowId}`
  }));

  // Update status in db.json stock items as well
  if (data.stock) {
    data.stock = data.stock.map((item: any) => {
      if (salesData.some(s => s.cowId === item.id)) {
        return { ...item, status: 'Sold' };
      }
      return item;
    });
  }

  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`[db.json] Updated sales database cache.`);
  process.exit(0);
}

seedSales();
