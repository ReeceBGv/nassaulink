const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://cdheueobyfqskigeytss.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkaGV1ZW9ieWZxc2tpZ2V5dHNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzMwNTMyNSwiZXhwIjoyMDkyODgxMzI1fQ.EtZlapuifn8ErEzOSQi7qbY03RSWwBfYX6L37-2nLtw'
)

const sql = `
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

CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Anyone can submit reviews" ON reviews;
CREATE POLICY "Anyone can submit reviews" ON reviews FOR INSERT WITH CHECK (true);

ALTER TABLE listings ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
`

async function run() {
  // Try using rpc to execute SQL (if pg_exec function exists)
  const { data, error } = await supabase.rpc('exec_sql', { sql })
  
  if (error) {
    console.log('RPC method not available:', error.message)
    console.log('\nPlease run the SQL manually in Supabase Dashboard → SQL Editor')
    console.log('File location: ~/nassaulink/supabase/migrations/002_create_reviews_table.sql')
  } else {
    console.log('Migration success!', data)
  }
}

run()
