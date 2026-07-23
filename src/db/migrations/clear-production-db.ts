import fs from 'fs';
import path from 'path';
import { pool, connectWithRetry } from '../../config/database';

async function clearProductionDatabase() {
  console.log("=== 🧹 Clearing Production Database & JSON DB ===");

  await connectWithRetry(5, 1000);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('[Clear DB] Truncating PostgreSQL operational data tables...');
    await client.query(`
      TRUNCATE TABLE 
        batch_cows,
        weight_tracking,
        sales_tracking,
        health_logs,
        expenses,
        stock,
        batches
      RESTART IDENTITY CASCADE;
    `);

    await client.query('COMMIT');
    console.log('[Clear DB] PostgreSQL operational data cleared successfully.');

    const jsonPath = path.resolve(process.cwd(), 'src/data/db.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const raw = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(raw);
        data.stock = [];
        data.weightTracking = [];
        data.salesTracking = [];
        data.batches = [];
        data.healthLogs = [];
        data.expenses = [];
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
        console.log('[Clear DB] JSON DB reset successfully.');
      } catch (e) {
        console.warn('JSON DB clear notice:', e);
      }
    }

    console.log('=== ✅ Production Database & JSON DB Reset Completed! ===');
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Clear DB Error] Failed to clear database:', msg);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

clearProductionDatabase().catch(err => {
  console.error("Fatal error during clear-db:", err);
  process.exit(1);
});
