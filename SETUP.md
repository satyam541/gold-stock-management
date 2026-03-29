# AssetFlow — Gold Stock Management System

## Setup Guide

Follow these steps to get the project running after cloning on a new machine.

---

### Prerequisites

| Requirement    | Version    | Notes                                                  |
| -------------- | ---------- | ------------------------------------------------------ |
| **Node.js**    | 18+        | Download from [nodejs.org](https://nodejs.org)         |
| **MySQL**      | 8.0+ / 9.x | WAMP, XAMPP, or standalone MySQL                      |
| **npm**        | 9+         | Comes with Node.js                                     |
| **Git**        | Any        | For cloning the repository                             |

---

### 1. Clone the Repository

```bash
git clone https://github.com/ryutechglobalinfo-code/gold-stock-management.git
cd gold-stock-management
```

---

### 2. Install Dependencies

```bash
npm install
```

> **Windows PowerShell note:** If you get an execution policy error, run this first:
>
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> ```

---

### 3. Create the MySQL Database

Open MySQL (via phpMyAdmin, MySQL Workbench, or CLI) and create the database:

```sql
CREATE DATABASE gold_stock_management;
```

---

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="mysql://root:@localhost:3306/gold_stock_management"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

Adjust the values as needed:

| Variable               | Description                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`         | MySQL connection string: `mysql://USER:PASSWORD@HOST:PORT/DATABASE`         |
| `NEXT_PUBLIC_BASE_URL` | Public URL of the app (use `http://localhost:3000` for local development)    |
| `NEXTAUTH_URL`         | Same as base URL — required by NextAuth                                     |
| `NEXTAUTH_SECRET`      | Any random string used to sign session tokens. Generate one with: `openssl rand -base64 32` |

---

### 5. Push Database Schema

Generate the Prisma client and push the schema to the database:

```bash
npx prisma generate
npx prisma db push
```

---

### 6. Seed the Database

This creates the default admin user, carat options, transaction types, and sample data:

```bash
npx ts-node prisma/seed.ts
```

> If `ts-node` is not installed globally, use:
>
> ```bash
> npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
> ```

**Default Admin Credentials:**

| Field    | Value               |
| -------- | ------------------- |
| Email    | admin@assetflow.pk  |
| Password | admin123            |

> Change the admin password after first login.

---

### 7. Start the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

---

## Available Scripts

| Command             | Description                                |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Start development server (hot reload)      |
| `npm run build`     | Build for production                       |
| `npm run start`     | Start production server                    |
| `npm run lint`      | Run ESLint                                 |
| `npm run db:generate` | Regenerate Prisma client                 |
| `npm run db:push`   | Push schema changes to database            |
| `npm run db:migrate`| Create and run Prisma migrations           |
| `npm run db:studio` | Open Prisma Studio (visual DB browser)     |
| `npm run db:seed`   | Run the database seeder                    |

---

## Project Structure

```
├── prisma/
│   ├── schema.prisma       # Database schema (10 models)
│   └── seed.ts             # Database seeder
├── src/
│   ├── app/
│   │   ├── api/            # API routes (REST endpoints)
│   │   ├── bill/           # Invoice/bill view
│   │   ├── cash/           # Cash transactions module
│   │   ├── gold/           # Gold transactions module
│   │   ├── login/          # Authentication pages
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── persons/        # Person/contact management
│   │   ├── reports/        # Reports & charts
│   │   ├── settings/       # App settings (carat, types, SMTP)
│   │   ├── transactions/   # All transactions view
│   │   ├── users/          # User management (admin only)
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Dashboard
│   ├── components/         # Reusable UI components
│   ├── lib/
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── prisma.ts       # Prisma client singleton
│   │   └── utils.ts        # Utility functions
│   └── types/              # TypeScript type definitions
├── .env                    # Environment variables (not committed)
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Tech Stack

| Technology     | Purpose                          |
| -------------- | -------------------------------- |
| Next.js 14     | React framework (App Router)     |
| TypeScript     | Type-safe JavaScript             |
| Prisma         | ORM for MySQL                    |
| MySQL          | Relational database              |
| NextAuth v4    | Authentication (JWT sessions)    |
| Tailwind CSS   | Utility-first CSS                |
| Recharts       | Charts & graphs                  |
| Radix UI       | Accessible UI primitives         |
| Lucide React   | Icon library                     |
| bcryptjs       | Password hashing                 |
| nodemailer     | Email sending (password reset)   |
| react-hot-toast| Toast notifications              |

---

## SMTP Configuration (Optional)

To enable the password reset email feature:

1. Login as admin
2. Go to **Settings → Email / SMTP** tab
3. Fill in your SMTP server details (e.g., Gmail, Mailgun, etc.)
4. Click **Send Test Email** to verify
5. Click **Save SMTP Settings**

---

## Troubleshooting

| Problem                              | Solution                                                              |
| ------------------------------------ | --------------------------------------------------------------------- |
| `EPERM` or execution policy error    | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`      |
| Database connection refused           | Ensure MySQL is running and the `DATABASE_URL` credentials are correct |
| `prisma generate` fails              | Delete `node_modules/.prisma` and run `npm install` again             |
| Port 3000 already in use             | Kill the process or use `npm run dev -- -p 3001`                      |
| Seed fails with duplicate key        | The seeder uses `upsert`, so re-running is safe                       |
| Login redirects back to login        | Check that `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are set in `.env`     |
