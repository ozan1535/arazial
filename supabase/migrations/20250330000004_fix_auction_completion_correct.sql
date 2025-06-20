-- migration:20250330000004

-- Update the function to properly handle the database schema
CREATE OR REPLACE FUNCTION public.complete_expired_auctions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auction_record RECORD;
    highest_bid RECORD;
BEGIN
    -- Find all active auctions that have reached their end date/time
    FOR auction_record IN
        SELECT id, 
               COALESCE(starting_price, start_price, 0) as starting_price, 
               status
        FROM public.auctions
        WHERE (status = 'active' OR status = 'upcoming') 
        AND end_date <= CURRENT_DATE
    LOOP
        -- Debug logging
        RAISE NOTICE 'Processing auction %: status %', 
            auction_record.id, 
            auction_record.status;

        -- Find the highest bid for this auction
        SELECT b.bidder_id, b.amount
        INTO highest_bid
        FROM public.bids b
        WHERE b.auction_id = auction_record.id
        ORDER BY b.amount DESC
        LIMIT 1;

        -- Log what we found
        IF highest_bid.bidder_id IS NOT NULL THEN
            RAISE NOTICE 'Found highest bid: Bidder %, Amount %', 
                highest_bid.bidder_id, 
                highest_bid.amount;
        ELSE
            RAISE NOTICE 'No bids found for auction %', auction_record.id;
        END IF;

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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.complete_expired_auctions() TO postgres;
GRANT EXECUTE ON FUNCTION public.complete_expired_auctions() TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION public.complete_expired_auctions() IS 
'Automatically completes auctions that have reached their end dates, selecting the highest bidder as the winner.'; 