-- migration:20250330000003

-- Update the function to complete auctions with a more flexible column check
CREATE OR REPLACE FUNCTION public.complete_expired_auctions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auction_record RECORD;
    highest_bid RECORD;
    end_time_column_name TEXT;
BEGIN
    -- Determine which end time column is being used
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'end_date'
    ) THEN
        end_time_column_name := 'end_date';
    ELSE
        end_time_column_name := 'end_time';
    END IF;

    -- Dynamic SQL to find auctions past their end date
    FOR auction_record IN EXECUTE
        'SELECT id, COALESCE(starting_price, start_price, 0) as starting_price, status, ' || 
        end_time_column_name || ' as end_time ' ||
        'FROM public.auctions ' ||
        'WHERE (status IN (''active'', ''upcoming'')) ' ||
        'AND ' || end_time_column_name || ' <= NOW()'
    LOOP
        -- Debug logging
        RAISE NOTICE 'Processing auction %: status %, end time %', 
            auction_record.id, 
            auction_record.status,
            auction_record.end_time;

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
'Automatically completes auctions that have reached their end dates, selecting the highest bidder as the winner. Improved version with flexible column name handling.'; 