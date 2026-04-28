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

  const title = `${listing.name} | ${listing.category} in Nassau`
  const description = listing.description?.slice(0, 160) || `${listing.name} — ${listing.category} serving Nassau, Bahamas.`

  return {
      title,
      description,
      keywords: `${listing.name}, ${listing.category}, Nassau, Bahamas, local business`,
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'en_BS',
      },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function BusinessDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: listing } = await supabase
    .from('listings')
    .select('*, category_image_url:categories!inner(image_url)')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single()

  if (!listing) {
    notFound()
  }

  const photos = listing.photos?.length > 0
    ? listing.photos
    : getPlaceholderPhotos(listing.category, 3, listing.category_image_url)

  const isPremium = listing.tier === 'premium'
  const isFeatured = listing.tier === 'featured'

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: listing.name,
            description: listing.description,
            telephone: listing.phone,
            email: listing.email,
            url: listing.website,
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Nassau',
              addressCountry: 'BS',
              streetAddress: listing.address,
            },
            areaServed: {
              '@type': 'City',
              name: 'Nassau',
            },
          }),
        }}
      />

      {/* Header */}
      {/* Demo Banner */}
      <div className="bg-amber-400 text-amber-900 text-center text-sm font-medium py-2 px-4">
        🚧 Demo Mode — These are sample listings. Real Nassau businesses coming soon.
        <Link href="/signup" className="underline ml-1 hover:text-amber-700">Add your business →</Link>
      </div>

      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <nav className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#0066cc] flex items-center gap-2">
            <span className="w-8 h-8 bg-[#0066cc] rounded-lg flex items-center justify-center text-white text-sm">🏝️</span>
            NassauLink
          </Link>
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-[#0066cc] flex items-center gap-1 transition-colors">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Photo Gallery */}
        <PhotoGallery photos={photos} businessName={listing.name} />

        {/* Business Header */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-[#0066cc] bg-blue-50 px-3 py-1 rounded-full">
              {listing.category}
            </span>
            {isPremium && (
              <span className="text-sm font-medium text-[#ff6b4a] bg-orange-50 px-3 py-1 rounded-full flex items-center gap-1">
                <Award size={14} />
                Premium
              </span>
            )}
            {isFeatured && (
              <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full flex items-center gap-1">
                <Star size={14} />
                Featured
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{listing.name}</h1>
          <p className="text-gray-600 mt-2 text-lg leading-relaxed">{listing.description}</p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          {listing.phone && (
            <a
              href={`tel:${listing.phone}`}
              className="flex items-center gap-2 bg-[#0066cc] text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <Phone size={18} />
              Call Now
            </a>
          )}
          {listing.whatsapp && (
            <a
              href={`https://wa.me/${listing.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          )}
          {listing.website && (
            <a
              href={listing.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              <Globe size={18} />
              Website
            </a>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          {listing.address && (
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-[#0066cc]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Address</h3>
                  <p className="text-gray-600 mt-1">{listing.address}</p>
                </div>
              </div>
            </div>
          )}

          {listing.phone && (
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={20} className="text-[#0066cc]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Phone</h3>
                  <a href={`tel:${listing.phone}`} className="text-[#0066cc] hover:underline mt-1 block">
                    {listing.phone}
                  </a>
                </div>
              </div>
            </div>
          )}

          {listing.email && (
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-[#0066cc]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <a href={`mailto:${listing.email}`} className="text-[#0066cc] hover:underline mt-1 block">
                    {listing.email}
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock size={20} className="text-[#0066cc]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Hours</h3>
                <p className="text-gray-600 mt-1">Mon–Fri: 8:00 AM – 5:00 PM</p>
                <p className="text-gray-600">Sat: 9:00 AM – 2:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-br from-[#0066cc] to-blue-700 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Own this business?</h2>
          <p className="text-blue-100 mb-6 max-w-md mx-auto">
            Claim your listing to update photos, respond to reviews, and reach more customers.
          </p>
          <Link
            href="/claim"
            className="inline-flex items-center gap-2 bg-white text-[#0066cc] px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            Claim This Business
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-[#0066cc] rounded-lg flex items-center justify-center text-white text-sm">🏝️</span>
              <span className="font-bold text-[#0066cc]">NassauLink</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 NassauLink. Connecting Nassau businesses with locals.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
