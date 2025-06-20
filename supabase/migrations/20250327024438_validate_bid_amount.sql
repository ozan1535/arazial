-- Create function to validate bid amount
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
  
  -- If no previous bids exist, use the auction's start price
  IF latest_bid_amount IS NULL THEN
    latest_bid_amount := auction_start_price;
  END IF;
  
  -- Calculate minimum required amount
  min_required_amount := latest_bid_amount + auction_min_increment;
  
  -- Check if bid meets minimum requirements
  IF NEW.amount < min_required_amount THEN
    RAISE EXCEPTION 'Bid amount (%) must be at least % (current bid % + minimum increment %)', 
      NEW.amount, min_required_amount, latest_bid_amount, auction_min_increment;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS validate_bid_amount_trigger ON bids;
CREATE TRIGGER validate_bid_amount_trigger
  BEFORE INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION validate_bid_amount();
