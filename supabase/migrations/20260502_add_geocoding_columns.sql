-- Add latitude and longitude columns for geocoding
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add index for spatial queries
CREATE INDEX IF NOT EXISTS idx_listings_coords ON public.listings (latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
