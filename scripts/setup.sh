#!/bin/bash
# ─── EcoTrack ERP - Quick Setup Script ─────────────────────
# Run: bash scripts/setup.sh

set -e

echo "🌿 EcoTrack ERP - Setup"
echo "========================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   → https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. Make sure you have PostgreSQL installed."
    echo "   You can still use a remote database by setting DATABASE_URL in .env"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    read -p "Enter DATABASE_URL (press Enter for default: postgresql://postgres:postgres@localhost:5432/ecotrack): " DB_URL
    DB_URL=${DB_URL:-"postgresql://postgres:postgres@localhost:5432/ecotrack"}
    echo "DATABASE_URL=$DB_URL" > .env
    echo "   Created .env with DATABASE_URL"
fi

# Push schema
echo ""
echo "🗄️  Applying database schema..."
npx drizzle-kit push

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the app:"
echo "  npm run dev        → http://localhost:3000"
echo ""
echo "To load demo data:"
echo "  curl -X POST http://localhost:3000/api/seed"
echo ""
echo "Or click 'Load Demo Data' on the dashboard."
echo ""
echo "To deploy, see DEPLOYMENT.md"
