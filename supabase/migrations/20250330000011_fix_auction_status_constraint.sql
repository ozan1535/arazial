-- migration:20250330000011

-- Drop any existing status constraints on the auctions table
DO $$
BEGIN
    -- Drop the constraint if it exists (try both possible names)
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'auctions_status_check'
        AND table_name = 'auctions'
    ) THEN
        ALTER TABLE public.auctions DROP CONSTRAINT auctions_status_check;
    END IF;
    
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'auctions_status_check1'
        AND table_name = 'auctions'
    ) THEN
        ALTER TABLE public.auctions DROP CONSTRAINT auctions_status_check1;
    END IF;
END$$;

-- Add the correct constraint
ALTER TABLE public.auctions 
ADD CONSTRAINT auctions_status_check 
CHECK (status IN ('upcoming', 'active', 'ended', 'cancelled'));

-- Update any invalid status values to 'ended'
UPDATE public.auctions 
SET status = 'ended' 
WHERE status NOT IN ('upcoming', 'active', 'ended', 'cancelled'); 