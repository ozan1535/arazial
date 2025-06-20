-- Create phone_auth_codes table for storing OTP codes
CREATE TABLE IF NOT EXISTS public.phone_auth_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE
);

-- Add RLS policies
ALTER TABLE public.phone_auth_codes ENABLE ROW LEVEL SECURITY;

-- Grant access to the service role only
REVOKE ALL ON TABLE public.phone_auth_codes FROM anon, authenticated;
GRANT ALL ON TABLE public.phone_auth_codes TO service_role;

-- Add a column for phone_number to the profiles table if it doesn't already exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone_number TEXT UNIQUE;
  END IF;
END $$; 