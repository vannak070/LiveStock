/**
 * RESTORE CATTLE DATA TO PRODUCTION
 * ─────────────────────────────────────────────────────────────────────────────
 * Restores stock, weight_tracking, sales_tracking, batches, batch_cows, and
 * expenses from local db.json to the production PostgreSQL database.
 *
 * Uses ON CONFLICT DO UPDATE so it is safe to re-run without duplicating data.
 * Does NOT touch users or master_settings.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as fs from 'fs';
import * as path from 'path';
import { pool, connectWithRetry } from '../../config/database';

const dbPath = path.join(__dirname, '../../data/db.json');

async function restoreCattleData() {
  console.log('=== 🐄 Restore Cattle & Farm Data to Production ===');
  console.log(`Reading from: ${dbPath}`);

  if (!fs.existsSync(dbPath)) {
    console.error('❌ db.json not found at:', dbPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(dbPath, 'utf8');
  const data = JSON.parse(raw);

  const stock: any[]          = data.stock          || [];
  const sales: any[]          = data.salesTracking   || [];
  const weights: any[]        = data.weightTracking  || [];
  const batches: any[]        = data.batches         || [];
  const expenses: any[]       = data.expenses        || [];
  const healthLogs: any[]     = data.healthLogs      || [];

  console.log(`📦 Data to restore:`);
  console.log(`   Stock (cattle): ${stock.length}`);
  console.log(`   Sales tracking: ${sales.length}`);
  console.log(`   Weight tracking: ${weights.length}`);
  console.log(`   Batches: ${batches.length}`);
  console.log(`   Expenses: ${expenses.length}`);
  console.log(`   Health logs: ${healthLogs.length}`);

  await connectWithRetry(5, 2000);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── 1. Stock (Cattle) ──────────────────────────────────────────────────
    console.log('\n[1/6] Restoring cattle stock...');
    let stockOk = 0;
    for (const s of stock) {
      await client.query(
        `INSERT INTO stock (id, no, breed, sex, age, weight, owner_name, location,
            phone, buy_type, unit_price, total_price, health_status, status,
            purchase_date, remark, purchase_type, payment_method, image_url,
            created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
                 COALESCE($20, NOW()), COALESCE($21, NOW()))
         ON CONFLICT (id) DO UPDATE SET
           no             = EXCLUDED.no,
           breed          = EXCLUDED.breed,
           sex            = EXCLUDED.sex,
           age            = EXCLUDED.age,
           weight         = EXCLUDED.weight,
           owner_name     = EXCLUDED.owner_name,
           location       = EXCLUDED.location,
           phone          = EXCLUDED.phone,
           buy_type       = EXCLUDED.buy_type,
           unit_price     = EXCLUDED.unit_price,
           total_price    = EXCLUDED.total_price,
           health_status  = EXCLUDED.health_status,
           status         = EXCLUDED.status,
           purchase_date  = EXCLUDED.purchase_date,
           remark         = EXCLUDED.remark,
           purchase_type  = EXCLUDED.purchase_type,
           payment_method = EXCLUDED.payment_method,
           image_url      = EXCLUDED.image_url,
           updated_at     = NOW()`,
        [
          s.id, s.no, s.breed, s.sex, s.age,
          s.weight || 0,
          s.ownerName || s.owner_name || null,
          s.location || null,
          s.phone || null,
          s.buyType || s.buy_type || null,
          s.unitPrice || s.unit_price || 0,
          s.totalPrice || s.total_price || 0,
          s.healthStatus || s.health_status || 'Good',
          s.status || 'Active',
          s.purchaseDate || s.purchase_date || null,
          s.remark || null,
          s.purchaseType || s.purchase_type || null,
          s.paymentMethod || s.payment_method || null,
          s.imageUrl || s.image_url || null,
          s.createdAt || s.created_at || null,
          s.updatedAt || s.updated_at || null,
        ]
      );
      stockOk++;
    }
    console.log(`   ✓ ${stockOk} cattle records restored`);

    // ── 2. Weight Tracking ─────────────────────────────────────────────────
    console.log('[2/6] Restoring weight tracking...');
    let wtOk = 0;
    for (const w of weights) {
      // Only insert if the referenced cow_id exists
      const cowExists = stock.find(s => s.id === (w.cowId || w.cow_id));
      if (!cowExists) continue;
      await client.query(
        `INSERT INTO weight_tracking
           (cow_id, breed, age, old_weight, current_weight, gain_loss, health_status, status, tracking_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          w.cowId || w.cow_id,
          w.breed || null,
          w.age || null,
          w.oldWeight || w.old_weight || 0,
          w.currentWeight || w.current_weight || 0,
          w.gainLoss || w.gain_loss || 0,
          w.healthStatus || w.health_status || null,
          w.status || null,
          w.trackingDate || w.tracking_date || new Date(),
        ]
      );
      wtOk++;
    }
    console.log(`   ✓ ${wtOk} weight records restored`);

    // ── 3. Sales Tracking ──────────────────────────────────────────────────
    console.log('[3/6] Restoring sales tracking...');
    let salesOk = 0;
    for (const s of sales) {
      const cowExists = stock.find(c => c.id === (s.cowId || s.cow_id));
      if (!cowExists) continue;
      await client.query(
        `INSERT INTO sales_tracking
           (cow_id, breed, age, weight, unit_price, total_price, status, sales_date, sale_type, buyer)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          s.cowId || s.cow_id,
          s.breed || null,
          s.age || null,
          s.weight || 0,
          s.unitPrice || s.unit_price || 0,
          s.totalPrice || s.total_price || 0,
          s.status || 'Sold',
          s.salesDate || s.sales_date || new Date(),
          s.saleType || s.sale_type || null,
          s.buyer || null,
        ]
      );
      salesOk++;
    }
    console.log(`   ✓ ${salesOk} sales records restored`);

    // ── 4. Batches ─────────────────────────────────────────────────────────
    console.log('[4/6] Restoring batches...');
    let batchOk = 0;
    for (const b of batches) {
      await client.query(
        `INSERT INTO batches (id, name, type, start_date, status, notes, farm_location, feeding_program, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9, NOW()))
         ON CONFLICT (id) DO UPDATE SET
           name           = EXCLUDED.name,
           type           = EXCLUDED.type,
           start_date     = EXCLUDED.start_date,
           status         = EXCLUDED.status,
           notes          = EXCLUDED.notes,
           farm_location  = EXCLUDED.farm_location,
           feeding_program = EXCLUDED.feeding_program`,
        [
          b.id,
          b.name,
          b.type,
          b.startDate || b.start_date || new Date(),
          b.status || 'Active',
          b.notes || null,
          b.farmLocation || b.farm_location || null,
          b.feedingProgram || b.feeding_program ? JSON.stringify(b.feedingProgram || b.feeding_program) : null,
          b.createdAt || b.created_at || null,
        ]
      );

      // Restore batch_cows junction
      const cowIds: string[] = b.cowIds || b.cow_ids || [];
      for (const cowId of cowIds) {
        const cowExists = stock.find(s => s.id === cowId);
        if (!cowExists) continue;
        await client.query(
          `INSERT INTO batch_cows (batch_id, cow_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [b.id, cowId]
        );
      }
      batchOk++;
    }
    console.log(`   ✓ ${batchOk} batches restored`);

    // ── 5. Expenses ────────────────────────────────────────────────────────
    console.log('[5/6] Restoring expenses...');
    let expOk = 0;
    for (const e of expenses) {
      if (!e.id) continue;
      await client.query(
        `INSERT INTO expenses (id, category, amount, date, description, farm_location, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7, NOW()))
         ON CONFLICT (id) DO UPDATE SET
           category      = EXCLUDED.category,
           amount        = EXCLUDED.amount,
           date          = EXCLUDED.date,
           description   = EXCLUDED.description,
           farm_location = EXCLUDED.farm_location`,
        [
          e.id,
          e.category || 'Other',
          e.amount || 0,
          e.date || new Date(),
          e.description || null,
          e.farmLocation || e.farm_location || null,
          e.createdAt || e.created_at || null,
        ]
      );
      expOk++;
    }
    console.log(`   ✓ ${expOk} expenses restored`);

    // ── 6. Health Logs ─────────────────────────────────────────────────────
    console.log('[6/6] Restoring health logs...');
    let hlOk = 0;
    for (const h of healthLogs) {
      if (!h.id) continue;
      const cowExists = stock.find(s => s.id === (h.cowId || h.cow_id));
      if (!cowExists) continue;
      await client.query(
        `INSERT INTO health_logs (id, cow_id, type, name, date, administered_by, cost, notes, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9, NOW()))
         ON CONFLICT (id) DO NOTHING`,
        [
          h.id,
          h.cowId || h.cow_id,
          h.type || 'Treatment',
          h.name || 'Unknown',
          h.date || new Date(),
          h.administeredBy || h.administered_by || null,
          h.cost || 0,
          h.notes || null,
          h.createdAt || h.created_at || null,
        ]
      );
      hlOk++;
    }
    console.log(`   ✓ ${hlOk} health logs restored`);

    await client.query('COMMIT');
    console.log('\n✅ All cattle data restored successfully to production!');
    console.log('   Users and system settings were NOT touched.');

  } catch (err: unknown) {
    await client.query('ROLLBACK');
    const msg = err instanceof Error ? err.message : String(err);
    console.error('\n❌ Restore failed (rolled back):', msg);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

restoreCattleData();
