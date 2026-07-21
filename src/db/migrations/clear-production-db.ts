import { pool, connectWithRetry } from '../../config/database';

async function clearProductionDatabase() {
  console.log("=== 🧹 Clearing Production Database ===");

  await connectWithRetry(5, 1000);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('[Clear DB] Truncating operational data tables...');
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

    console.log('[Clear DB] Operational data cleared successfully.');

    await client.query('COMMIT');
    console.log('=== ✅ Production Database Reset Completed! ===');
    console.log('All cattle inventory, weight logs, sales, health logs, batches, and expenses have been cleared.');
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
