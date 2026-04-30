-- Migration: Create reviews table for listing reviews
-- Run this in Supabase Dashboard → SQL Editor

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  author_name VARCHAR(255) DEFAULT 'Anonymous',
  author_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  helpful_count INTEGER DEFAULT 0
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read approved reviews
CREATE POLICY "Anyone can view approved reviews" 
  ON reviews FOR SELECT 
  USING (status = 'approved');

-- Policy: Anyone can insert reviews (for demo purposes)
CREATE POLICY "Anyone can submit reviews" 
  ON reviews FOR INSERT 
  WITH CHECK (true);

-- Update listings table to include review_count if not exists
ALTER TABLE listings 
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Function to update review count on listings
CREATE OR REPLACE FUNCTION update_listing_review_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    UPDATE listings 
    SET review_count = review_count + 1
    WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
    UPDATE listings 
    SET review_count = review_count + 1
    WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE listings 
    SET review_count = review_count - 1
    WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    UPDATE listings 
    SET review_count = review_count - 1
    WHERE id = OLD.listing_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for review count
DROP TRIGGER IF EXISTS update_listing_review_count_trigger ON reviews;
CREATE TRIGGER update_listing_review_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_review_count();
