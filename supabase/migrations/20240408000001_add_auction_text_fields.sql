-- Add text columns for emlak_tipi, imar_durumu, ilan_sahibi to auctions table

ALTER TABLE auctions
ADD COLUMN IF NOT EXISTS emlak_tipi TEXT,
ADD COLUMN IF NOT EXISTS imar_durumu TEXT,
ADD COLUMN IF NOT EXISTS ilan_sahibi TEXT; -- Simple text field for owner info

-- Note: Consider adding constraints or foreign keys later if needed.
-- For example, ilan_sahibi could reference auth.users(id) if it stores a user UUID. 