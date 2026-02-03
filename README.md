# Expense Manager

A modern expense tracking application built with Next.js 14, Supabase, and TypeScript. Features full CRUD operations, authentication, and comprehensive analytics.

## Features

- 🔐 **Authentication**: Secure login/signup flow with Supabase Auth
- 💰 **Expense Management**: Full CRUD operations (Create, Read, Update, Delete)
- 📊 **Analytics Dashboard**: 
  - Total spending overview
  - Category-wise breakdown with pie charts
  - Daily spending trends with bar charts
  - Average daily spending
- 📱 **Mobile Friendly**: Responsive design that works on all devices
- 🎨 **Modern UI**: Clean, intuitive interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to **Settings** → **API**
3. Copy your **Project URL** and **anon/public key**

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration file located at `supabase/migrations/001_create_expenses_table.sql`

Alternatively, you can copy and paste this SQL:

```sql
-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own expenses
CREATE POLICY "Users can view their own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own expenses
CREATE POLICY "Users can insert their own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own expenses
CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own expenses
CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(date);
CREATE INDEX IF NOT EXISTS expenses_user_date_idx ON expenses(user_id, date);
```

### 5. Install Additional Dependencies

```bash
npm install
```

### 6. Create a User Account (Optional)

You can create a user account via the web interface, or use the provided script:

```bash
npm run create-user hsuganya@example.com yourpassword123
```

Or directly:
```bash
node scripts/create-user.js hsuganya@example.com yourpassword123
```

**Note:** Make sure your `.env.local` file is set up before running this script.

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign Up**: Create a new account with your email and password
2. **Add Expenses**: Click "Add Expense" to record your spending
3. **View Analytics**: See your spending patterns in the dashboard
4. **Edit/Delete**: Manage your expenses with edit and delete options
5. **Filter by Month**: Navigate between months to view historical data

## Project Structure

```
expense-manager/
├── app/
│   ├── dashboard/          # Dashboard page with analytics
│   ├── login/              # Authentication page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (redirects)
│   └── globals.css         # Global styles
├── components/
│   ├── Analytics.tsx       # Analytics dashboard component
│   ├── ExpenseForm.tsx     # Add/Edit expense form
│   └── ExpenseList.tsx     # List of expenses
├── lib/
│   ├── supabase.ts         # Client-side Supabase client
│   ├── supabase-server.ts  # Server-side Supabase client
│   └── database.types.ts   # TypeScript types for database
└── supabase/
    └── migrations/         # Database migration files
```

## Features in Detail

### Authentication
- Email/password authentication via Supabase
- Secure session management
- Protected routes

### Expense Management
- Add expenses with amount, description, category, and date
- Edit existing expenses
- Delete expenses with confirmation
- Filter expenses by month

### Analytics
- **Total Spent**: Sum of all expenses for the selected month
- **Average per Day**: Daily spending average
- **Total Transactions**: Count of expenses
- **Category Breakdown**: Pie chart showing spending by category
- **Daily Spending**: Bar chart showing daily spending trends

### Categories
- Food
- Transport
- Shopping
- Bills
- Entertainment
- Healthcare
- Education
- Other

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure authentication with Supabase Auth
- Environment variables for sensitive keys

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

Make sure to set the environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.