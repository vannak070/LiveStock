import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';
import { StockItem } from '../lib/xlsx-parser';

const stockData: StockItem[] = [
  { id: "F-12", no: "01", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 258, ownerName: "បងវ័រ", location: "រទាំង", phone: "N/A", buyType: "Lumsum", unitPrice: 3050001, totalPrice: 3050001, healthStatus: "Dead", status: "Sold", purchaseDate: "2026-04-08T00:00:00.000Z", remark: "" },
  { id: "F-00", no: "02", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 386, ownerName: "បងព្រៃវែង", location: "ព្រៃវែង", phone: "N/A", buyType: "Lumsum", unitPrice: 2987500, totalPrice: 2987500, healthStatus: "Good", status: "Sold", purchaseDate: "2026-04-08T00:00:00.000Z", remark: "" },
  { id: "F-09", no: "03", breed: "គោទន្លេ", sex: "M", age: "N/A", weight: 339, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Sold", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "F-10", no: "04", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 358, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Sold", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "F-11", no: "05", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 337, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Sold", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "F-01", no: "26", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 335, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Dead", status: "Sold", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "C-002", no: "06", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 258, ownerName: "បងវ័រ", location: "រទាំង", phone: "N/A", buyType: "Lumsum", unitPrice: 3050000, totalPrice: 3050000, healthStatus: "Good", status: "Sold", purchaseDate: "2026-04-08T00:00:00.000Z", remark: "" },
  { id: "C-004", no: "07", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 271, ownerName: "បងវ័រ", location: "រទាំង", phone: "N/A", buyType: "Lumsum", unitPrice: 3050000, totalPrice: 3050000, healthStatus: "Good", status: "Sold", purchaseDate: "2026-04-08T00:00:00.000Z", remark: "" },
  { id: "C-005", no: "08", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 337, ownerName: "បងព្រៃវែង", location: "ព្រៃវែង", phone: "N/A", buyType: "Lumsum", unitPrice: 2987500, totalPrice: 2987500, healthStatus: "Good", status: "Sold", purchaseDate: "2026-04-08T00:00:00.000Z", remark: "" },
  { id: "C-006", no: "09", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 226, ownerName: "បងព្រៃវែង", location: "ព្រៃវែង", phone: "N/A", buyType: "Lumsum", unitPrice: 2987500, totalPrice: 2987500, healthStatus: "Good", status: "Sold", purchaseDate: "2026-04-08T00:00:00.000Z", remark: "" },
  { id: "C-007", no: "10", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 207, ownerName: "បងព្រៃវែង", location: "ព្រៃវែង", phone: "N/A", buyType: "Lumsum", unitPrice: 2987500, totalPrice: 2987500, healthStatus: "Good", status: "Sold", purchaseDate: "2026-04-08T00:00:00.000Z", remark: "" },
  { id: "C-008", no: "11", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 228, ownerName: "បងព្រៃវែង", location: "ព្រៃវែង", phone: "N/A", buyType: "Lumsum", unitPrice: 2987500, totalPrice: 2987500, healthStatus: "Good", status: "Sold", purchaseDate: "2026-04-08T00:00:00.000Z", remark: "" },
  { id: "C-009", no: "12", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 248, ownerName: "បងព្រៃវែង", location: "ព្រៃវែង", phone: "N/A", buyType: "Lumsum", unitPrice: 2987500, totalPrice: 2987500, healthStatus: "Good", status: "Sold", purchaseDate: "2026-04-08T00:00:00.000Z", remark: "" },
  { id: "C-011", no: "13", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 253, ownerName: "បងព្រៃវែង", location: "ព្រៃវែង", phone: "N/A", buyType: "Lumsum", unitPrice: 2987500, totalPrice: 2987500, healthStatus: "Good", status: "Sold", purchaseDate: "2026-04-08T00:00:00.000Z", remark: "" },
  { id: "C-013", no: "14", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 245, ownerName: "បងវ័រ", location: "រទាំង", phone: "N/A", buyType: "Lumsum", unitPrice: 3050000, totalPrice: 3050000, healthStatus: "Good", status: "Active", purchaseDate: "2026-04-08T00:00:00.000Z", remark: "" },
  { id: "C-010", no: "15", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 226, ownerName: "បងព្រៃវែង", location: "ព្រៃវែង", phone: "N/A", buyType: "Lumsum", unitPrice: 2987500, totalPrice: 2987500, healthStatus: "Good", status: "Active", purchaseDate: "2026-04-08T00:00:00.000Z", remark: "" },
  { id: "C-003", no: "16", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 264, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Active", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "C-012", no: "17", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 322, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Active", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "C-013_", no: "18", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 315, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Sold", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "C-014", no: "19", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 349, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Active", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "C-015", no: "20", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 250, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Active", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "C-016", no: "21", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 235, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Active", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "C-017", no: "22", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 290, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Active", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "C-018_", no: "23", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 241, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Sold", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "C-019", no: "24", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 257, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Active", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "C-020", no: "25", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 226, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Active", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "C-018", no: "27", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 196, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Active", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "C-021", no: "28", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 227, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Active", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "C-022", no: "29", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 230, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Active", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "C-001", no: "30", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 150, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Active", purchaseDate: "2026-04-23T00:00:00.000Z", remark: "" },
  { id: "F-06", no: "31", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 134, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Sold", purchaseDate: "2026-04-24T00:00:00.000Z", remark: "" },
  { id: "F-07", no: "32", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 106, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Sold", purchaseDate: "2026-04-25T00:00:00.000Z", remark: "" },
  { id: "F-08", no: "33", breed: "គោទន្លេ", sex: "F", age: "N/A", weight: 51, ownerName: "ពូបន្ទាយមានជ័យ", location: "បន្ទាយមានជ័យ", phone: "N/A", buyType: "Lumsum", unitPrice: 2628500, totalPrice: 2628500, healthStatus: "Good", status: "Sold", purchaseDate: "2026-04-26T00:00:00.000Z", remark: "" }
];

async function updateStock() {
  console.log("=== Updating Stock Dataset in PostgreSQL & db.json ===");

  // 1. Update PostgreSQL
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Clear old stock records or upsert
    for (const s of stockData) {
      await client.query(
        `INSERT INTO stock (
          id, no, breed, sex, age, weight, owner_name, location, phone, buy_type,
          unit_price, total_price, health_status, status, purchase_date, remark
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          no = $2, breed = $3, sex = $4, age = $5, weight = $6, owner_name = $7,
          location = $8, phone = $9, buy_type = $10, unit_price = $11, total_price = $12,
          health_status = $13, status = $14, purchase_date = $15, remark = $16`,
        [
          s.id, s.no, s.breed, s.sex, s.age, s.weight, s.ownerName, s.location, s.phone,
          s.buyType, s.unitPrice, s.totalPrice, s.healthStatus, s.status,
          s.purchaseDate ? new Date(s.purchaseDate) : null, s.remark || ''
        ]
      );
    }

    await client.query('COMMIT');
    console.log(`[PostgreSQL] Upserted ${stockData.length} stock items into database successfully.`);
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error("[PostgreSQL Error]", err.message);
  } finally {
    client.release();
  }

  // 2. Update db.json
  const dbPath = path.join(process.cwd(), 'src/data/db.json');
  let data: any = {};
  if (fs.existsSync(dbPath)) {
    data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }
  data.stock = stockData;
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`[db.json] Updated db.json with ${stockData.length} stock records.`);
  process.exit(0);
}

updateStock();
