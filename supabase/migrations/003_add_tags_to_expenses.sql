-- Add tags column to expenses table
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for tags for better query performance
CREATE INDEX IF NOT EXISTS expenses_tags_idx ON expenses USING GIN(tags);

