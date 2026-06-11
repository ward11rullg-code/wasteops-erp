# 🌿 EcoTrack ERP — Waste Management System

A full-stack Enterprise Resource Planning (ERP) system built for waste management companies. Manage customers, fleet, drivers, routes, collection orders, invoicing, facilities, and environmental reporting — all in one dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Drizzle](https://img.shields.io/badge/Drizzle-ORM-green)
![Tailwind](https://img.shields.io/badge/Tailwind-4-purple)

---

## ⚡ Deploy to Vercel (60 seconds)

**Step 1:** Create a free database at **[neon.tech](https://neon.tech)** → Copy the connection string

**Step 2:** Click the button below, paste your database URL, and deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ecotrack-erp&env=DATABASE_URL&envDescription=PostgreSQL%20connection%20string&envLink=https://neon.tech)

---

## ✨ Features

### 📊 Dashboard
- Real-time KPI cards (customers, fleet, revenue, routes)
- Recycling vs. landfill trend charts
- Waste composition pie chart
- Vehicle fleet status overview
- Recent orders table

### 👥 Customers
- Residential, commercial, and industrial accounts
- Contract management with start/end dates
- Full CRUD with search and filters

### 🚛 Fleet Management
- Vehicle tracking (rear-loader, front-loader, side-loader, roll-off, flatbed)
- Maintenance scheduling with overdue alerts
- Fuel type tracking (diesel, CNG, electric, hybrid)
- Status monitoring (active, maintenance, out of service)

### 👷 Drivers
- Employee records with CDL class certifications
- License expiry warnings (3-month alerts)
- Vehicle assignments

### 🗺️ Routes
- Collection route planning
- Vehicle and driver assignments
- Frequency scheduling (daily, weekly, bi-weekly, monthly)
- Duration and distance estimates

### 📋 Collection Orders
- Full order lifecycle (scheduled → in progress → completed)
- Waste type, container, and weight tracking
- Facility routing for proper disposal

### 💰 Invoices
- Auto-calculated tax and totals
- Line item detail with click-to-view modal
- Payment tracking (draft, sent, paid, overdue)
- Revenue analytics

### 🏭 Facilities
- Landfills, recycling centers, transfer stations, composting, hazardous
- Capacity utilization tracking with visual bars
- Operating hours and contact management

### 📈 Reports & Analytics
- Environmental impact summary (diversion rates)
- Facility processing comparison charts
- Monthly recycling trends
- Revenue collection analytics

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up database
```bash
# Create a PostgreSQL database named 'ecotrack'
createdb ecotrack

# Create .env file
echo 'DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecotrack' > .env
```

### 3. Push database schema
```bash
npx drizzle-kit push
```

### 4. Start the app
```bash
npm run dev
```

### 5. Load demo data
Open `http://localhost:3000` and click **"Load Demo Data"** on the dashboard.

---

## 🐳 Docker Quick Start

```bash
docker compose up -d        # Start PostgreSQL + App
docker compose exec app npx drizzle-kit push   # Apply schema
curl -X POST http://localhost:3000/api/seed    # Load demo data
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Next.js 16 (App Router) |
| **Styling** | Tailwind CSS 4 |
| **Charts** | Recharts |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL 16 |
| **ORM** | Drizzle ORM |
| **Language** | TypeScript |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── customers/page.tsx    # Customer management
│   ├── fleet/page.tsx        # Vehicle fleet
│   ├── drivers/page.tsx      # Driver management
│   ├── routes/page.tsx       # Route planning
│   ├── orders/page.tsx       # Collection orders
│   ├── invoices/page.tsx     # Billing & invoices
│   ├── facilities/page.tsx   # Facility management
│   ├── reports/page.tsx      # Analytics & reports
│   └── api/                  # REST API endpoints
├── components/
│   └── Sidebar.tsx           # Navigation sidebar
└── db/
    ├── schema.ts             # Database schema (12 tables)
    └── index.ts              # Database connection
```

---

## 📖 Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for detailed deployment instructions on:
- **Vercel** (easiest, free tier)
- **Docker** (self-hosted)
- **Railway** (full-stack with DB)
- **Manual VPS** (DigitalOcean, AWS EC2, etc.)

---

## 📄 License

MIT
