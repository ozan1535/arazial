-- migration:20250330000002

-- Create a function to activate auctions that have reached their start date
CREATE OR REPLACE FUNCTION public.activate_upcoming_auctions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auction_record RECORD;
BEGIN
    -- Find all upcoming auctions that have reached their start date
    FOR auction_record IN
        SELECT id
        FROM public.auctions
        WHERE 
            status = 'upcoming'
            AND start_date <= NOW()
    LOOP
        -- Update the auction status to active
        UPDATE public.auctions
        SET 
            status = 'active',
            updated_at = NOW()
        WHERE id = auction_record.id;
        
        -- Log the activation for auditing
        RAISE NOTICE 'Activated auction %', auction_record.id;
    END LOOP;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.activate_upcoming_auctions() TO postgres;
GRANT EXECUTE ON FUNCTION public.activate_upcoming_auctions() TO service_role;

-- Create a cron job to run every minute
SELECT cron.schedule(
    'activate-upcoming-auctions',  -- job name
    '* * * * *',                   -- every minute
    'SELECT public.activate_upcoming_auctions();'
);

-- Add comment for documentation
COMMENT ON FUNCTION public.activate_upcoming_auctions() IS 
'Automatically activates auctions that have reached their start date but are still marked as upcoming.'; 