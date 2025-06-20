-- Create a function to check if a phone number exists in auth.users
CREATE OR REPLACE FUNCTION public.check_phone_exists(phone_number TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  phone_exists BOOLEAN;
BEGIN
  -- Check if the phone number exists in auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE phone = phone_number
  ) INTO phone_exists;
  
  RETURN phone_exists;
END;
$$;

-- Grant execute to all roles
GRANT EXECUTE ON FUNCTION public.check_phone_exists TO anon;
GRANT EXECUTE ON FUNCTION public.check_phone_exists TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_phone_exists TO service_role; 