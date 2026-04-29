import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Phone, MessageCircle } from 'lucide-react'
import { getHeroPhoto } from '@/lib/photos'

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'approved')
    .order('tier', { ascending: false })
    .limit(6)

  const { data: allListings } = await supabase
    .from('listings')
    .select('category')
    .eq('status', 'approved')

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, icon, description, image_url')
    .order('name')

  // Build a lookup map: category name → image_url for fast fallback
  const categoryImageMap = new Map(
    (categories || []).map((c) => [c.name, c.image_url])
  )

  const { count: totalListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const stats = {
    listings: totalListings || 0,
    categories: categories?.length || 0,
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
            <img src="/logo.jpg" alt="NassauLink" className="h-12 w-auto" />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/categories" className="text-sm font-medium text-gray-500 hover:text-[#0066cc] transition-colors">Categories</Link>
            <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-[#0066cc] transition-colors">Sign In</Link>
            <Link href="/signup" className="bg-[#ff6b4a] hover:bg-[#e55a3a] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              List Your Business
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0066cc] to-[#004499] text-white py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-3xl mx-auto px-6 relative">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Nassau's Best Kept Secrets,<br /><span className="text-blue-300">Finally Searchable</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
            The only directory built for how Bahamians actually find local businesses — click, chat, done.
          </p>
          <form action="/search" method="GET" className="bg-white rounded-2xl p-2 shadow-xl flex gap-2 max-w-xl mx-auto">
            <input
              type="text"
              name="q"
              placeholder="Search for plumbers, caterers, auto shops..."
              className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border-0 outline-none text-gray-800 placeholder-gray-400"
            />
            <button type="submit" className="bg-[#ff6b4a] hover:bg-[#e55a3a] text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2">
              <Search size={18} />
              Search
            </button>
          </form>
          <div className="flex justify-center gap-12 mt-10">
            <div className="text-center">
              <span className="text-3xl font-bold">{stats.listings}</span>
              <span className="block text-sm text-blue-200">Verified Listings</span>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold">{stats.categories}</span>
              <span className="block text-sm text-blue-200">Categories</span>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold">4.9★</span>
              <span className="block text-sm text-blue-200">Average Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#1a1a2e]">Browse by Category</h2>
          <Link href="/categories" className="text-[#0066cc] font-semibold text-sm hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(categories || []).slice(0, 6).map((cat) => {
            const catCount = allListings?.filter(l => l.category === cat.name).length || 0
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="bg-white rounded-xl p-5 shadow-sm border border-transparent hover:border-[#0066cc] hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 bg-gray-50 group-hover:bg-blue-50 transition-colors">
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-[#1a1a2e]">{cat.name}</h3>
                <p className="text-sm text-gray-500">{catCount} {catCount === 1 ? 'listing' : 'listings'}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-8 max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#1a1a2e]">Featured Listings</h2>
          <Link href="/categories" className="text-[#0066cc] font-semibold text-sm hover:underline">Browse all →</Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(listings || []).map((listing) => {
            const catImage = categories?.find(c => c.name === listing.category)?.image_url
            return (
            <Link
              key={listing.id}
              href={`/business/${listing.slug}`}
              className={`relative block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border-2 ${
                listing.tier === 'premium' ? 'border-[#ff6b4a]' : listing.tier === 'featured' ? 'border-amber-400' : 'border-transparent'
              }`}
            >
              {/* Demo Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-gray-900/70 text-white backdrop-blur-sm">
                  Sample Listing
                </span>
              </div>
              <div className="relative h-40 w-full overflow-hidden">
                <Image
                  src={listing.photos?.[0] || getHeroPhoto(listing.category, catImage)}
                  alt={listing.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                    listing.tier === 'premium' ? 'bg-red-100 text-red-700' :
                    listing.tier === 'featured' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {listing.tier}
                  </span>
                  <span className="text-xs font-medium text-[#0066cc] bg-blue-50 px-2.5 py-1 rounded-full">
                    {listing.category}
                  </span>
                </div>
                <h3 className="font-bold text-[#1a1a2e] text-lg mb-2">{listing.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{listing.description}</p>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/${listing.whatsapp?.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#25d366] hover:bg-[#128c7e] text-white text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle size={16} />
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${listing.phone}`}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                  >
                    <Phone size={16} />
                  </a>
                </div>
              </div>
            </Link>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a1a2e] text-white py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Own a local business?</h2>
          <p className="text-gray-400 mb-8">
            Get found by Nassau residents who are actively searching for what you do. No website required.
          </p>
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            <span className="bg-white/10 px-4 py-2 rounded-full text-sm">Free Listing</span>
            <span className="bg-[#ff6b4a] px-4 py-2 rounded-full text-sm font-medium">Featured $49/mo</span>
            <span className="bg-[#ff6b4a] px-4 py-2 rounded-full text-sm font-medium">Premium $99/mo</span>
            <span className="bg-[#ff6b4a] px-4 py-2 rounded-full text-sm font-medium">Spotlight $199/mo</span>
          </div>
          <Link href="/signup" className="bg-[#ff6b4a] hover:bg-[#e55a3a] text-white font-semibold px-8 py-4 rounded-xl text-lg inline-block transition-colors">
            Add Your Business →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-10 text-center text-gray-500 text-sm">
        <p>© 2026 NassauLink. Built for The Bahamas. 🇧🇸</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="#" className="text-[#0066cc] hover:underline">About</Link>
          <Link href="#" className="text-[#0066cc] hover:underline">Privacy</Link>
          <Link href="#" className="text-[#0066cc] hover:underline">Contact</Link>
        </div>
      </footer>
    </div>
  )
}
