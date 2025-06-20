-- migration:20250329023106

-- Check column names and make sure they match with our code
DO $$
BEGIN
    -- Check if we have start_price column
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'start_price'
    ) THEN
        -- If we have start_price but no starting_price, rename it
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'starting_price'
        ) THEN
            ALTER TABLE public.auctions RENAME COLUMN start_price TO starting_price;
        END IF;
    END IF;
    
    -- Ensure starting_price exists and update any null values to 0
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'starting_price'
    ) THEN
        -- Update null values to 0
        UPDATE public.auctions SET starting_price = 0 WHERE starting_price IS NULL;
        
        -- Make sure starting_price has a default value and is not null
        ALTER TABLE public.auctions 
        ALTER COLUMN starting_price SET DEFAULT 0,
        ALTER COLUMN starting_price SET NOT NULL;
    ELSE
        -- If neither column exists, create starting_price
        ALTER TABLE public.auctions 
        ADD COLUMN starting_price NUMERIC(10, 2) NOT NULL DEFAULT 0;
    END IF;
END $$;
