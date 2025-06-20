-- Migration to remove the incorrect offer amount validation

-- Drop the trigger that enforces offer amount >= start price
DROP TRIGGER IF EXISTS validate_offer_amount_trigger ON public.offers;

-- Drop the associated function
DROP FUNCTION IF EXISTS public.validate_offer_amount(); 