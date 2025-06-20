-- migration:20250329020915

-- Add missing columns to auctions table
ALTER TABLE public.auctions
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS starting_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming'::text;

-- Set column comments for documentation
COMMENT ON COLUMN public.auctions.description IS 'Detailed description of the auction';
COMMENT ON COLUMN public.auctions.starting_price IS 'Starting bid price for the auction';
COMMENT ON COLUMN public.auctions.start_date IS 'Date and time when the auction starts';
COMMENT ON COLUMN public.auctions.end_date IS 'Date and time when the auction ends';
COMMENT ON COLUMN public.auctions.location IS 'Physical or virtual location of the auction';
COMMENT ON COLUMN public.auctions.status IS 'Current status of the auction (upcoming, active, completed, canceled)';
COMMENT ON COLUMN public.auctions.images IS 'Array of image URLs for the auction item';
COMMENT ON COLUMN public.auctions.created_by IS 'Reference to the user who created the auction';
