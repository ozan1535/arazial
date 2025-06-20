-- migration:20240426000002

-- Function to accept an offer and handle related updates
CREATE OR REPLACE FUNCTION public.accept_offer(offer_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_auction_id uuid;
    v_auction_owner uuid;
    v_current_user uuid;
BEGIN
    -- Get the current user
    v_current_user := auth.uid();
    
    -- Get the auction ID and owner for the offer
    SELECT a.id, a.created_by
    INTO v_auction_id, v_auction_owner
    FROM offers o
    JOIN auctions a ON a.id = o.auction_id
    WHERE o.id = offer_id;
    
    -- Check if the current user is the auction owner
    IF v_auction_owner != v_current_user THEN
        RAISE EXCEPTION 'Only the auction owner can accept offers';
    END IF;
    
    -- Start transaction
    BEGIN
        -- Mark the selected offer as accepted
        UPDATE offers
        SET status = 'accepted',
            updated_at = NOW()
        WHERE id = offer_id
        AND status = 'pending';
        
        -- If no rows were updated, the offer was not in pending state
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Offer not found or not in pending state';
        END IF;
        
        -- Reject all other pending offers for this auction
        UPDATE offers
        SET status = 'rejected',
            updated_at = NOW()
        WHERE auction_id = v_auction_id
        AND id != offer_id
        AND status = 'pending';
        
        -- Update the auction status to ended and set the final price
        UPDATE auctions
        SET status = 'ended',
            final_price = (SELECT amount FROM offers WHERE id = offer_id),
            updated_at = NOW()
        WHERE id = v_auction_id
        AND created_by = v_current_user;
        
        -- If no rows were updated, the auction was not found or user is not the owner
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Auction not found or user is not the owner';
        END IF;
    END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.accept_offer(uuid) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.accept_offer(uuid) IS 'Accepts an offer, rejects other pending offers, and marks the auction as ended'; 