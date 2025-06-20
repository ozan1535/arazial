-- Add listing_type enum
CREATE TYPE listing_type AS ENUM ('auction', 'offer');

-- Add new columns to auctions table
ALTER TABLE auctions
ADD COLUMN listing_type listing_type NOT NULL DEFAULT 'auction',
ADD COLUMN offer_increment decimal(19,4);

-- Add check constraint to ensure offer_increment is set for offer type listings
ALTER TABLE auctions
ADD CONSTRAINT check_offer_increment CHECK (
  (listing_type = 'offer' AND offer_increment IS NOT NULL AND offer_increment > 0) OR
  (listing_type = 'auction' AND offer_increment IS NULL)
);

-- Create offers table
CREATE TABLE offers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  auction_id uuid REFERENCES auctions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount decimal(19,4) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT valid_offer_status CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn'))
);

-- Add trigger to validate offer amounts based on increment
CREATE OR REPLACE FUNCTION validate_offer_amount()
RETURNS TRIGGER AS $$
DECLARE
  listing_info RECORD;
  last_offer RECORD;
BEGIN
  -- Get the listing information
  SELECT listing_type, offer_increment, start_price INTO listing_info
  FROM auctions
  WHERE id = NEW.auction_id;

  -- Check if this is an offer-type listing
  IF listing_info.listing_type != 'offer' THEN
    RAISE EXCEPTION 'Cannot make offers on auction-type listings';
  END IF;

  -- Get the last offer for this listing
  SELECT amount INTO last_offer
  FROM offers
  WHERE auction_id = NEW.auction_id
  AND status = 'pending'
  ORDER BY amount DESC
  LIMIT 1;

  -- If this is the first offer, it must be at least the start price
  IF last_offer IS NULL THEN
    IF NEW.amount < listing_info.start_price THEN
      RAISE EXCEPTION 'Offer must be at least the starting price of %', listing_info.start_price;
    END IF;
  ELSE
    -- Check if the new offer amount follows the increment rule
    IF NEW.amount < (last_offer.amount + listing_info.offer_increment) THEN
      RAISE EXCEPTION 'New offer must be at least % more than the current highest offer', listing_info.offer_increment;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_offer_amount_trigger
BEFORE INSERT ON offers
FOR EACH ROW
EXECUTE FUNCTION validate_offer_amount();

-- Add RLS policies for offers table
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own offers and offers on their listings
CREATE POLICY "Users can view their own offers and offers on their listings" ON offers
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM auctions
    WHERE auctions.id = offers.auction_id
    AND auctions.created_by = auth.uid()
  )
);

-- Allow authenticated users to create offers
CREATE POLICY "Authenticated users can create offers" ON offers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own offers
CREATE POLICY "Users can update their own offers" ON offers
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to handle offer acceptance
CREATE OR REPLACE FUNCTION accept_offer(offer_id uuid)
RETURNS void AS $$
BEGIN
  -- Start transaction
  BEGIN
    -- Mark the selected offer as accepted
    UPDATE offers
    SET status = 'accepted',
        updated_at = NOW()
    WHERE id = offer_id
    AND EXISTS (
      SELECT 1 FROM auctions
      WHERE auctions.id = offers.auction_id
      AND auctions.created_by = auth.uid()
    );

    -- Mark all other offers as rejected
    UPDATE offers
    SET status = 'rejected',
        updated_at = NOW()
    WHERE auction_id = (SELECT auction_id FROM offers WHERE id = offer_id)
    AND id != offer_id
    AND status = 'pending';

    -- Update the auction status
    UPDATE auctions
    SET status = 'completed',
        final_price = (SELECT amount FROM offers WHERE id = offer_id),
        updated_at = NOW()
    WHERE id = (SELECT auction_id FROM offers WHERE id = offer_id)
    AND created_by = auth.uid();
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 