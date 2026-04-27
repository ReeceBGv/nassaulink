import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Search, Phone, MessageCircle } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'approved')
    .order('tier', { ascending: false })
    .limit(6)

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  const stats = {
    listings: listings?.length || 0,
    categories: categories?.length || 0,
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#0066cc] flex items-center gap-2">
            <span className="w-8 h-8 bg-[#0066cc] rounded-lg flex items-center justify-center text-white text-sm">🏝️</span>
            NassauLink
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
          <div className="bg-white rounded-2xl p-2 shadow-xl flex gap-2 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search for plumbers, caterers, auto shops..."
              className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border-0 outline-none text-gray-800 placeholder-gray-400"
            />
            <button className="bg-[#ff6b4a] hover:bg-[#e55a3a] text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2">
              <Search size={18} />
              Search
            </button>
          </div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(categories || []).map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="bg-white rounded-xl p-5 shadow-sm border border-transparent hover:border-[#0066cc] hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 bg-gray-50 group-hover:bg-blue-50 transition-colors">
                {cat.icon}
              </div>
              <h3 className="font-semibold text-[#1a1a2e]">{cat.name}</h3>
              <p className="text-sm text-gray-500">{cat.listing_count} listings</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-8 max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#1a1a2e]">Featured Listings</h2>
          <Link href="/listings" className="text-[#0066cc] font-semibold text-sm hover:underline">See all →</Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(listings || []).map((listing) => (
            <div
              key={listing.id}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border-2 ${
                listing.tier === 'premium' ? 'border-[#ff6b4a]' : listing.tier === 'featured' ? 'border-amber-400' : 'border-transparent'
              }`}
            >
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
            </div>
          ))}
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
