import { pool } from '../config/database';

async function migrate() {
  console.log("=== Running database migration: Add feeding_program to batches table ===");
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE batches
      ADD COLUMN IF NOT EXISTS feeding_program JSONB DEFAULT NULL;
    `);
    console.log("[PostgreSQL] Migration completed successfully.");
  } catch (err: any) {
    console.error("[PostgreSQL Error]", err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
