-- migration:20250330000006

-- Create an improved function to activate auctions that have reached their start date
CREATE OR REPLACE FUNCTION public.activate_upcoming_auctions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auction_record RECORD;
    affected_rows INTEGER;
BEGIN
    -- Find all upcoming auctions that have reached their start date/time
    FOR auction_record IN
        SELECT id
        FROM public.auctions
        WHERE 
            status = 'upcoming'
            AND (
                -- Check both start_date and start_time columns if they exist
                (
                    EXISTS (
                        SELECT 1 
                        FROM information_schema.columns 
                        WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'start_date'
                    )
                    AND start_date <= CURRENT_TIMESTAMP
                )
                OR (
                    EXISTS (
                        SELECT 1 
                        FROM information_schema.columns 
                        WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'start_time'
                    )
                    AND start_time <= CURRENT_TIMESTAMP
                )
            )
    LOOP
        -- Update the auction status to active
        UPDATE public.auctions
        SET 
            status = 'active',
            updated_at = NOW()
        WHERE id = auction_record.id;
        
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        
        -- Log the activation for auditing
        RAISE NOTICE 'Activated auction % (rows updated: %)', auction_record.id, affected_rows;
    END LOOP;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.activate_upcoming_auctions() TO postgres;
GRANT EXECUTE ON FUNCTION public.activate_upcoming_auctions() TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION public.activate_upcoming_auctions() IS 
'Automatically activates auctions that have reached their start date/time but are still marked as upcoming. Improved version with flexible column name handling.'; 