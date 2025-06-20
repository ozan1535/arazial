-- migration:20240425000002
-- Add images column to auctions table
ALTER TABLE public.auctions
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'::TEXT[]; 