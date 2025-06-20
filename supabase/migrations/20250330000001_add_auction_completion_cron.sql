-- migration:20250330000001

-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to complete auctions and select winners
CREATE OR REPLACE FUNCTION public.complete_expired_auctions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auction_record RECORD;
    highest_bid RECORD;
BEGIN
    -- Find all active auctions that have reached their end date
    FOR auction_record IN
        SELECT id, starting_price, status, end_date
        FROM public.auctions
        WHERE 
            (status = 'active' OR status = 'upcoming') 
            AND end_date <= NOW()
    LOOP
        -- Find the highest bid for this auction
        SELECT b.bidder_id, b.amount
        INTO highest_bid
        FROM public.bids b
        WHERE b.auction_id = auction_record.id
        ORDER BY b.amount DESC
        LIMIT 1;

        -- Update the auction status to completed and set the winner if there's a bid
        UPDATE public.auctions
        SET 
            status = 'completed',
            updated_at = NOW(),
            winner_id = highest_bid.bidder_id,
            final_price = CASE 
                WHEN highest_bid.amount IS NOT NULL THEN highest_bid.amount
                ELSE auction_record.starting_price
            END
        WHERE id = auction_record.id;
        
        -- Log the completion for auditing
        RAISE NOTICE 'Completed auction %: Winner ID %, Final Price %', 
            auction_record.id, 
            highest_bid.bidder_id, 
            COALESCE(highest_bid.amount, auction_record.starting_price);
    END LOOP;
END;
$$;

-- Create a function to complete a specific auction
CREATE OR REPLACE FUNCTION public.complete_specific_auction(auction_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auction_record RECORD;
    highest_bid RECORD;
    success BOOLEAN := FALSE;
BEGIN
    -- Get the specific auction
    SELECT id, starting_price, status, end_date
    INTO auction_record
    FROM public.auctions
    WHERE id = auction_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Auction with ID % not found', auction_id;
    END IF;
    
    -- Find the highest bid for this auction
    SELECT b.bidder_id, b.amount
    INTO highest_bid
    FROM public.bids b
    WHERE b.auction_id = auction_record.id
    ORDER BY b.amount DESC
    LIMIT 1;
    
    -- Update the auction status to completed and set the winner if there's a bid
    UPDATE public.auctions
    SET 
        status = 'completed',
        updated_at = NOW(),
        winner_id = highest_bid.bidder_id,
        final_price = CASE 
            WHEN highest_bid.amount IS NOT NULL THEN highest_bid.amount
            ELSE auction_record.starting_price
        END
    WHERE id = auction_record.id;
    
    GET DIAGNOSTICS success = ROW_COUNT;
    
    -- Log the completion for auditing
    RAISE NOTICE 'Completed auction %: Winner ID %, Final Price %', 
        auction_record.id, 
        highest_bid.bidder_id, 
        COALESCE(highest_bid.amount, auction_record.starting_price);
        
    RETURN success > 0;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.complete_expired_auctions() TO postgres;
GRANT EXECUTE ON FUNCTION public.complete_expired_auctions() TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_specific_auction(UUID) TO postgres;
GRANT EXECUTE ON FUNCTION public.complete_specific_auction(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_specific_auction(UUID) TO authenticated;

-- Create a cron job to run every minute
SELECT cron.schedule(
    'complete-expired-auctions',  -- job name
    '* * * * *',                  -- every minute
    'SELECT public.complete_expired_auctions();'
);

-- Add comments for documentation
COMMENT ON FUNCTION public.complete_expired_auctions() IS 
'Automatically completes auctions that have reached their end dates, selecting the highest bidder as the winner.';

COMMENT ON FUNCTION public.complete_specific_auction(UUID) IS 
'Completes a specific auction by ID, marking it as completed and selecting the highest bidder as the winner.'; 