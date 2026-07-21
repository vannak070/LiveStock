import * as fs from 'fs';
import * as path from 'path';
import { parseExcelDatabase } from '../../lib/xlsx-parser';
import { pool, connectWithRetry } from '../../config/database';
import { getDbData } from '../../lib/db';

const excelPath = "/Users/vannakath/Documents/Documents - Vannak’s MacBook Pro/Personal Info/SNR Farm/Sales Report/Update/Sale Tracking.xlsx";
const dbDir = path.join(__dirname, '../../data');
const dbPath = path.join(dbDir, 'db.json');

async function initDatabase() {
  console.log("=== Livestock ERP Database Initializer ===");
  
  if (fs.existsSync(excelPath)) {
    console.log("Found local Excel database file, parsing...");
    try {
      const data = parseExcelDatabase(excelPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      console.log(`Database initialized from Excel and saved to ${dbPath}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("Could not parse Excel database, falling back to existing db.json:", msg);
    }
  } else {
    console.log("Local Excel path not found. Using existing db.json database...");
  }

  // Ensure DB connection and run DDL Schema
  await connectWithRetry(5, 1000);
  const schemaPath = path.join(__dirname, '../schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('[Init DB] Executing DDL Schema in schema.sql...');
    await pool.query(schemaSql);
    console.log('[Init DB] DDL Schema applied successfully.');
  }

  // Load JSON database data
  const data = await getDbData();
  console.log(`[Init DB] Loaded db.json - Stock: ${data.stock.length}, Weight: ${data.weightTracking.length}, Sales: ${data.salesTracking.length}`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Master Settings
    console.log('[Init DB] Populating master_settings...');
    await client.query(
      'INSERT INTO master_settings (key, data) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET data = $2',
      ['master_setup', JSON.stringify(data.settings)]
    );

    // 2. Users
    console.log('[Init DB] Populating users...');
    for (const u of data.settings.users || []) {
      await client.query(
        `INSERT INTO users (id, name, email, role, status, password)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET name=$2, email=$3, role=$4, status=$5, password=$6`,
        [u.id, u.name, u.email, u.role, u.status || 'Active', u.password || 'password123']
      );
    }

    // 3. Stock
    console.log('[Init DB] Populating stock table...');
    for (const s of data.stock) {
      await client.query(
        `INSERT INTO stock (
          id, no, breed, sex, age, weight, owner_name, location, phone, buy_type,
          unit_price, total_price, health_status, status, purchase_date, remark, purchase_type, payment_method
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO UPDATE SET
          no=$2, breed=$3, sex=$4, age=$5, weight=$6, owner_name=$7, location=$8, phone=$9, buy_type=$10,
          unit_price=$11, total_price=$12, health_status=$13, status=$14, purchase_date=$15, remark=$16, purchase_type=$17, payment_method=$18`,
        [
          s.id, s.no || '', s.breed || '', s.sex || '', s.age || '', s.weight || 0,
          s.ownerName || '', s.location || '', s.phone || '', s.buyType || '',
          s.unitPrice || 0, s.totalPrice || 0, s.healthStatus || 'Good', s.status || 'Active',
          s.purchaseDate ? new Date(s.purchaseDate) : null, s.remark || '', s.purchaseType || '', s.paymentMethod || ''
        ]
      );
    }

    await client.query('COMMIT');
    console.log('[Init DB] Database initialization completed successfully.');
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Init DB Error] Failed during database seeding:', msg);
    throw error;
  } finally {
    client.release();
  }
}

initDatabase().then(() => {
  process.exit(0);
}).catch(err => {
  console.error("Fatal error during database init:", err);
  process.exit(1);
});
