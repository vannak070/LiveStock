/**
 * SAFE PRODUCTION MIGRATION SCRIPT
 * ─────────────────────────────────────────────────────────────────────────────
 * Purpose : Ensure the production database schema is up-to-date WITHOUT
 *           touching any existing data.  Uses CREATE TABLE IF NOT EXISTS and
 *           ADD COLUMN IF NOT EXISTS throughout — 100 % non-destructive.
 *
 * ⚠️  DO NOT run init-db.ts / restore-db in production — it seeds local test
 *     data and drops/recreates all tables, wiping the production database.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { pool, connectWithRetry } from '../../config/database';

async function safeMigrate() {
  console.log('=== 🛡️  Safe Production Schema Migration (non-destructive) ===');
  await connectWithRetry(5, 2000);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── 1. master_settings ──────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS master_settings (
        id         SERIAL PRIMARY KEY,
        key        VARCHAR(50) UNIQUE NOT NULL,
        data       JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[✓] master_settings');

    // ── 2. users ─────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         VARCHAR(50) PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        email      VARCHAR(100) UNIQUE NOT NULL,
        role       VARCHAR(50)  NOT NULL,
        status     VARCHAR(20)  DEFAULT 'Active',
        password   VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Optional columns added in later migrations
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS farm_location VARCHAR(100);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;`);
    console.log('[✓] users');

    // ── 3. stock ─────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock (
        id             VARCHAR(50) PRIMARY KEY,
        no             VARCHAR(20) NOT NULL,
        breed          VARCHAR(50),
        sex            VARCHAR(20),
        age            VARCHAR(50),
        weight         NUMERIC(10,2) DEFAULT 0,
        owner_name     VARCHAR(100),
        location       VARCHAR(100),
        phone          VARCHAR(50),
        buy_type       VARCHAR(50),
        unit_price     NUMERIC(12,2) DEFAULT 0,
        total_price    NUMERIC(12,2) DEFAULT 0,
        health_status  VARCHAR(50) DEFAULT 'Good',
        status         VARCHAR(50) DEFAULT 'Active',
        purchase_date  TIMESTAMP WITH TIME ZONE,
        remark         TEXT,
        purchase_type  VARCHAR(50),
        payment_method VARCHAR(50),
        image_url      TEXT,
        created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[✓] stock');

    // ── 4. weight_tracking ───────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS weight_tracking (
        id             SERIAL PRIMARY KEY,
        cow_id         VARCHAR(50) NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
        breed          VARCHAR(50),
        age            VARCHAR(50),
        old_weight     NUMERIC(10,2) DEFAULT 0,
        current_weight NUMERIC(10,2) DEFAULT 0,
        gain_loss      NUMERIC(10,4) DEFAULT 0,
        health_status  VARCHAR(50),
        status         VARCHAR(50),
        tracking_date  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[✓] weight_tracking');

    // ── 5. sales_tracking ────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales_tracking (
        id          SERIAL PRIMARY KEY,
        cow_id      VARCHAR(50) NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
        breed       VARCHAR(50),
        age         VARCHAR(50),
        weight      NUMERIC(10,2) DEFAULT 0,
        unit_price  NUMERIC(12,2) DEFAULT 0,
        total_price NUMERIC(12,2) DEFAULT 0,
        status      VARCHAR(50) DEFAULT 'Sold',
        sales_date  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        sale_type   VARCHAR(50),
        buyer       VARCHAR(100)
      );
    `);
    console.log('[✓] sales_tracking');

    // ── 6. batches ───────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS batches (
        id            VARCHAR(50) PRIMARY KEY,
        name          VARCHAR(100) NOT NULL,
        type          VARCHAR(50)  NOT NULL,
        start_date    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status        VARCHAR(20)  DEFAULT 'Active',
        notes         TEXT,
        farm_location VARCHAR(100),
        created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // feeding_program & expected_selling_price columns added in later migration
    await client.query(`ALTER TABLE batches ADD COLUMN IF NOT EXISTS feeding_program JSONB DEFAULT NULL;`);
    await client.query(`ALTER TABLE batches ADD COLUMN IF NOT EXISTS expected_selling_price NUMERIC DEFAULT NULL;`);
    console.log('[✓] batches');

    // ── 7. batch_cows ─────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS batch_cows (
        batch_id VARCHAR(50) NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
        cow_id   VARCHAR(50) NOT NULL REFERENCES stock(id)   ON DELETE CASCADE,
        PRIMARY KEY (batch_id, cow_id)
      );
    `);
    console.log('[✓] batch_cows');

    // ── 8. health_logs ───────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS health_logs (
        id             VARCHAR(50) PRIMARY KEY,
        cow_id         VARCHAR(50) NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
        type           VARCHAR(50)  NOT NULL,
        name           VARCHAR(100) NOT NULL,
        date           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        administered_by VARCHAR(100),
        cost           NUMERIC(10,2) DEFAULT 0,
        notes          TEXT,
        created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[✓] health_logs');

    // ── 9. expenses ──────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id            VARCHAR(50) PRIMARY KEY,
        category      VARCHAR(50) NOT NULL,
        amount        NUMERIC(12,2) DEFAULT 0,
        date          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        description   TEXT,
        farm_location VARCHAR(100),
        created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[✓] expenses');

    // ── 10. feed_products & feed_transactions ─────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS feed_products (
        id                 VARCHAR(50) PRIMARY KEY,
        name               VARCHAR(100) NOT NULL,
        category           VARCHAR(50),
        unit               VARCHAR(20) DEFAULT 'bag',
        weight_per_unit    NUMERIC(10,2) DEFAULT 30,
        unit_cost          NUMERIC(15,4) DEFAULT 0,
        cost_type          VARCHAR(20) DEFAULT 'per_bag',
        cost_per_bag       NUMERIC(15,2) DEFAULT 0,
        min_threshold_bags NUMERIC(10,2) DEFAULT 50,
        min_threshold_kg   NUMERIC(10,2) DEFAULT 1500,
        description        TEXT,
        supplier           VARCHAR(100),
        status             VARCHAR(20) DEFAULT 'Active',
        created_at         TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at         TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE feed_products ADD COLUMN IF NOT EXISTS cost_type VARCHAR(20) DEFAULT 'per_bag';
      ALTER TABLE feed_products ADD COLUMN IF NOT EXISTS cost_per_bag NUMERIC(15,2) DEFAULT 0;
    `);
    console.log('[✓] feed_products');

    // ── Indexes (CREATE INDEX IF NOT EXISTS is idempotent) ──────────────────
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_stock_status          ON stock(status)',
      'CREATE INDEX IF NOT EXISTS idx_stock_health          ON stock(health_status)',
      'CREATE INDEX IF NOT EXISTS idx_weight_cow_id         ON weight_tracking(cow_id)',
      'CREATE INDEX IF NOT EXISTS idx_weight_tracking_date  ON weight_tracking(tracking_date)',
      'CREATE INDEX IF NOT EXISTS idx_sales_cow_id          ON sales_tracking(cow_id)',
      'CREATE INDEX IF NOT EXISTS idx_health_cow_id         ON health_logs(cow_id)',
      'CREATE INDEX IF NOT EXISTS idx_batch_cows_cow_id     ON batch_cows(cow_id)',
      'CREATE INDEX IF NOT EXISTS idx_expenses_category     ON expenses(category)',
      'CREATE INDEX IF NOT EXISTS idx_expenses_date         ON expenses(date)',
    ];
    for (const idx of indexes) {
      await client.query(idx + ';');
    }
    console.log('[✓] indexes');

    await client.query('COMMIT');
    console.log('\n✅ Safe migration completed successfully — production data is untouched.');
  } catch (err: unknown) {
    await client.query('ROLLBACK');
    const msg = err instanceof Error ? err.message : String(err);
    console.error('\n❌ Migration failed (rolled back):', msg);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

safeMigrate();
