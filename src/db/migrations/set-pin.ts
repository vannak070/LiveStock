/**
 * Grants (or clears) a mobile sign-in PIN for one account, and optionally
 * puts that account on the read-only Management role.
 *
 * A PIN is deliberately weaker than a password — it is short, and it both
 * identifies and authenticates. So it is stored bcrypt-hashed like any other
 * credential, the login endpoint locks out after repeated failures, and this
 * script refuses PINs that would be trivial to guess.
 *
 * Run:
 *   npm run set-pin -- <email> <pin>          grant or change a PIN
 *   npm run set-pin -- <email> --clear        remove PIN sign-in
 *   npm run set-pin -- <email> <pin> --management   also set the role
 */
import { pool, connectWithRetry } from '../../config/database';
import { hashPassword } from '../../lib/password';
import { DEFAULT_ROLE_PERMISSIONS } from '../../lib/types';
import { validatePinStrength } from '../../lib/pin';

async function run() {
  const [, , email, pinArg, ...flags] = process.argv;
  const makeManagement = flags.includes('--management');

  if (!email || !pinArg) {
    console.error('Usage: npm run set-pin -- <email> <pin> [--management]');
    console.error('       npm run set-pin -- <email> --clear');
    process.exit(1);
  }

  await connectWithRetry(5, 1000);
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(255)');

  const existing = await pool.query('SELECT id, name, email, role FROM users WHERE LOWER(email) = LOWER($1)', [email]);
  if (existing.rows.length === 0) {
    console.error(`No account found with email "${email}".`);
    const all = await pool.query('SELECT email, role FROM users ORDER BY created_at ASC');
    all.rows.forEach(r => console.error(`  - ${r.email} (${r.role})`));
    process.exit(1);
  }
  const user = existing.rows[0];

  if (pinArg === '--clear') {
    await pool.query('UPDATE users SET pin_hash = NULL WHERE id = $1', [user.id]);
    console.log(`PIN sign-in removed for ${user.email}. They can still sign in with email and password.`);
    await pool.end();
    return;
  }

  const pin = pinArg.trim();
  const problem = validatePinStrength(pin);
  if (problem) {
    console.error(problem);
    process.exit(1);
  }

  // Reject a PIN already in use: with PIN-only sign-in, a duplicate would
  // make two accounts indistinguishable at login.
  const { verifyPassword } = await import('../../lib/password');
  const others = await pool.query("SELECT id, email, pin_hash FROM users WHERE pin_hash IS NOT NULL AND pin_hash <> ''");
  for (const o of others.rows) {
    if (o.id !== user.id && await verifyPassword(pin, o.pin_hash)) {
      console.error(`That PIN is already used by ${o.email}. Every PIN must be unique.`);
      process.exit(1);
    }
  }

  const hashed = await hashPassword(pin);
  if (makeManagement) {
    const perms = JSON.stringify(DEFAULT_ROLE_PERMISSIONS['Management'] || []);
    await pool.query("UPDATE users SET pin_hash = $1, role = 'Management', permissions = $2 WHERE id = $3", [hashed, perms, user.id]);
    console.log(`${user.email} is now Management (read-only) and can sign in with their PIN.`);
  } else {
    await pool.query('UPDATE users SET pin_hash = $1 WHERE id = $2', [hashed, user.id]);
    console.log(`PIN set for ${user.email} (role unchanged: ${user.role}).`);
  }

  console.log('');
  console.log('The PIN is stored hashed and cannot be read back — note it down now.');
  console.log('Sign-in locks for 15 minutes after 5 wrong attempts.');
  await pool.end();
}

run().catch(err => {
  console.error('set-pin failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
