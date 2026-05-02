import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return {
    title: `${name} in Nassau | NassauLink`,
    description: `Find the best ${name} businesses in Nassau and across The Bahamas.`,
  }
}

// Category info for when Supabase is empty
const CATEGORY_MAP: Record<string, { name: string; icon: string }> = {
  'restaurants': { name: 'Restaurants', icon: '🍴' },
  'ac-cooling': { name: 'AC & Cooling', icon: '❄️' },
  'pool-services': { name: 'Pool Services', icon: '🏊' },
  'auto-repair': { name: 'Auto Repair', icon: '🔧' },
  'landscaping': { name: 'Landscaping', icon: '🌿' },
  'bars-nightlife': { name: 'Bars & Nightlife', icon: '🍸' },
  'spa-wellness': { name: 'Spa & Wellness', icon: '💆' },
  'pharmacy': { name: 'Pharmacy', icon: '💊' },
  'grocery-markets': { name: 'Grocery & Markets', icon: '🛒' },
  'cafes': { name: 'Cafes', icon: '☕' },
}

function getIconForCategory(categoryName: string): string {
  const entry = Object.entries(CATEGORY_MAP).find(([_, val]) => 
    val.name.toLowerCase() === categoryName.toLowerCase()
  )
  return entry ? entry[1].icon : '🏢'
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  
  // Convert slug to category name (e.g., "ac-cooling" → "AC & Cooling")
  const categoryName = CATEGORY_MAP[slug]?.name || 
    slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  
  const categoryIcon = CATEGORY_MAP[slug]?.icon || '🏢'
  
  // Try to fetch real listings from Supabase
  let listings: any[] = []
  let usingDemoData = true
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('category', categoryName)

        .order('tier', { ascending: false })
      
      if (!error && data && data.length > 0) {
        listings = data
        usingDemoData = false
      }
    } catch (e) {
      console.log('Supabase fetch failed, using demo data')
    }
  }
  
  // Fall back to demo data if no real listings
  if (listings.length === 0) {
    listings = [
      {
        id: '1',
        name: 'Sample Business',
        slug: 'sample-business',
        category: categoryName,
        description: 'This is a sample business listing. Real listings coming soon!',
        address: '123 Bay Street, Nassau',
        phone: '+1-242-555-0123',
        whatsapp: '+1-242-555-0123',
        rating: 4.5,
        review_count: 12,
        tier: 'premium',
        photos: [],
      },
      {
        id: '2',
        name: 'Another Business',
        slug: 'another-business',
        category: categoryName,
        description: 'Another example business to demonstrate the layout.',
        address: '456 East Bay Street, Nassau',
        phone: '+1-242-555-0456',
        whatsapp: null,
        rating: 4.0,
        review_count: 8,
        tier: 'featured',
        photos: [],
      },
    ]
  }
  
  const tierConfig: Record<string, { border: string; badge: string; label: string }> = {
    spotlight: { border: 'border-purple-400', badge: 'bg-purple-100 text-purple-700', label: 'Spotlight' },
    premium: { border: 'border-red-400', badge: 'bg-red-100 text-red-700', label: 'Premium' },
    featured: { border: 'border-amber-400', badge: 'bg-amber-100 text-amber-700', label: 'Featured' },
    free: { border: 'border-transparent', badge: 'bg-gray-100 text-gray-600', label: 'Free' },
  }
  
  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f5f0e8'}}>
      {/* Demo/Data Source Banner */}
      <div style={{
        backgroundColor: usingDemoData ? '#fbbf24' : '#10b981',
        color: usingDemoData ? '#78350f' : 'white',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: 500,
        padding: '8px 16px'
      }}>
        {usingDemoData ? (
          <>🚧 Demo Mode — Showing sample listings. <Link href="/signup" style={{textDecoration: 'underline', marginLeft: '4px'}}>Add your business →</Link></>
        ) : (
          <>✅ Showing real listings from Supabase</>
        )}
      </div>

      {/* Header */}
      <header style={{backgroundColor: 'white', borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0, zIndex: 50}}>
        <nav style={{maxWidth: '896px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Link href="/" style={{fontSize: '20px', fontWeight: 'bold', color: '#000', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <img src="/logo.png" alt="NassauLink" style={{height: '64px', width: 'auto'}} />
          </Link>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <Link href="/categories" style={{fontSize: '14px', fontWeight: 500, color: '#6b7280'}}>
              ← Categories
            </Link>
            <Link href="/login" style={{fontSize: '14px', fontWeight: 500, color: '#6b7280'}}>Sign In</Link>
          </div>
        </nav>
      </header>

      <main style={{maxWidth: '1280px', margin: '0 auto', padding: '48px 24px'}}>
        {/* Breadcrumb */}
        <nav style={{fontSize: '14px', color: '#6b7280', marginBottom: '24px'}}>
          <span><Link href="/" style={{color: '#6b7280'}}>Home</Link></span>
          <span style={{margin: '0 8px'}}>/</span>
          <span><Link href="/categories" style={{color: '#6b7280'}}>Categories</Link></span>
          <span style={{margin: '0 8px'}}>/</span>
          <span style={{color: '#1f2937', fontWeight: 500}}>{categoryName}</span>
        </nav>

        {/* Category Header */}
        <div style={{marginBottom: '40px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
            <span style={{fontSize: '36px'}}>{categoryIcon}</span>
            <h1 style={{fontSize: '36px', fontWeight: 800, color: '#242926'}}>{categoryName}</h1>
          </div>
          <p style={{color: '#6b7280', maxWidth: '672px'}}>
            {listings.length} businesses found in {categoryName}
          </p>
        </div>

        {/* Listings Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'}}>
          {listings.map((listing) => {
            const tier = tierConfig[listing.tier] || tierConfig.free
            const icon = getIconForCategory(listing.category)

            return (
              <Link
                key={listing.id}
                href={`/business/${listing.slug}`}
                style={{display: 'block', backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: `2px solid ${tier.border.includes('purple') ? '#c084fc' : tier.border.includes('red') ? '#f87171' : tier.border.includes('amber') ? '#fbbf24' : 'transparent'}`, transition: 'all 0.2s'}}
              >
                {/* Card Photo - Image for paid tiers, Emoji for free */}
                <div style={{height: '160px', width: '100%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'}}>
                  {['featured', 'premium', 'spotlight'].includes(listing.tier) ? (
                    <>
                      <Image
                        src={listing.photos?.[0] || getHeroPhoto(listing.category, categoryIcon)}
                        alt={listing.name}
                        layout="fill"
                        objectFit="cover"
                        unoptimized={true}
                      />
                      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)'}} />
                    </>
                  ) : (
                    <span style={{fontSize: '48px'}}>{icon}</span>
                  )}
                </div>
                <div style={{padding: '20px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      backgroundColor: tier.badge.includes('purple') ? '#faf5ff' : tier.badge.includes('red') ? '#fef2f2' : tier.badge.includes('amber') ? '#fefce8' : '#f3f4f6',
                      color: tier.badge.includes('purple') ? '#7c3aed' : tier.badge.includes('red') ? '#dc2626' : tier.badge.includes('amber') ? '#d97706' : '#4b5563',
                    }}>
                      {tier.label}
                    </span>
                    <span style={{fontSize: '12px', fontWeight: 500, color: '#000', backgroundColor: '#f9fafb', padding: '4px 10px', borderRadius: '999px'}}>
                      {listing.category}
                    </span>
                  </div>

                  <h3 style={{fontWeight: 700, color: '#242926', fontSize: '18px', marginBottom: '8px'}}>{listing.name}</h3>
                  <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '16px'}}>{listing.description}</p>

                  {/* Address */}
                  {listing.address && (
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9ca3af', marginBottom: '16px'}}>
                      📍 <span>{listing.address}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{display: 'flex', gap: '8px'}}>
                    {listing.whatsapp && (
                      <a
                        href={`https://wa.me/${String(listing.whatsapp).replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{flex: 1, backgroundColor: '#25d366', color: 'white', fontSize: '14px', fontWeight: 600, padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none'}}
                      >
                        💬 WhatsApp
                      </a>
                    )}
                    <a
                      href={`tel:${listing.phone}`}
                      style={{width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', textDecoration: 'none'}}
                    >
                      📞
                    </a>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>

      <footer style={{backgroundColor: 'white', borderTop: '1px solid #f3f4f6', padding: '40px 24px', textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '80px'}}>
        <p>© 2026 NassauLink. Built for The Bahamas. 🇧🇸</p>
      </footer>
    </div>
  )
}
