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
]

const tiers = [
  { value: 'free', label: 'Free' },
  { value: 'featured', label: 'Featured — $49/mo' },
  { value: 'premium', label: 'Premium — $99/mo' },
]

export default function NewListingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    phone: '',
    whatsapp: '',
    tier: 'free',
  })
  const [photos, setPhotos] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be signed in')
      setLoading(false)
      return
    }

    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const { error: insertError } = await supabase.from('listings').insert({
      owner_id: user.id,
      name: form.name,
      slug,
      category: form.category,
      description: form.description,
      phone: form.phone,
      whatsapp: form.whatsapp || form.phone,
      tier: form.tier,
      status: 'pending',
      photos: photos,
    })

    if (insertError) {
      setError(insertError.message)
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

      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-6">Add New Listing</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-[#0066cc] outline-none"
            placeholder="e.g. Island Blue Pools"
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
            placeholder="What does your business do?"
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
              placeholder="+1 (242) 555-1234"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (if different)</label>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-[#0066cc] outline-none"
              placeholder="+1 (242) 555-5678"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Listing Tier</label>
          <div className="grid grid-cols-3 gap-3">
            {tiers.map((tier) => (
              <button
                key={tier.value}
                type="button"
                onClick={() => setForm({ ...form, tier: tier.value })}
                className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                  form.tier === tier.value
                    ? 'border-[#0066cc] bg-blue-50 text-[#0066cc]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Upload */}
        <PhotoUpload
          listingId="new"
          onPhotosChange={setPhotos}
        />

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#ff6b4a] hover:bg-[#e55a3a] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Listing'}
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
