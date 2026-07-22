import { pool, connectWithRetry } from '../../config/database';
import { DEFAULT_ROLE_PERMISSIONS } from '../../types/settings.types';
import { SettingsRepository } from '../../repositories/settings.repository';

async function updateDefaultRolesAndUsers() {
  console.log("=== ⚙️ Updating Default User Roles & Permissions ===");

  await connectWithRetry(5, 1000);
  const client = await pool.connect();
  const repo = new SettingsRepository();

  try {
    await client.query('BEGIN');

    // 1. Wipe current users and master_settings to reload fresh schema configurations
    console.log('[Update Roles] Clearing master_settings and users tables...');
    await client.query("DELETE FROM master_settings WHERE key = 'master_setup'");
    await client.query("DELETE FROM users");

    await client.query('COMMIT');
    console.log('[Update Roles] Wiped database records successfully.');

    // 2. Fetch via repository to initialize defaults automatically
    const settings = await repo.getSettings();
    console.log('[Update Roles] Re-seeded settings and users successfully.');
    console.log(`Roles: ${settings.roles?.map(r => r.name).join(', ')}`);
    console.log(`Users: ${settings.users.map(u => `${u.name} (${u.role})`).join(', ')}`);

  } catch (error: unknown) {
    await client.query('ROLLBACK');
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Update Roles Error] Failed to update roles in DB:', msg);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

updateDefaultRolesAndUsers().catch(err => {
  console.error("Fatal error during update-roles:", err);
  process.exit(1);
});
