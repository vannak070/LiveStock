/**
 * ONE-TIME MIGRATION: hash any plaintext passwords left in the `users`
 * table from before bcrypt hashing was introduced. Safe to re-run — rows
 * that are already a bcrypt hash are left untouched.
 *
 * Run:  npx tsx src/db/migrations/hash-existing-passwords.ts
 */
import { pool, connectWithRetry } from '../../config/database';
import { hashPassword, isBcryptHash } from '../../lib/password';

async function run() {
  console.log('=== Hashing any plaintext passwords in users table ===');
  await connectWithRetry(5, 2000);
  const client = await pool.connect();

  try {
    const res = await client.query('SELECT id, email, password FROM users');
    let migrated = 0;

    for (const row of res.rows) {
      if (!row.password || isBcryptHash(row.password)) continue;
      const hashed = await hashPassword(row.password);
      await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, row.id]);
      console.log(`  - hashed password for ${row.email}`);
      migrated++;
    }

    if (migrated === 0) {
      console.log('No plaintext passwords found — nothing to do.');
    } else {
      console.log(`Done. Hashed ${migrated} password(s).`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
