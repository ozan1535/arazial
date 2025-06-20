-- Add ada_no and parsel_no columns to auctions table
ALTER TABLE auctions
ADD COLUMN ada_no TEXT,
ADD COLUMN parsel_no TEXT; 