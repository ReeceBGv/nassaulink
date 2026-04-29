'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, Phone, Mail, User, MapPin, Globe, FileText, Send, CheckCircle } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const categories = [
  'Pool Services', 'AC & Cooling', 'Landscaping', 'Auto Repair',
  'Marine Services', 'Trades & Repairs', 'Catering', 'Home Services',
  'Restaurant', 'Retail', 'Professional Services', 'Other'
]

export default function ClaimPage() {
  const [formData, setFormData] = useState({
    business_name: '',
    category: '',
    description: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    address: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 6)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const slug = generateSlug(formData.business_name)

    const { error: submitError } = await supabase
      .from('business_claims')
      .insert({
        ...formData,
        slug,
        status: 'pending',
        source: 'manual',
      })

    setLoading(false)

    if (submitError) {
      setError(submitError.message)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Claim Submitted!</h1>
          <p className="text-gray-600 mb-6">
            We received your claim for <strong>{formData.business_name}</strong>. Our team will review it within 24–48 hours and contact you at {formData.contact_email}.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#0066cc] text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    )
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
            <span className="w-8 h-8 bg-[#0066cc] rounded-lg flex items-center justify-center text-white text-sm">🏝️</span>
            NassauLink
          </Link>
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-[#0066cc] flex items-center gap-1 transition-colors">
            <ArrowLeft size={16} />
            Cancel
          </Link>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Building2 size={24} className="text-[#0066cc]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Claim Your Business</h1>
          <p className="text-gray-600 mt-1">
            List your Nassau business on NassauLink. Free and paid plans available.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Business Info */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-[#0066cc]" />
              Business Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  name="business_name"
                  required
                  value={formData.business_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="e.g., Island Pool Services"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                  placeholder="What does your business do?"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone size={18} className="text-[#0066cc]" />
              Contact Details
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="(242) 555-0123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="Same as phone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="info@yourbusiness.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="https://..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="123 Bay Street, Nassau"
                />
              </div>
            </div>
          </div>

          {/* Your Info */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-[#0066cc]" />
              Your Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  name="contact_name"
                  required
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Email *</label>
                <input
                  type="email"
                  name="contact_email"
                  required
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Phone</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="(242) 555-0123"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0066cc] text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Claim
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            By submitting, you confirm you own or are authorized to represent this business.
          </p>
        </form>
      </main>
    </div>
  )
}
