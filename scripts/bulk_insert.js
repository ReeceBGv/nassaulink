const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Read scraped listings
const listings = JSON.parse(fs.readFileSync('scripts/scraped_listings.json', 'utf8'))

async function insertListings() {
  console.log(`Inserting ${listings.length} listings...`)
  
  for (const listing of listings) {
    // Generate slug
    const slug = listing.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .slice(0, 60)
    
    const { error } = await supabase
      .from('listings')
      .upsert({
        name: listing.name,
        slug: slug,
        category: listing.category,
        description: listing.description || '',
        phone: listing.phone || '',
        whatsapp: listing.phone || null,
        email: listing.email || null,
        website: listing.website || null,
        address: listing.address || null,
        status: 'approved',
        tier: 'free',
        photos: [],
        rating: null,
        review_count: 0
      }, {
        onConflict: 'slug'
      })
    
    if (error) {
      console.error(`Error inserting ${listing.name}:`, error.message)
    } else {
      console.log(`✓ ${listing.name} → ${slug}`)
    }
  }
  
  console.log('Done!')
}

insertListings()
