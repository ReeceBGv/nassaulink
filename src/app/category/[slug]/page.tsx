import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Phone, MessageCircle, MapPin, Star } from 'lucide-react'
import type { Metadata } from 'next'
import { getHeroPhoto } from '@/lib/photos'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('slug', slug)
    .single()

  if (!category) {
    return { title: 'Category Not Found | NassauLink' }
  }

  return {
    title: `${category.name} in Nassau | NassauLink`,
    description: `Find the best ${category.name.toLowerCase()} businesses in Nassau and across The Bahamas. Call or WhatsApp directly.`,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get category info
  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug, icon, description, image_url')
    .eq('slug', slug)
    .single()

  if (!category) {
    notFound()
  }

  // Get listings in this category
  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('category', category.name)
    .eq('status', 'approved')
    .order('tier', { ascending: false })

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
        <nav className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#000000] flex items-center gap-2">
            <img src="/logo.png" alt="NassauLink" className="h-16 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/categories" className="text-sm font-medium text-gray-500 hover:text-[#000000] flex items-center gap-1">
              <ArrowLeft size={16} />
              Categories
            </Link>
            <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-[#000000]">Sign In</Link>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[#000000]">Home</Link></li>
            <li><span className="text-gray-300">/</span></li>
            <li><Link href="/categories" className="hover:text-[#000000]">Categories</Link></li>
            <li><span className="text-gray-300">/</span></li>
            <li><span className="text-gray-800 font-medium">{category.name}</span></li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{category.icon || '🏢'}</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#242926]">{category.name}</h1>
          </div>
          <p className="text-gray-500 max-w-2xl">
            {category.description || `Find the best ${category.name.toLowerCase()} businesses in Nassau and across The Bahamas.`}
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span>{listings?.length || 0} {listings?.length === 1 ? 'business' : 'businesses'}</span>
            <span className="text-gray-300">•</span>
            <span>Nassau, Bahamas</span>
          </div>
        </div>

        {/* Listings Grid */}
        {listings && listings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing) => {
              const tier = tierConfig[listing.tier as keyof typeof tierConfig] || tierConfig.free

              return (
                <Link
                  key={listing.id}
                  href={`/business/${listing.slug}`}
                  className={`block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border-2 ${tier.border}`}
                >
                  {/* Card Photo */}
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={listing.photos?.[0] || getHeroPhoto(listing.category, listing.category_image_url)}
                      alt={listing.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${tier.badge}`}>
                        {tier.label}
                      </span>
                      <span className="text-xs font-medium text-[#000000] bg-gray-50 px-2.5 py-1 rounded-full">
                        {listing.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-[#242926] text-lg mb-2">{listing.name}</h3>
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
                        {listing.review_count && (
                          <span className="text-xs text-gray-400">({listing.review_count})</span>
                        )}
                      </div>
                    )}

                    {/* Address */}
                    {listing.address && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                        <MapPin size={12} />
                        <span className="line-clamp-1">{listing.address}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
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
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-6">Be the first to list your {category.name.toLowerCase()} business!</p>
            <Link
              href="/signup"
              className="inline-block bg-[#FAD122] hover:bg-[#DDA917] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Add Your Business →
            </Link>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-10 text-center text-gray-500 text-sm mt-20">
        <p>© 2026 NassauLink. Built for The Bahamas. 🇧🇸</p>
      </footer>
    </div>
  )
}
