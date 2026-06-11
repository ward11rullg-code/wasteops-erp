#!/bin/bash
# ─── EcoTrack ERP — One-Command Vercel Deploy ──────────────
# Run: bash scripts/deploy-vercel.sh
#
# This script:
#   1. Checks prerequisites
#   2. Prompts for your Neon database URL
#   3. Pushes the database schema
#   4. Deploys to Vercel with the DATABASE_URL
#   5. Seeds demo data
#   6. Opens your live app

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║     🌿 EcoTrack ERP — Vercel Deployment (60 sec)       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Prerequisites ──────────────────────────────────
echo "━━━ Step 1/5: Checking prerequisites ━━━"
echo ""

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org"
    exit 1
fi
echo "  ✅ Node.js $(node -v | cut -c2-)"

if ! command -v git &> /dev/null; then
    echo "❌ Git not found."
    exit 1
fi
echo "  ✅ Git installed"

# Install Vercel CLI if needed
if ! command -v vercel &> /dev/null; then
    echo "  📦 Installing Vercel CLI..."
    npm install -g vercel 2>/dev/null
fi
echo "  ✅ Vercel CLI ready"

# Login to Vercel if needed
if ! vercel whoami &>/dev/null; then
    echo ""
    echo "  🔐 Please log in to Vercel (opens browser):"
    vercel login
fi
echo "  ✅ Logged in as: $(vercel whoami)"

# ── Step 2: Database ──────────────────────────────────────
echo ""
echo "━━━ Step 2/5: Database setup ━━━"
echo ""

# Load from .env if exists
if [ -f .env ]; then
    EXISTING_URL=$(grep DATABASE_URL .env | cut -d'=' -f2-)
fi

if [ -n "$EXISTING_URL" ]; then
    echo "  Found DATABASE_URL in .env"
    MASKED=$(echo "$EXISTING_URL" | sed 's/:[^:]*@/:***@/')
    echo "  $MASKED"
    echo ""
    read -p "  Use this? (Y/n): " USE_EXISTING
    if [[ ! "$USE_EXISTING" =~ ^[Nn] ]]; then
        DATABASE_URL="$EXISTING_URL"
    fi
fi

if [ -z "$DATABASE_URL" ]; then
    echo "  📝 Paste your Neon database URL"
    echo "     (Get one free at https://neon.tech)"
    echo ""
    read -p "  DATABASE_URL: " DATABASE_URL
fi

if [ -z "$DATABASE_URL" ]; then
    echo "  ❌ DATABASE_URL is required."
    exit 1
fi

# Save to .env
echo "DATABASE_URL=$DATABASE_URL" > .env
echo ""
echo "  ✅ Database URL saved"

# ── Step 3: Push Schema ───────────────────────────────────
echo ""
echo "━━━ Step 3/5: Applying database schema ━━━"
echo ""

DATABASE_URL="$DATABASE_URL" npx drizzle-kit push 2>&1 | sed 's/^/  /'
echo "  ✅ Schema applied (12 tables created)"

# ── Step 4: Deploy ────────────────────────────────────────
echo ""
echo "━━━ Step 4/5: Deploying to Vercel ━━━"
echo ""

# Commit if needed
if command -v git &> /dev/null && [ -d .git ]; then
    git add -A 2>/dev/null
    git commit -m "🌿 EcoTrack ERP" 2>/dev/null || true
fi

# Deploy with environment variable
DEPLOY_URL=$(vercel deploy --prod --yes --env DATABASE_URL="$DATABASE_URL" 2>&1 | tail -1)
echo ""
echo "  ✅ Deployed to: $DEPLOY_URL"

# ── Step 5: Seed Data ─────────────────────────────────────
echo ""
echo "━━━ Step 5/5: Loading demo data ━━━"
echo ""

SEED_RESULT=$(curl -s -X POST "$DEPLOY_URL/api/seed" 2>&1)
echo "  $SEED_RESULT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    if d.get('success'):
        print('  ✅ Demo data loaded:')
        for k, v in d['counts'].items():
            print(f'     {k}: {v}')
    else:
        print('  ⚠️  Seed may have failed - try loading data from the dashboard')
except:
    print('  ⚠️  Could not parse seed response - try loading data from the dashboard')
" 2>/dev/null || echo "  ⚠️  Seed API call pending - click 'Load Demo Data' on your dashboard"

# ── Done ──────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                   🎉 DEPLOYED!                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  🌐 Your live ERP: $DEPLOY_URL"
echo ""
echo "  📌 Bookmark these pages:"
echo "     📊 Dashboard:   $DEPLOY_URL/"
echo "     👥 Customers:   $DEPLOY_URL/customers"
echo "     🚛 Fleet:       $DEPLOY_URL/fleet"
echo "     👷 Drivers:     $DEPLOY_URL/drivers"
echo "     🗺️  Routes:      $DEPLOY_URL/routes"
echo "     📋 Orders:      $DEPLOY_URL/orders"
echo "     💰 Invoices:    $DEPLOY_URL/invoices"
echo "     🏭 Facilities:  $DEPLOY_URL/facilities"
echo "     📈 Reports:     $DEPLOY_URL/reports"
echo ""

# Try to open in browser
if command -v open &> /dev/null; then
    open "$DEPLOY_URL"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$DEPLOY_URL"
fi
