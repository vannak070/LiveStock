#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Production Automated Setup Script for Cloudways / Remote Linux Server
#
# ⚠️  IMPORTANT – DATABASE POLICY
#     This script NEVER runs `npm run restore-db` (init-db.ts) in production.
#     init-db.ts seeds local test data and would WIPE the production database.
#     Instead, `npm run safe-migrate` is used — it only creates missing
#     tables / columns with IF NOT EXISTS and never touches existing data.
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "=== 🚀 Livestock Management ERP Production Deployment Setup ==="

# 1. Check Node.js and PM2
echo "[Step 1/5] Checking environment tools..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v20+."
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    echo "⚠️ PM2 process manager not found. Installing PM2 globally..."
    npm install -g pm2
fi

# 2. Install dependencies
echo "[Step 2/5] Installing production dependencies..."
npm install --production=false

# 3. Safe Schema-Only Migration (non-destructive — keeps all production data)
echo "[Step 3/5] Running safe schema migrations (no data wipe)..."
npm run safe-migrate

# 4. Build Next.js Production App
echo "[Step 4/5] Building Next.js production web application..."
npm run build

# 5. Start/Reload PM2 Processes
echo "[Step 5/5] Launching production processes via PM2..."
pm2 startOrReload ecosystem.config.js
pm2 save

echo ""
echo "=== 🎉 PRODUCTION DEPLOYMENT COMPLETE! ==="
echo "Express Backend API running on port 3002"
echo "Next.js Frontend UI running on port 3000"
echo "Check PM2 status with: pm2 status"
echo ""
echo "ℹ️  Production database was NOT modified — only missing schema was added."
