# AssetFlow — Stock & Asset Management Platform

A full-stack web application for managing cash flow and gold inventory, built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

---

## Features

- **Dashboard** — Live stats, cash flow area charts, gold bar charts, inventory breakdown
- **Cash Management** — Add/track cash transactions (lent/received/deposit/withdrawal), set opening balance
- **Gold Management** — Track gold by carat type (18k/22k/24k…), weight, rate per gram
- **Persons** — Manage counterparties linked to transactions
- **Transactions** — Full history with filters (person, type, carat, date range)
- **Reports** — Analytics charts: P&L, cash flow, gold inventory pie, 6-month trends
- **Bill Printing** — Professional printable receipts for every transaction

---

## Tech Stack

| Layer        | Technology                               |
| ------------ | ---------------------------------------- |
| Frontend     | Next.js 14 (App Router), TypeScript      |
| Styling      | TailwindCSS, custom design tokens        |
| Charts       | Recharts                                 |
| Database ORM | Prisma                                   |
| Database     | PostgreSQL                               |
| Print        | react-to-print                           |
| Fonts        | Outfit, Playfair Display, JetBrains Mono |

---

## Project Structure

```
stock-asset-manager/
├── prisma/
│   ├── schema.prisma          # All DB models
│   └── seed.ts                # Seed script with sample data
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (sidebar + header)
│   │   ├── page.tsx           # Dashboard
│   │   ├── cash/page.tsx      # Cash Management
│   │   ├── gold/page.tsx      # Gold Management
│   │   ├── persons/
│   │   │   ├── page.tsx       # Persons list
│   │   │   └── [id]/page.tsx  # Person detail
│   │   ├── transactions/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── bill/[id]/page.tsx # Printable bill
│   │   └── api/
│   │       ├── dashboard/route.ts
│   │       ├── persons/route.ts
│   │       ├── persons/[id]/route.ts
│   │       ├── cash-transactions/route.ts
│   │       ├── cash-transactions/[id]/route.ts
│   │       ├── cash-ledger/route.ts
│   │       ├── gold-transactions/route.ts
│   │       ├── gold-transactions/[id]/route.ts
│   │       └── gold-inventory/route.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── dashboard/
│   │       ├── StatCard.tsx
│   │       ├── CashFlowChart.tsx
│   │       ├── GoldChart.tsx
│   │       └── RecentTransactions.tsx
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── utils.ts           # Helpers, formatters
│   └── types/index.ts         # TypeScript interfaces
├── .env.example
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## Database Models

```
Person
  id, name, phone, email, address, notes

CashTransaction
  id, personId, type (LENT/RECEIVED/DEPOSIT/WITHDRAWAL), amount, date, notes, billNumber

GoldTransaction
  id, personId, type, carat, weight, ratePerGram, totalValue, date, notes, billNumber

GoldInventory
  id, carat (unique), weight (running total)

CashLedger
  id, balance (auto-updated on each transaction)
```

---

## Setup Instructions

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+ (local or cloud — Supabase recommended for free tier)
- **npm** or **yarn**

---

### Step 1: Clone & Install

```bash
# Copy the project folder
cd stock-asset-manager

# Install dependencies
npm install
```

---

### Step 2: Configure Database

```bash
# Copy the environment file
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL`:

**Local PostgreSQL:**

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/assetflow"
```

**Supabase (free cloud DB):**

1. Go to https://supabase.com → New Project
2. Settings → Database → Connection String (URI mode)
3. Paste it as `DATABASE_URL`

---

### Step 3: Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates all tables)
npm run db:push

# (Optional) Seed with sample data
npm run db:seed
```

---

### Step 4: Run the App

```bash
# Development
npm run dev

# Open: http://localhost:3000
```

---

### Step 5: Production Build

```bash
npm run build
npm start
```

---

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel

# Set environment variables in Vercel dashboard:
# DATABASE_URL = your production PostgreSQL URL
# NEXT_PUBLIC_BASE_URL = https://yourdomain.vercel.app
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## API Reference

| Method         | Endpoint                     | Description                   |
| -------------- | ---------------------------- | ----------------------------- |
| GET            | `/api/dashboard`             | Dashboard stats + charts data |
| GET/POST       | `/api/persons`               | List / create persons         |
| GET/PUT/DELETE | `/api/persons/:id`           | Person CRUD                   |
| GET/PUT        | `/api/cash-ledger`           | Get/set cash balance          |
| GET/POST       | `/api/cash-transactions`     | List / create cash tx         |
| GET/DELETE     | `/api/cash-transactions/:id` | Get / delete cash tx          |
| GET/POST       | `/api/gold-transactions`     | List / create gold tx         |
| GET/DELETE     | `/api/gold-transactions/:id` | Get / delete gold tx          |
| GET            | `/api/gold-inventory`        | Gold inventory by carat       |

### Query Parameters (Transactions)

| Param      | Description                         |
| ---------- | ----------------------------------- |
| `personId` | Filter by person ID                 |
| `type`     | LENT, RECEIVED, DEPOSIT, WITHDRAWAL |
| `carat`    | Gold carat (22k, 24k, etc.)         |
| `from`     | Start date (ISO)                    |
| `to`       | End date (ISO)                      |
| `page`     | Page number (default: 1)            |
| `limit`    | Items per page (default: 20)        |

---

## Customization

### Company Info (Bill Printing)

Edit in `src/app/bill/[id]/page.tsx`:

```typescript
const COMPANY = {
  name: "Your Business Name",
  phone: "+1 234 567 8900",
  address: "Your Address",
  email: "you@business.com",
};
```

### Currency

Edit `formatCurrency` in `src/lib/utils.ts`:

```typescript
export function formatCurrency(amount: number, currency = "INR"): string {
  // Change "INR" to "USD", "AED", "INR", etc.
}
```

### Adding Carat Types

Edit `CARAT_OPTIONS` in `src/lib/utils.ts`.

---

## License

MIT — free to use and modify for personal or commercial projects.
