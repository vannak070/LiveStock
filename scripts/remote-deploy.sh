#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# remote-deploy.sh
# Run this from your LOCAL Mac to trigger a full safe deploy on production.
# It will: backup → pull → install → safe-migrate → build → reload PM2.
#
# Usage (from Mac terminal, inside your project directory):
#   bash scripts/remote-deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

PROD_HOST="root@104.248.149.103"
PROD_APP_DIR="/root/LiveStock"

echo ""
echo "=== 🚀 Remote Deploy to Production ==="
echo "  Target : $PROD_HOST"
echo "  App Dir: $PROD_APP_DIR"
echo ""

# Push latest local changes first
echo "[1/2] Pushing local code to GitHub..."
git add -A
git diff --staged --quiet || git commit -m "chore: deploy $(date '+%Y-%m-%d %H:%M')"
git push origin main
echo "   ✓ Code pushed to GitHub"

# Trigger deploy on production server
echo "[2/2] Running safe deploy on production server..."
echo "      (Auto-backup → pull → install → safe-migrate → build → pm2 reload)"
echo ""
BACKUP_FILE="$PROD_APP_DIR/backups/pre_deploy_$(date '+%Y-%m-%d_%H-%M-%S').json" \
  ssh -o StrictHostKeyChecking=no "$PROD_HOST" \
  "BACKUP_FILE='$PROD_APP_DIR/backups/pre_deploy_$(date '+%Y-%m-%d_%H-%M-%S').json' bash $PROD_APP_DIR/scripts/deploy-production.sh"

echo ""
echo "=== ✅ Remote deploy completed! ==="
echo "   Live at: http://104.248.149.103"
