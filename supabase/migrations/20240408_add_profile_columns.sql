-- Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Create a function to ensure profile columns exist
CREATE OR REPLACE FUNCTION ensure_profile_columns()
RETURNS void AS $$
BEGIN
  -- Add missing columns if they don't exist
  BEGIN
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
  EXCEPTION WHEN duplicate_column THEN
    -- Column already exists, do nothing
  END;
  
  BEGIN
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
  EXCEPTION WHEN duplicate_column THEN
    -- Column already exists, do nothing
  END;
  
  BEGIN
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code TEXT;
  EXCEPTION WHEN duplicate_column THEN
    -- Column already exists, do nothing
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION ensure_profile_columns() TO authenticated; 