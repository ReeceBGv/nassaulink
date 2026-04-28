require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const categories = [
  { name: 'Pool Services', slug: 'pool-services', icon: '🏊', description: 'Pool cleaning, maintenance, and repair services', image_url: 'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=800&q=80' },
  { name: 'AC & Cooling', slug: 'ac-cooling', icon: '❄️', description: 'Air conditioning installation and repair', image_url: 'https://images.unsplash.com/photo-1631545308772-81a0e0a3a6eb?w=800&q=80' },
  { name: 'Landscaping', slug: 'landscaping', icon: '🌴', description: 'Lawn care, gardening, and outdoor services', image_url: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80' },
  { name: 'Auto Repair', slug: 'auto-repair', icon: '🚗', description: 'Car repair, maintenance, and auto shops', image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80' },
  { name: 'Marine Services', slug: 'marine-services', icon: '🛥️', description: 'Boat repair, yacht services, and marine supplies', image_url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80' },
  { name: 'Trades & Repairs', slug: 'trades-repairs', icon: '🔧', description: 'Plumbing, electrical, and handyman services', image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80' },
  { name: 'Catering', slug: 'catering', icon: '🍽️', description: 'Event catering and food services', image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80' },
  { name: 'Home Services', slug: 'home-services', icon: '🏠', description: 'Cleaning, security, and home maintenance', image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80' },
  { name: 'Restaurants', slug: 'restaurants', icon: '🍴', description: 'Restaurants and dining establishments', image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80' },
  { name: 'Bars & Nightlife', slug: 'bars-nightlife', icon: '🍹', description: 'Bars, clubs, and nightlife venues', image_url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80' },
  { name: 'Spa & Wellness', slug: 'spa-wellness', icon: '💆', description: 'Spas, massage, and wellness centers', image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80' },
  { name: 'Pharmacy', slug: 'pharmacy', icon: '💊', description: 'Pharmacies and medical supplies', image_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80' },
  { name: 'Grocery & Markets', slug: 'grocery-markets', icon: '🛒', description: 'Grocery stores and fresh markets', image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80' },
  { name: 'Boating', slug: 'boating', icon: '⚓', description: 'Boat rentals, charters, and services', image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80' },
  { name: 'Cafes', slug: 'cafes', icon: '☕', description: 'Coffee shops and cafes', image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80' },
  { name: 'Car Rental', slug: 'car-rental', icon: '🚙', description: 'Vehicle rental services', image_url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80' },
  { name: 'Gym & Fitness', slug: 'gym-fitness', icon: '💪', description: 'Gyms and fitness centers', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' },
  { name: 'Tourism', slug: 'tourism', icon: '🏖️', description: 'Tours, attractions, and travel services', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
  { name: 'Dental', slug: 'dental', icon: '🦷', description: 'Dental clinics and services', image_url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80' },
  { name: 'Liquor Store', slug: 'liquor-store', icon: '🍾', description: 'Wine, spirits, and beverages', image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80' },
  { name: 'Veterinary', slug: 'veterinary', icon: '🐕', description: 'Veterinary clinics and pet services', image_url: 'https://images.unsplash.com/photo-1628009368231-7bb6c1ed9d26?w=800&q=80' },
  { name: 'Real Estate', slug: 'real-estate', icon: '🏘️', description: 'Property sales and rentals', image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80' },
  { name: 'Hardware', slug: 'hardware', icon: '🔨', description: 'Hardware stores and building supplies', image_url: 'https://images.unsplash.com/photo-1581147036324-c17ac41dd161?w=800&q=80' },
  { name: 'Laundry', slug: 'laundry', icon: '👕', description: 'Laundry and dry cleaning services', image_url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&q=80' },
  { name: 'IT Services', slug: 'it-services', icon: '💻', description: 'Computer repair and tech support', image_url: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800&q=80' },
  { name: 'Beauty Salon', slug: 'beauty-salon', icon: '💅', description: 'Hair, nail, and beauty services', image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80' },
  { name: 'Courier & Delivery', slug: 'courier-delivery', icon: '📦', description: 'Package and document delivery', image_url: 'https://images.unsplash.com/photo-1586864387789-628af9feed72?w=800&q=80' },
  { name: 'Marina', slug: 'marina', icon: '⛵', description: 'Marina services and dockage', image_url: 'https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?w=800&q=80' },
  { name: 'Printing', slug: 'printing', icon: '🖨️', description: 'Printing and copy services', image_url: 'https://images.unsplash.com/photo-1562569633-622303d7938f?w=800&q=80' },
  { name: 'Bakery', slug: 'bakery', icon: '🥐', description: 'Bakeries and pastry shops', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80' },
]

async function seed() {
  console.log('Truncating categories...')
  const { error: truncateError } = await supabase.rpc('truncate_categories')
  
  if (truncateError) {
    console.log('RPC not available, falling back to delete...')
    const { error: deleteError } = await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (deleteError) {
      console.error('Delete failed:', deleteError.message)
      process.exit(1)
    }
  }

  console.log(`Inserting ${categories.length} categories...`)
  
  for (const cat of categories) {
    const { error } = await supabase.from('categories').upsert(cat, { onConflict: 'name' })
    if (error) {
      console.error(`Failed to insert ${cat.name}:`, error.message)
    } else {
      console.log(`✓ ${cat.name}`)
    }
  }

  console.log('\nDone.')
}

seed().catch(console.error)
