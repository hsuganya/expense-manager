-- Disable Row Level Security for demo mode (no authentication)
-- This allows the app to work without user authentication

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;

-- Remove foreign key constraint to allow any UUID as user_id
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_user_id_fkey;

-- Create public policies that allow all operations
-- Note: This makes the table publicly accessible - use only for demo/development
CREATE POLICY "Allow public read access" ON expenses
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert" ON expenses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update" ON expenses
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete" ON expenses
  FOR DELETE
  USING (true);

-- Keep RLS enabled but with public policies
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
