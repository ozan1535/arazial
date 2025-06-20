-- migration:20250330000005

-- Comprehensive auction completion function that handles various database structures
CREATE OR REPLACE FUNCTION public.complete_expired_auctions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auction_record RECORD;
    highest_bid RECORD;
    affected_rows INTEGER;
BEGIN
    -- Try multiple approaches to find expired auctions
    FOR auction_record IN
        SELECT 
            id, 
            COALESCE(starting_price, start_price, 0) as starting_price,
            status
        FROM 
            public.auctions
        WHERE 
            (status = 'active' OR status = 'upcoming')
            AND (
                -- Check end_date if it exists
                (
                    EXISTS (
                        SELECT 1 
                        FROM information_schema.columns 
                        WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'end_date'
                    )
                    AND end_date <= CURRENT_TIMESTAMP
                )
                -- Or check end_time if it exists
                OR (
                    EXISTS (
                        SELECT 1 
                        FROM information_schema.columns 
                        WHERE table_schema = 'public' AND table_name = 'auctions' AND column_name = 'end_time'
                    )
                    AND end_time <= CURRENT_TIMESTAMP
                )
            )
    LOOP
        -- Debug logging
        RAISE NOTICE 'Processing auction for completion: ID %, status %', 
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
            RAISE NOTICE 'Highest bid found: Bidder %, Amount %', 
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
        
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        RAISE NOTICE 'Updated % rows for auction %', affected_rows, auction_record.id;
        
        -- Log the completion for auditing
        RAISE NOTICE 'Completed auction %: Winner ID %, Final Price %', 
            auction_record.id, 
            highest_bid.bidder_id, 
            COALESCE(highest_bid.amount, auction_record.starting_price);
    END LOOP;
END;
$$;

-- Manual completion function
CREATE OR REPLACE FUNCTION public.complete_specific_auction(auction_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auction_record RECORD;
    highest_bid RECORD;
    success BOOLEAN := FALSE;
    affected_rows INTEGER;
BEGIN
    -- Get the auction details regardless of column names
    BEGIN
        SELECT 
            id, 
            COALESCE(starting_price, start_price, 0) as starting_price,
            status
        INTO STRICT auction_record
        FROM public.auctions
        WHERE id = auction_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE EXCEPTION 'Auction with ID % not found', auction_id;
    END;
    
    -- Find the highest bid for this auction
    SELECT b.bidder_id, b.amount
    INTO highest_bid
    FROM public.bids b
    WHERE b.auction_id = auction_record.id
    ORDER BY b.amount DESC
    LIMIT 1;
    
    -- Log what we found
    IF highest_bid.bidder_id IS NOT NULL THEN
        RAISE NOTICE 'Manual completion - Highest bid: Bidder %, Amount %', 
            highest_bid.bidder_id, 
            highest_bid.amount;
    ELSE
        RAISE NOTICE 'Manual completion - No bids found for auction %', auction_record.id;
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
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    success := (affected_rows > 0);
    
    -- Log the completion for auditing
    IF success THEN
        RAISE NOTICE 'Manually completed auction %: Winner ID %, Final Price %', 
            auction_record.id, 
            highest_bid.bidder_id, 
            COALESCE(highest_bid.amount, auction_record.starting_price);
    ELSE
        RAISE NOTICE 'Failed to manually complete auction %', auction_record.id;
    END IF;
    
    RETURN success;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.complete_expired_auctions() TO postgres;
GRANT EXECUTE ON FUNCTION public.complete_expired_auctions() TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_specific_auction(UUID) TO postgres;
GRANT EXECUTE ON FUNCTION public.complete_specific_auction(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_specific_auction(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.complete_expired_auctions() IS 
'Comprehensive function to automatically complete auctions that have reached their end date/time, selecting the highest bidder as the winner.';

COMMENT ON FUNCTION public.complete_specific_auction(UUID) IS 
'Improved function to manually complete a specific auction by ID, marking it as completed and selecting the highest bidder as the winner.'; 