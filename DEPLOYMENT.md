# 🚀 EcoTrack ERP — Deployment Guide

Complete guide to deploy your Waste Management ERP to any platform.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Option A: Vercel (Recommended — Easiest)](#option-a-vercel)
3. [Option B: Docker (Self-Hosted)](#option-b-docker)
4. [Option C: Railway (Full-Stack with DB)](#option-c-railway)
5. [Option D: Manual VPS / Bare Metal](#option-d-manual-vps)
6. [Post-Deployment: Load Demo Data](#post-deployment-load-demo-data)
7. [Custom Domain & SSL](#custom-domain--ssl)

---

## Prerequisites

You need a **PostgreSQL database**. You can:
- Use a managed service: [Neon](https://neon.tech) (free), [Supabase](https://supabase.com) (free), [Railway](https://railway.app), [AWS RDS](https://aws.amazon.com/rds/)
- Run it locally with Docker
- Use your own existing PostgreSQL server

---

## Option A: Vercel
> **Best for**: Quick deployment, zero DevOps, automatic HTTPS, free tier
> **Cost**: Free for personal use (Hobby plan)

### Step 1: Get a Database

**Option 1 — Neon (Recommended, Free):**
1. Go to [neon.tech](https://neon.tech) → Sign up
2. Create a new project → Copy the connection string
3. It looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

**Option 2 — Supabase (Free):**
1. Go to [supabase.com](https://supabase.com) → Sign up → New project
2. Go to Settings → Database → Copy the connection URI

### Step 2: Push to GitHub

```bash
# Initialize git repo (if not already)
git init
git add .
git commit -m "Initial commit - EcoTrack ERP"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/ecotrack-erp.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New Project"**
3. Import your `ecotrack-erp` repository
4. Click **"Environment Variables"** and add:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `postgresql://user:pass@host:5432/dbname` |

5. Click **"Deploy"** — takes ~2 minutes

### Step 4: Apply Database Schema

After deployment, you need to push the database schema:

```bash
# Set the env var locally (use your Neon/Supabase URL)
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Apply the schema
npx drizzle-kit push
```

### Step 5: Load Demo Data

Visit `https://your-app.vercel.app` and click **"Load Demo Data"** on the dashboard.

Or use the API:
```bash
curl -X POST https://your-app.vercel.app/api/seed
```

---

## Option B: Docker
> **Best for**: Self-hosted, full control, production servers, on-premise
> **Requires**: A server with Docker installed

### Step 1: Clone & Configure

```bash
git clone https://github.com/YOUR_USERNAME/ecotrack-erp.git
cd ecotrack-erp

# The .env file is already configured for docker-compose
# DATABASE_URL is set in docker-compose.yml automatically
```

### Step 2: Start Everything

```bash
# Build and start (PostgreSQL + Next.js app)
docker compose up -d

# View logs
docker compose logs -f app

# Check status
docker compose ps
```

This will:
- Start a PostgreSQL 16 database
- Build the Next.js app
- Expose the app on `http://your-server-ip:3000`

### Step 3: Apply Database Schema

```bash
# Push schema to the running database
docker compose exec app npx drizzle-kit push
```

### Step 4: Load Demo Data

```bash
curl -X POST http://localhost:3000/api/seed
```

### Docker Commands Reference

```bash
# Stop everything (keeps data)
docker compose down

# Stop everything AND delete database data
docker compose down -v

# Restart just the app
docker compose restart app

# Rebuild after code changes
docker compose build --no-cache
docker compose up -d

# View database directly
docker compose exec db psql -U ecotrack -d ecotrack
```

---

## Option C: Railway
> **Best for**: Full-stack with managed PostgreSQL, simple scaling
> **Cost**: ~$5/month (usage-based)

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### Step 2: Create Project

```bash
# Create new project
railway init

# Add PostgreSQL
railway add

# This creates a PostgreSQL instance and sets DATABASE_URL automatically
```

### Step 3: Deploy

```bash
# Deploy the app
railway up

# Get the public URL
railway open
```

### Step 4: Set Environment Variables

```bash
# Railway auto-sets DATABASE_URL from the PostgreSQL plugin
# Verify with:
railway variables
```

### Step 5: Apply Schema & Seed

```bash
# Run drizzle-kit push in the Railway environment
railway run npx drizzle-kit push

# Seed data
curl -X POST https://your-app.up.railway.app/api/seed
```

---

## Option D: Manual VPS
> **Best for**: DigitalOcean, Linode, AWS EC2, any Ubuntu/Debian server

### Step 1: Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 2: Create Database

```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE ecotrack;
CREATE USER ecotrack_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ecotrack TO ecotrack_user;
\q
```

### Step 3: Deploy App

```bash
# Clone repo
git clone https://github.com/YOUR_USERNAME/ecotrack-erp.git
cd ecotrack-erp

# Install dependencies
npm ci

# Create .env
echo 'DATABASE_URL=postgresql://ecotrack_user:your_secure_password@localhost:5432/ecotrack' > .env

# Build
npm run build

# Push database schema
npx drizzle-kit push

# Seed demo data
curl -X POST http://localhost:3000/api/seed
```

### Step 4: Run as Service (PM2)

```bash
# Install PM2
npm install -g pm2

# Start the app
pm2 start npm --name "ecotrack" -- start

# Save and auto-restart on boot
pm2 save
pm2 startup
```

### Step 5: Nginx Reverse Proxy (Optional)

```bash
sudo apt-get install -y nginx
```

Create `/etc/nginx/sites-available/ecotrack`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ecotrack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: SSL with Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Post-Deployment: Load Demo Data

After deploying to **any** platform, visit your app URL and:

1. Open `https://your-app-url.com` in a browser
2. Click the **"Load Demo Data"** button on the dashboard
3. The system loads: 10 customers, 7 vehicles, 5 drivers, 5 routes, 8 orders, 5 invoices, 5 facilities, and recycling metrics

Or use the API:
```bash
curl -X POST https://your-app-url.com/api/seed
```

---

## Custom Domain & SSL

| Platform | How to add domain |
|----------|------------------|
| **Vercel** | Project Settings → Domains → Add your domain → Follow DNS instructions |
| **Railway** | Project Settings → Domains → Generate or add custom domain |
| **Docker/VPS** | Use Nginx + Let's Encrypt (see Option D, Step 5-6 above) |

---

## Comparison

| Feature | Vercel | Docker | Railway | VPS |
|---------|--------|--------|---------|-----|
| **Difficulty** | ⭐ Easy | ⭐⭐ Medium | ⭐⭐ Medium | ⭐⭐⭐ Hard |
| **Cost** | Free (Hobby) | Server cost | ~$5/mo | $5-20/mo |
| **Database** | External (Neon) | Included | Included | Self-managed |
| **SSL/HTTPS** | Automatic | Manual | Automatic | Manual (Certbot) |
| **Scaling** | Automatic | Manual | Automatic | Manual |
| **Custom Domain** | ✅ Free | ✅ Free | ✅ Free | ✅ Free |
| **Best For** | Quick start | Full control | Balance | Learning |

---

## Need Help?

- **Vercel issues**: Check `vercel logs` or the Vercel dashboard
- **Docker issues**: Run `docker compose logs -f app` for app logs
- **Database issues**: Verify `DATABASE_URL` is correct and accessible
- **Schema issues**: Run `npx drizzle-kit push` to sync the database schema
