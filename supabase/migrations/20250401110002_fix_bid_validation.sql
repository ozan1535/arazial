-- Migration to fix bid amount validation to allow first bid equal to start price

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS validate_bid_amount_trigger ON public.bids;
DROP FUNCTION IF EXISTS public.validate_bid_amount();

-- Create updated validation function
CREATE OR REPLACE FUNCTION validate_bid_amount()
RETURNS TRIGGER AS $$
DECLARE
  latest_bid_amount DECIMAL;
  auction_start_price DECIMAL;
  auction_min_increment DECIMAL;
  min_required_amount DECIMAL;
BEGIN
  -- Get the auction details
  SELECT start_price, min_increment INTO auction_start_price, auction_min_increment
  FROM auctions
  WHERE id = NEW.auction_id;
  
  -- Get the latest bid amount for this auction
  SELECT amount INTO latest_bid_amount
  FROM bids
  WHERE auction_id = NEW.auction_id
  ORDER BY amount DESC
  LIMIT 1;
  
  -- If no previous bids exist, allow bid equal to start price
  IF latest_bid_amount IS NULL THEN
    IF NEW.amount < auction_start_price THEN
      RAISE EXCEPTION 'First bid amount (%) must be at least equal to the start price (%)', 
        NEW.amount, auction_start_price;
    END IF;
  ELSE
    -- For subsequent bids, require minimum increment
    min_required_amount := latest_bid_amount + auction_min_increment;
    IF NEW.amount < min_required_amount THEN
      RAISE EXCEPTION 'Bid amount (%) must be at least % (current bid % + minimum increment %)', 
        NEW.amount, min_required_amount, latest_bid_amount, auction_min_increment;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER validate_bid_amount_trigger
  BEFORE INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION validate_bid_amount(); 