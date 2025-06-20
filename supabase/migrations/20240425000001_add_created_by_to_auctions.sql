-- migration:20240425000001
-- Add created_by column to auctions table
ALTER TABLE public.auctions
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add created_at column if not exists for better tracking
ALTER TABLE public.auctions
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Add updated_at column if not exists
ALTER TABLE public.auctions
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();