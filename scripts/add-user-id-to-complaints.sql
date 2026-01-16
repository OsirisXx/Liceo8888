-- Add user_id column to complaints table
-- This allows filtering tickets by the logged-in user who created them

-- Add user_id column if it doesn't exist
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
