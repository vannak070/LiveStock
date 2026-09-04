/**
 * Creates (or updates) a real Super Admin account directly in the `users`
 * table, with a password you choose.
 *
 * This is the deliberate way to bootstrap the very first login. The app no
 * longer invents placeholder accounts when the `users` table is empty, so
 * on a fresh database this script is what gets you in. Every account it
 * creates is a real row in Postgres — nothing is stored anywhere else.
 *
 * Run:
 *   npm run create-admin -- <email> <password> ["Full Name"]
 * or:
 *   npx tsx src/db/migrations/create-admin.ts <email> <password> ["Full Name"]
 */
import { pool, connectWithRetry } from '../../config/database';
import { hashPassword } from '../../lib/password';
import { DEFAULT_ROLE_PERMISSIONS } from '../../lib/types';

const MIN_PASSWORD_LENGTH = 8;

async function run() {
  const [, , email, password, ...nameParts] = process.argv;
  const name = nameParts.join(' ').trim() || 'Administrator';

  if (!email || !password) {
    console.error('Usage: npm run create-admin -- <email> <password> ["Full Name"]');
    process.exit(1);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(`"${email}" is not a valid email address.`);
    process.exit(1);
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    process.exit(1);
  }

  await connectWithRetry(5, 1000);

  // The base schema.sql `users` table predates these two columns (they were
  // added later by add-user-farm-location.ts / migrate-user-permissions.ts).
  // Ensure they exist so this works on a freshly created database too —
  // same self-migrating pattern the repositories use.
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS farm_location VARCHAR(100)`);

  const existing = await pool.query('SELECT id, role FROM users WHERE LOWER(email) = LOWER($1)', [email]);
  const hashed = await hashPassword(password);
  const permissions = JSON.stringify(DEFAULT_ROLE_PERMISSIONS['Super Admin'] || []);

  if (existing.rows.length > 0) {
    // Same email again -> treat as "set this account's password", rather
    // than silently creating a duplicate login.
    const { id } = existing.rows[0];
    await pool.query(
      `UPDATE users SET name = $1, password = $2, role = 'Super Admin', status = 'Active', permissions = $3 WHERE id = $4`,
      [name, hashed, permissions, id]
    );
    console.log(`Updated existing account ${email} — role Super Admin, password set, status Active.`);
  } else {
    // ids in this table are short strings ('1'..'6' historically), so take
    // the next free integer rather than assuming a sequence exists.
    const idRes = await pool.query(`SELECT COALESCE(MAX(NULLIF(id, '')::bigint), 0) + 1 AS next_id FROM users WHERE id ~ '^[0-9]+$'`);
    const nextId = String(idRes.rows[0]?.next_id ?? 1);

    await pool.query(
      `INSERT INTO users (id, name, email, role, status, password, permissions, farm_location)
       VALUES ($1, $2, $3, 'Super Admin', 'Active', $4, $5, NULL)`,
      [nextId, name, email, hashed, permissions]
    );
    console.log(`Created Super Admin account ${email} (id ${nextId}).`);
  }

  const total = await pool.query('SELECT COUNT(*)::int AS n FROM users');
  console.log(`The users table now holds ${total.rows[0].n} account(s). Sign in at http://localhost:3000 with the password you just set.`);
  await pool.end();
}

run().catch(err => {
  console.error('create-admin failed:', err instanceof Error ? err.message : err);
  console.error('If this is a connection error, check DB_HOST/DB_PORT/DB_NAME in .env and that Postgres is running.');
  process.exit(1);
});
