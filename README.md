# 💰 Personal Finance Manager

A modern, full-stack personal finance management application built with React and powered by Supabase.

## ✨ Features

- **🔐 Authentication** — Secure signup & login with Supabase Auth
- **📊 Dashboard** — Visual overview with income/expense charts and summary cards
- **💵 Add Income** — Record income entries with source and date
- **💸 Add Expense** — Track expenses by category (Food, Travel, Shopping, Rent, Others)
- **📋 Transactions** — View, filter, and delete all transactions
- **📈 Budget Management** — Set category-wise budget limits and track spending
- **🔒 Row Level Security** — Each user can only see their own data

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| UI | ShadCN UI, Tailwind CSS, Framer Motion |
| Backend | Supabase (Auth + PostgreSQL) |
| Charts | Recharts |
| Routing | React Router v6 |

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- A [Supabase](https://supabase.com) project

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/Mayanks584/fin-vanshika.git
cd fin-vanshika

# 2. Install dependencies
npm install

# 3. Create .env file with your Supabase credentials
cp .env.example .env
# Edit .env and add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 4. Start the dev server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run this SQL in your Supabase SQL Editor to create the required tables:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  source TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE budgets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  limit_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Policies (users can only access their own data)
CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);
```

## 📁 Project Structure

```
src/
├── components/       # UI components (ShadCN + custom)
├── contexts/         # Auth context (Supabase)
├── lib/              # Supabase client config
├── pages/            # App pages (Dashboard, Login, etc.)
├── services/         # Supabase CRUD services
├── hooks/            # Custom React hooks
└── layouts/          # Dashboard layout
```

## 👤 Author

**Mayank Rana** — [@Mayanks584](https://github.com/Mayanks584)
