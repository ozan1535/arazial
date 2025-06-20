-- Add the deposit_amount column to the auctions table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'auctions' 
    AND column_name = 'deposit_amount'
  ) THEN
    ALTER TABLE public.auctions
    ADD COLUMN deposit_amount NUMERIC(10, 2) NOT NULL DEFAULT 0;
    
    -- Optional: Add a comment to the column for clarity
    COMMENT ON COLUMN public.auctions.deposit_amount IS 'The required deposit amount for participating in the auction.';
  END IF;
END $$; 