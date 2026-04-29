import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Phone, MessageCircle, Globe, MapPin, Mail, ArrowLeft, Star, Clock, Award } from 'lucide-react'
import type { Metadata } from 'next'
import PhotoGallery from '@/components/PhotoGallery'
import { getPlaceholderPhotos } from '@/lib/photos'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Force dynamic rendering — do not static generate
export const dynamic = 'force-dynamic'

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: listing } = await supabase
    .from('listings')
    .select('name, description, category, address, phone')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single()

  if (!listing) {
    return { title: 'Business Not Found | NassauLink' }
  }

  return {
    title: `${listing.name} — ${listing.category} in Nassau | NassauLink`,
    description: listing.description,
    openGraph: {
      title: `${listing.name} — ${listing.category} in Nassau`,
      description: listing.description,
      type: 'website',
      locale: 'en_BS',
    },
  }
}

export default async function BusinessPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: listing, error } = await supabase
    .from('listings')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single()

  if (error || !listing) {
    notFound()
  }

  // Fetch category image_url separately
  const { data: categoryRow } = await supabase
    .from('categories')
    .select('image_url')
    .eq('name', listing.category || '')
    .single()

  const categoryImageUrl = categoryRow?.image_url

  // Fetch related listings from same category
  const { data: related } = await supabase
    .from('listings')
    .select('id, name, slug, category, description, phone, whatsapp, tier')
    .eq('category', listing.category)
    .eq('status', 'approved')
    .neq('id', listing.id)
    .limit(3)

  // Schema.org LocalBusiness JSON-LD
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: listing.name,
    description: listing.description,
    telephone: listing.phone,
    ...(listing.whatsapp && {
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'WhatsApp',
        telephone: listing.whatsapp,
        availableLanguage: 'English',
      },
    }),
    ...(listing.email && { email: listing.email }),
    ...(listing.website && { url: listing.website }),
    ...(listing.address && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Nassau',
        addressRegion: 'New Providence',
        addressCountry: 'BS',
        streetAddress: listing.address,
      },
    }),
    ...(listing.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: listing.rating,
        reviewCount: listing.review_count || 1,
      },
    }),
    areaServed: {
      '@type': 'City',
      name: 'Nassau',
      containedInPlace: {
        '@type': 'Country',
        name: 'The Bahamas',
      },
    },
  }

  const tierConfig = {
    spotlight: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Spotlight' },
    premium: { bg: 'bg-red-100', text: 'text-red-700', label: 'Premium' },
    featured: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Featured' },
    free: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Free Listing' },
  }

  const tier = tierConfig[listing.tier as keyof typeof tierConfig] || tierConfig.free

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Demo Banner */}
      <div className="bg-amber-400 text-amber-900 text-center text-sm font-medium py-2 px-4">
        🚧 Demo Mode — These are sample listings. Real Nassau businesses coming soon.
        <Link href="/signup" className="underline ml-1 hover:text-amber-700">Add your business →</Link>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <nav className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#0066cc] flex items-center gap-2">
            <img src="/logo.jpg" alt="NassauLink" className="h-10 w-auto" />
          </Link>
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-[#0066cc] flex items-center gap-1 transition-colors">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-[#0066cc]">Home</Link></li>
            <li><span className="text-gray-300">/</span></li>
            <li><Link href={`/category/${listing.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-[#0066cc]">{listing.category}</Link></li>
            <li><span className="text-gray-300">/</span></li>
            <li><span className="text-gray-800 font-medium">{listing.name}</span></li>
          </ol>
        </nav>

        {/* Business Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Photo Gallery */}
          <div className="relative">
            <PhotoGallery 
              photos={listing.photos?.length > 0 ? listing.photos : getPlaceholderPhotos(listing.category, 3, categoryImageUrl)} 
              businessName={listing.name}
              categoryImage={categoryImageUrl}
            />
            {/* Tier Badge */}
            <div className="absolute top-3 right-3 z-10">
              <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full ${tier.bg} ${tier.text}`}>
                {tier.label}
              </span>
            </div>
          </div>

          <div className="p-8">
            {/* Demo Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-gray-900 text-white">
                Sample Listing
              </span>
              <span className="text-xs font-medium text-[#0066cc] bg-blue-50 px-2.5 py-1 rounded-full">
                {listing.category}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-[#1a1a2e] mb-3">{listing.name}</h1>

            {/* Rating */}
            {listing.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(listing.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{listing.rating}</span>
                {listing.review_count && (
                  <span className="text-sm text-gray-400">({listing.review_count} reviews)</span>
                )}
              </div>
            )}

            <p className="text-gray-600 text-lg leading-relaxed mb-8">{listing.description}</p>

            {/* Primary CTA Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              <a
                href={`tel:${listing.phone}`}
                className="flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#004499] text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm"
              >
                <Phone size={18} />
                Call Now
              </a>
              {listing.whatsapp && (
                <a
                  href={`https://wa.me/${listing.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#128c7e] text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>
              )}
            </div>

            {/* Contact Details */}
            <div className="border-t border-gray-100 pt-6 space-y-3">
              <h3 className="font-bold text-[#1a1a2e] mb-4">Contact Information</h3>

              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} className="text-[#0066cc] shrink-0" />
                <a href={`tel:${listing.phone}`} className="hover:text-[#0066cc] transition-colors font-medium">
                  {listing.phone}
                </a>
              </div>

              {listing.whatsapp && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MessageCircle size={18} className="text-[#25d366] shrink-0" />
                  <a
                    href={`https://wa.me/${listing.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#25d366] transition-colors"
                  >
                    {listing.whatsapp}
                  </a>
                </div>
              )}

              {listing.email && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={18} className="text-gray-400 shrink-0" />
                  <a href={`mailto:${listing.email}`} className="hover:text-[#0066cc] transition-colors">
                    {listing.email}
                  </a>
                </div>
              )}

              {listing.website && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Globe size={18} className="text-gray-400 shrink-0" />
                  <a
                    href={listing.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#0066cc] transition-colors"
                  >
                    {listing.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}

              {listing.address && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin size={18} className="text-gray-400 shrink-0" />
                  <span>{listing.address}</span>
                </div>
              )}
            </div>

            {/* Hours Placeholder */}
            <div className="border-t border-gray-100 pt-6 mt-6">
              <h3 className="font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
                <Clock size={18} className="text-gray-400" />
                Business Hours
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
                <p>Hours information coming soon. Call to confirm current hours.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Listings */}
        {related && related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-[#1a1a2e] mb-4">More {listing.category} in Nassau</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/business/${item.slug}`}
                  className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-[#0066cc]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                      item.tier === 'premium' ? 'bg-red-100 text-red-700' :
                      item.tier === 'featured' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {item.tier}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#1a1a2e] mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>
                  <div className="flex gap-2">
                    {item.whatsapp && (
                      <a
                        href={`https://wa.me/${item.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-[#25d366] text-white px-3 py-1.5 rounded-lg font-medium"
                      >
                        WhatsApp
                      </a>
                    )}
                    <a
                      href={`tel:${item.phone}`}
                      className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium"
                    >
                      Call
                    </a>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-10 text-center text-gray-500 text-sm mt-20">
        <p>© 2026 NassauLink. Built for The Bahamas. 🇧🇸</p>
      </footer>
    </div>
  )
}
