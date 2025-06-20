-- migration:20250329032300

-- Fix the starting_price column to ensure it's defined correctly
ALTER TABLE public.auctions
  ALTER COLUMN starting_price TYPE NUMERIC(10, 2);

-- Add a constraint to ensure starting_price is non-negative
ALTER TABLE public.auctions
  ADD CONSTRAINT starting_price_non_negative CHECK (starting_price >= 0);

-- Add index for better query performance on auctions table
CREATE INDEX IF NOT EXISTS auctions_status_idx ON public.auctions(status);
CREATE INDEX IF NOT EXISTS auctions_created_by_idx ON public.auctions(created_by); 