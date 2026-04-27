import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

// Category icon mapping
const categoryIcons: Record<string, string> = {
  'pool-services': '🏊',
  'ac-cooling': '❄️',
  'landscaping': '🌴',
  'auto-repair': '🚗',
  'marine-services': '⚓',
  'trades-repairs': '🔧',
  'catering': '🍽️',
  'home-services': '🏠',
  'restaurant': '🍴',
  'bar': '🍹',
  'spa': '💆',
  'pharmacy': '💊',
  'grocery': '🛒',
  'boating': '🛥️',
  'cafe': '☕',
  'car-rental': '🚙',
  'gym': '💪',
  'tourism': '🏖️',
  'dentist': '🦷',
  'liquor-store': '🍾',
  'veterinary': '🐕',
  'real-estate': '🏘️',
  'hardware': '🔨',
  'laundry': '👕',
  'it-services': '💻',
  'beauty-salon': '💅',
  'courier': '📦',
  'marina': '⛵',
  'printing': '🖨️',
  'bakery': '🥐',
}

const categoryColors: Record<string, { bg: string; hover: string; text: string }> = {
  'pool-services': { bg: 'bg-blue-50', hover: 'hover:bg-blue-100', text: 'text-blue-600' },
  'ac-cooling': { bg: 'bg-cyan-50', hover: 'hover:bg-cyan-100', text: 'text-cyan-600' },
  'landscaping': { bg: 'bg-green-50', hover: 'hover:bg-green-100', text: 'text-green-600' },
  'auto-repair': { bg: 'bg-red-50', hover: 'hover:bg-red-100', text: 'text-red-600' },
  'marine-services': { bg: 'bg-indigo-50', hover: 'hover:bg-indigo-100', text: 'text-indigo-600' },
  'trades-repairs': { bg: 'bg-orange-50', hover: 'hover:bg-orange-100', text: 'text-orange-600' },
  'catering': { bg: 'bg-amber-50', hover: 'hover:bg-amber-100', text: 'text-amber-600' },
  'home-services': { bg: 'bg-teal-50', hover: 'hover:bg-teal-100', text: 'text-teal-600' },
}

export const metadata = {
  title: 'Browse Categories | NassauLink',
  description: 'Browse all business categories in Nassau and across The Bahamas.',
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#0066cc] flex items-center gap-2">
            <span className="w-8 h-8 bg-[#0066cc] rounded-lg flex items-center justify-center text-white text-sm">🏝️</span>
            NassauLink
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-[#0066cc] flex items-center gap-1">
              <ArrowLeft size={16} />
              Home
            </Link>
            <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-[#0066cc]">Sign In</Link>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-3">Browse Categories</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Find exactly what you need across {categories?.length || 0} business categories in Nassau and The Bahamas
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="bg-white rounded-2xl p-2 shadow-sm flex gap-2 border border-gray-100">
            <div className="flex items-center pl-3 text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              className="flex-1 px-2 py-3 rounded-xl bg-transparent border-0 outline-none text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(categories || []).map((cat) => {
            const colors = categoryColors[cat.slug] || { bg: 'bg-gray-50', hover: 'hover:bg-gray-100', text: 'text-gray-600' }
            const icon = categoryIcons[cat.slug] || '🏢'

            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`group bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-[#0066cc] hover:shadow-lg transition-all ${colors.hover}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 ${colors.bg} transition-colors`}>
                  {icon}
                </div>
                <h3 className="font-bold text-[#1a1a2e] mb-1 group-hover:text-[#0066cc] transition-colors">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.listing_count} {cat.listing_count === 1 ? 'listing' : 'listings'}</p>
                <div className="mt-4 flex items-center text-sm font-medium text-[#0066cc] opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse →
                </div>
              </Link>
            )
          })}
        </div>

        {/* Empty State */}
        {(!categories || categories.length === 0) && (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">📂</span>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No categories yet</h3>
            <p className="text-gray-500">Categories will appear here once businesses are added.</p>
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
