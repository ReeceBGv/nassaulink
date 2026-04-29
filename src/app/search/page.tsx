import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ArrowLeft, Phone, MessageCircle, MapPin, Star, SlidersHorizontal } from 'lucide-react'
import { getHeroPhoto } from '@/lib/photos'

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; tier?: string }>
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { q } = await searchParams
  return {
    title: q ? `Search: ${q} | NassauLink` : 'Search | NassauLink',
    description: 'Find local businesses in Nassau and The Bahamas.',
  }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, category: catFilter, tier: tierFilter } = await searchParams
  const query = (q || '').toLowerCase().trim()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get all approved listings
  let dbQuery = supabase
    .from('listings')
    .select('*')
    .eq('status', 'approved')

  if (catFilter) {
    dbQuery = dbQuery.eq('category', catFilter)
  }

  if (tierFilter) {
    dbQuery = dbQuery.eq('tier', tierFilter)
  }

  const { data: listings } = await dbQuery.order('tier', { ascending: false })

  // Filter by search query
  const filtered = query
    ? listings?.filter((l) =>
        l.name.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query) ||
        l.category.toLowerCase().includes(query) ||
        (l.address && l.address.toLowerCase().includes(query))
      )
    : listings

  // Get categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('name, slug, image_url')
    .order('name')

  // Build a lookup map: category name → image_url for fast fallback
  const categoryImageMap = new Map(
    (categories || []).map((c) => [c.name, c.image_url])
  )

  const tierConfig = {
    spotlight: { border: 'border-purple-400', badge: 'bg-purple-100 text-purple-700', label: 'Spotlight' },
    premium: { border: 'border-red-400', badge: 'bg-red-100 text-red-700', label: 'Premium' },
    featured: { border: 'border-amber-400', badge: 'bg-amber-100 text-amber-700', label: 'Featured' },
    free: { border: 'border-transparent', badge: 'bg-gray-100 text-gray-600', label: 'Free' },
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Demo Banner */}
      <div className="bg-amber-400 text-amber-900 text-center text-sm font-medium py-2 px-4">
        🚧 Demo Mode — These are sample listings. Real Nassau businesses coming soon.
        <Link href="/signup" className="underline ml-1 hover:text-amber-700">Add your business →</Link>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#0066cc] flex items-center gap-2">
            <img src="/logo.jpg" alt="NassauLink" className="h-16 w-auto" />
          </Link>
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-[#0066cc] flex items-center gap-1">
            <ArrowLeft size={16} />
            Home
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#1a1a2e] mb-4">
            {query ? `Results for "${q}"` : 'Search Businesses'}
          </h1>

          {/* Search Form */}
          <form action="/search" method="GET" className="max-w-2xl">
            <div className="bg-white rounded-2xl p-2 shadow-sm flex gap-2 border border-gray-100">
              <div className="flex items-center pl-3 text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                name="q"
                defaultValue={q || ''}
                placeholder="Search by name, category, or service..."
                className="flex-1 px-2 py-3 rounded-xl bg-transparent border-0 outline-none text-gray-800 placeholder-gray-400"
                autoFocus
              />
              <button
                type="submit"
                className="bg-[#0066cc] hover:bg-[#004499] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal size={18} className="text-gray-400" />
                <h2 className="font-bold text-[#1a1a2e]">Filters</h2>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
                <div className="space-y-1">
                  <a
                    href={`/search?q=${encodeURIComponent(query)}`}
                    className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                      !catFilter ? 'bg-blue-50 text-[#0066cc] font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All Categories
                  </a>
                  {categories?.map((cat) => (
                    <a
                      key={cat.slug}
                      href={`/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(cat.name)}`}
                      className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                        catFilter === cat.name ? 'bg-blue-50 text-[#0066cc] font-medium' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Tier Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Tier</h3>
                <div className="space-y-1">
                  <a
                    href={`/search?q=${encodeURIComponent(query)}${catFilter ? `&category=${encodeURIComponent(catFilter)}` : ''}`}
                    className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                      !tierFilter ? 'bg-blue-50 text-[#0066cc] font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All Tiers
                  </a>
                  {['spotlight', 'premium', 'featured', 'free'].map((tier) => (
                    <a
                      key={tier}
                      href={`/search?q=${encodeURIComponent(query)}${catFilter ? `&category=${encodeURIComponent(catFilter)}` : ''}&tier=${tier}`}
                      className={`block text-sm px-3 py-2 rounded-lg transition-colors capitalize ${
                        tierFilter === tier ? 'bg-blue-50 text-[#0066cc] font-medium' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {tier}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="mb-4 text-sm text-gray-500">
              {filtered?.length || 0} {filtered?.length === 1 ? 'result' : 'results'} found
            </div>

            {filtered && filtered.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-5">
                {filtered.map((listing) => {
                  const tier = tierConfig[listing.tier as keyof typeof tierConfig] || tierConfig.free

                  return (
                    <Link
                      key={listing.id}
                      href={`/business/${listing.slug}`}
                      className={`block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border-2 ${tier.border}`}
                    >
                      {/* Card Photo */}
                      <div className="relative h-44 w-full overflow-hidden">
                        <Image
                          src={listing.photos?.[0] || getHeroPhoto(listing.category, categoryImageMap.get(listing.category))}
                          alt={listing.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${tier.badge}`}>
                            {tier.label}
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-[#0066cc] bg-blue-50 px-2.5 py-1 rounded-full">
                            {listing.category}
                          </span>
                        </div>

                        <h3 className="font-bold text-[#1a1a2e] text-lg mb-2">{listing.name}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{listing.description}</p>

                        {/* Rating */}
                        {listing.rating && (
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < Math.floor(listing.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                              />
                            ))}
                            <span className="text-xs font-medium text-gray-600 ml-1">{listing.rating}</span>
                          </div>
                        )}

                        {/* Address */}
                        {listing.address && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                            <MapPin size={12} />
                            <span className="line-clamp-1">{listing.address}</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          {listing.whatsapp && (
                            <a
                              href={`https://wa.me/${listing.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-[#25d366] hover:bg-[#128c7e] text-white text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                              <MessageCircle size={16} />
                              WhatsApp
                            </a>
                          )}
                          <a
                            href={`tel:${listing.phone}`}
                            className="flex-1 bg-[#0066cc] hover:bg-[#004499] text-white text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                          >
                            <Phone size={16} />
                            Call
                          </a>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl">
                <span className="text-6xl mb-4 block">🔍</span>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No results found</h3>
                <p className="text-gray-500 mb-6">
                  {query
                    ? `No businesses match "${q}". Try a different search term.`
                    : 'Enter a search term to find businesses.'}
                </p>
                <Link
                  href="/categories"
                  className="inline-block bg-[#ff6b4a] hover:bg-[#e55a3a] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  Browse Categories →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-10 text-center text-gray-500 text-sm mt-20">
        <p>© 2026 NassauLink. Built for The Bahamas. 🇧🇸</p>
      </footer>
    </div>
  )
}
