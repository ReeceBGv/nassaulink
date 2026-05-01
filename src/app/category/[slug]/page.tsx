import Link from 'next/link'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const name = slug.replace(/-/g, ' ')
  return {
    title: `${name} in Nassau | NassauLink`,
    description: `Find the best ${name} businesses in Nassau and across The Bahamas.`,
  }
}

// Category info for demo mode
const CATEGORY_MAP: Record<string, { name: string; icon: string; description: string }> = {
  'restaurants': { name: 'Restaurants', icon: '🍴', description: 'Restaurants and dining establishments in Nassau and across The Bahamas.' },
  'ac-cooling': { name: 'AC & Cooling', icon: '❄️', description: 'Air conditioning and cooling services in Nassau and across The Bahamas.' },
  'pool-services': { name: 'Pool Services', icon: '🏊', description: 'Pool cleaning and maintenance services in Nassau and across The Bahamas.' },
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  
  const categoryInfo = CATEGORY_MAP[slug]
  const categoryName = categoryInfo?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const categoryIcon = categoryInfo?.icon || '🏢'
  const categoryDesc = categoryInfo?.description || `Find the best ${slug.replace(/-/g, ' ')} businesses in Nassau and across The Bahamas.`
  
  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f5f0e8'}}>
      {/* Demo Banner */}
      <div style={{backgroundColor: '#fbbf24', color: '#78350f', textAlign: 'center', fontSize: '14px', fontWeight: 500, padding: '8px 16px'}}>
        🚧 Demo Mode — These are sample listings. Real Nassau businesses coming soon.
        <Link href="/signup" style={{textDecoration: 'underline', marginLeft: '4px'}}>Add your business →</Link>
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
            {categoryDesc}
          </p>
        </div>

        {/* Listings Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'}}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
              <div style={{height: '160px', backgroundColor: '#f3f4f6', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <span style={{fontSize: '48px'}}>🏪</span>
              </div>
              <h3 style={{fontSize: '18px', fontWeight: 700, color: '#242926', marginBottom: '8px'}}>Sample Business {i}</h3>
              <p style={{fontSize: '14px', color: '#6b7280'}}>This is a sample listing for demo purposes.</p>
            </div>
          ))}
        </div>
      </main>

      <footer style={{backgroundColor: 'white', borderTop: '1px solid #f3f4f6', padding: '40px 24px', textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '80px'}}>
        <p>© 2026 NassauLink. Built for The Bahamas. 🇧🇸</p>
      </footer>
    </div>
  )
}
