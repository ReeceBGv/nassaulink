'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PhotoUpload from '@/components/PhotoUpload'

const categories = [
  'Pool Services',
  'AC & Cooling',
  'Landscaping',
  'Auto Repair',
  'Marine Services',
  'Trades & Repairs',
  'Catering',
  'Home Services',
  'Restaurants',
  'Bars & Nightlife',
  'Spa & Wellness',
  'Pharmacy',
  'Grocery & Markets',
  'Boating',
  'Cafes',
  'Car Rental',
  'Gym & Fitness',
  'Tourism',
  'Dental',
  'Liquor Store',
  'Veterinary',
  'Real Estate',
  'Hardware',
  'Laundry',
  'IT Services',
  'Beauty Salon',
  'Courier & Delivery',
  'Marina',
  'Printing',
  'Bakery',
]

interface Listing {
  id: string
  name: string
  category: string
  description: string
  phone: string
  whatsapp: string
  tier: string
  photos?: string[]
}

export default function EditListingForm({ listing }: { listing: Listing }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: listing.name,
    category: listing.category,
    description: listing.description,
    phone: listing.phone,
    whatsapp: listing.whatsapp || '',
    tier: listing.tier,
  })
  const [photos, setPhotos] = useState<string[]>(listing.photos || [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const { error: updateError } = await supabase
      .from('listings')
      .update({
        name: form.name,
        slug,
        category: form.category,
        description: form.description,
        phone: form.phone,
        whatsapp: form.whatsapp || form.phone,
        tier: form.tier,
        photos: photos,
      })
      .eq('id', listing.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-[#0066cc] transition-colors">
          ← Back
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-6">Edit Listing</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-[#0066cc] outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-[#0066cc] outline-none"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-[#0066cc] outline-none min-h-[100px] resize-y"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-[#0066cc] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-[#0066cc] outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
        )}

        <div className="pt-4 border-t border-gray-100">
          <PhotoUpload
            listingId={listing.id}
            existingPhotos={listing.photos || []}
            onPhotosChange={setPhotos}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#ff6b4a] hover:bg-[#e55a3a] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:border-gray-300 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
