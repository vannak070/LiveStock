import { pool, connectWithRetry } from '../../config/database';

async function clearStockOnly() {
  console.log("=== 🧹 Clearing Cattle Inventory Only ===");

  await connectWithRetry(5, 1000);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('[Clear Stock] Truncating stock, batch_cows, and weight_tracking tables...');
    await client.query(`
      TRUNCATE TABLE 
        batch_cows,
        weight_tracking,
        stock
      RESTART IDENTITY CASCADE;
    `);

    await client.query('COMMIT');
    console.log('=== ✅ Cattle Inventory Cleared Successfully! ===');
    console.log('All cattle inventory stock items and weight tracking logs have been wiped.');
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Clear Stock Error] Failed to clear stock inventory:', msg);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

clearStockOnly().catch(err => {
  console.error("Fatal error during clear-stock:", err);
  process.exit(1);
});
