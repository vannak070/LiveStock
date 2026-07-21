#!/usr/bin/env bash
# Production Automated Setup Script for Cloudways / Remote Linux Server
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

# 3. Database Migration & Schema Restoration
echo "[Step 3/5] Executing PostgreSQL database migrations..."
npm run restore-db
npx tsx src/db/migrations/migrate-feeding-program.ts
npx tsx src/db/migrations/migrate-user-permissions.ts

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
