-- First drop the problematic trigger if it exists
DROP TRIGGER IF EXISTS on_auth_sign_in ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auth_sign_in();

-- Create a safer function to update profile on login
CREATE OR REPLACE FUNCTION public.handle_auth_sign_in() 
RETURNS TRIGGER AS $$
BEGIN
  -- Only attempt to update existing profiles
  -- This avoids issues where profiles might not exist yet
  UPDATE public.profiles
  SET 
    full_name = CASE 
      WHEN new.raw_user_meta_data->>'full_name' IS NOT NULL AND new.raw_user_meta_data->>'full_name' != '' 
        THEN new.raw_user_meta_data->>'full_name'
      WHEN new.raw_user_meta_data->>'display_name' IS NOT NULL AND new.raw_user_meta_data->>'display_name' != '' 
        THEN new.raw_user_meta_data->>'display_name'
      ELSE public.profiles.full_name
    END,
    email = new.email,
    phone_number = COALESCE(
      new.phone, 
      new.raw_user_meta_data->>'phone_number',
      public.profiles.phone_number
    ),
    updated_at = now()
  WHERE id = new.id;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the auth.users table
-- This will trigger whenever a user signs in (which updates last_sign_in_at)
CREATE TRIGGER on_auth_sign_in
AFTER UPDATE OF last_sign_in_at ON auth.users
FOR EACH ROW 
WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
EXECUTE PROCEDURE public.handle_auth_sign_in();

-- Add a comment explaining the trigger
COMMENT ON TRIGGER on_auth_sign_in ON auth.users IS 'Updates profile data from auth data on each sign in'; 