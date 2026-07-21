import { query } from '../../config/database';

async function migrateUserPermissions() {
  console.log('=== Running database migration: Add permissions column to users table ===');
  try {
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;
    `);
    console.log('[PostgreSQL Migration] Successfully added permissions JSONB column to users table.');
    process.exit(0);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[PostgreSQL Migration Error] Migration failed:', errorMsg);
    process.exit(1);
  }
}

migrateUserPermissions();
