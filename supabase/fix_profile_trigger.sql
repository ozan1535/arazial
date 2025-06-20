-- First, add email and phone_number columns if they don't exist
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

-- Update the trigger function to include email and phone fields
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email,
    phone_number,
    created_at, 
    updated_at,
    role
  )
  VALUES (
    new.id, 
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'display_name',
      ''
    ),
    new.email,
    COALESCE(new.phone, new.raw_user_meta_data->>'phone_number'),
    new.created_at, 
    new.created_at,
    'user'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    full_name = CASE 
      WHEN EXCLUDED.full_name IS NOT NULL AND EXCLUDED.full_name != '' 
      THEN EXCLUDED.full_name
      ELSE public.profiles.full_name
    END,
    email = EXCLUDED.email,
    phone_number = EXCLUDED.phone_number,
    updated_at = EXCLUDED.updated_at;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing user profiles to include their email and phone
UPDATE public.profiles p
SET 
  email = u.email,
  phone_number = u.phone,
  updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id; 