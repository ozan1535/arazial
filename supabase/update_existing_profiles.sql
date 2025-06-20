-- First, check if email and phone_number columns exist, add them if not
DO $$ 
BEGIN
  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
  
  -- Add phone_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;
  END IF;
END $$;

-- Update all existing profiles with email and phone from auth.users
UPDATE public.profiles p
SET 
  email = u.email,
  phone_number = u.phone,
  updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id;

-- Log the results for verification
SELECT 
  COUNT(*) as total_profiles,
  COUNT(email) as profiles_with_email,
  COUNT(phone_number) as profiles_with_phone
FROM public.profiles;

-- Make sure all bids and offers reference valid profiles
-- This is just to verify/debug
SELECT 
  bid.id as bid_id, 
  bid.bidder_id, 
  p.id as profile_id,
  p.email,
  p.phone_number
FROM bids bid
LEFT JOIN public.profiles p ON bid.bidder_id = p.id
LIMIT 10;

-- Check offers too
SELECT 
  o.id as offer_id, 
  o.user_id, 
  p.id as profile_id,
  p.email,
  p.phone_number
FROM offers o
LEFT JOIN public.profiles p ON o.user_id = p.id
LIMIT 10; 