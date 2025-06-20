-- migration:20240531000001

-- First, ensure auctions table has all necessary fields
ALTER TABLE public.auctions 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS area_size NUMERIC,
ADD COLUMN IF NOT EXISTS area_unit TEXT DEFAULT 'm²';

-- Move data from land_listings to auctions where needed
UPDATE public.auctions a
SET 
  title = COALESCE(a.title, l.title),
  description = COALESCE(a.description, l.description),
  location = COALESCE(a.location, l.location),
  area_size = COALESCE(a.area_size, l.area_size),
  area_unit = COALESCE(a.area_unit, l.area_unit),
  images = CASE 
    WHEN a.images IS NULL OR array_length(a.images, 1) IS NULL THEN l.images 
    WHEN l.images IS NOT NULL AND array_length(l.images, 1) > 0 THEN 
      (SELECT array_agg(DISTINCT e) FROM unnest(a.images || l.images) e)
    ELSE a.images
  END
FROM public.land_listings l
WHERE a.land_id = l.id;

-- Create a comment to document that land_listings table is deprecated
COMMENT ON TABLE public.land_listings IS 'DEPRECATED: Data moved to auctions table directly. This table is kept for backward compatibility but should not be used for new data.';

-- You can uncomment the line below to drop the land_listings table completely if you're sure you don't need it
-- DROP TABLE public.land_listings; 