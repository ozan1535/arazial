-- Allow NULL values for min_increment in auctions table
ALTER TABLE auctions ALTER COLUMN min_increment DROP NOT NULL;

-- Add constraint to ensure min_increment is set for auction type listings
ALTER TABLE auctions ADD CONSTRAINT check_min_increment CHECK (
  (listing_type = 'auction' AND min_increment IS NOT NULL AND min_increment > 0) OR
  (listing_type = 'offer' AND min_increment IS NULL)
); 