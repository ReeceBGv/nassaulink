import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

export const metadata = {
  title: 'Browse Categories | NassauLink',
  description: 'Browse all business categories in Nassau and across The Bahamas.',
}

export default async function CategoriesPage() {
  let categories: any[] = []
  let countMap: Record<string, number> = {}

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase = supabaseUrl && supabaseKey ? createClient() : null

  let categories: any[] = []
  let countMap: Record<string, number> = {}

  if (supabase) {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, icon, image_url, description')
      .order('name')
    categories = data || []

    // Get actual listing counts per category
    const { data: listings } = await supabase
      .from('listings')
      .select('category')

    if (listings) {
      for (const listing of listings) {
        countMap[listing.category] = (countMap[listing.category] || 0) + 1
      }
    }
  }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Show warning if Supabase not configured or no categories */}
      {(!supabase || categories.length === 0) && (
        <div className="bg-amber-400 text-amber-900 text-center text-sm font-medium py-2 px-4">
          🚧 {supabase ? 'No categories found.' : 'Database connection not configured.'} 
          <Link href="/signup" className="underline ml-1 hover:text-amber-700">Add your business →</Link>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#000000] flex items-center gap-2">
            <img src="/logo.png" alt="NassauLink" className="h-16 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-[#000000] flex items-center gap-1">
              <ArrowLeft size={16} />
              Home
            </Link>
            <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-[#000000]">Sign In</Link>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#242926] mb-3">Browse Categories</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Find exactly what you need across {categories?.length || 0} business categories in Nassau and The Bahamas
          </p>
        </div>

        {/* Search Bar */}
        <form action="/search" method="GET" className="max-w-xl mx-auto mb-12">
          <div className="bg-white rounded-2xl p-2 shadow-sm flex gap-2 border border-gray-100">
            <div className="flex items-center pl-3 text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              name="q"
              placeholder="Search categories..."
              className="flex-1 px-2 py-3 rounded-xl bg-transparent border-0 outline-none text-gray-800 placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-[#000000] hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(categories || []).map((cat) => {
            const icon = cat.icon || '🏢'

            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-transparent hover:border-[#000000] hover:shadow-lg transition-all"
              >
                {/* Category Icon Only */}
                <div className="p-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl mb-3 bg-gray-50 group-hover:bg-gray-100 transition-colors">
                    {icon}
                  </div>
                  <h3 className="font-bold text-[#242926] mb-1 group-hover:text-[#000000] transition-colors">{cat.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{cat.description || 'Local businesses in Nassau'}</p>
                  <p className="text-sm text-gray-500">{countMap[cat.name] || 0} {countMap[cat.name] === 1 ? 'listing' : 'listings'}</p>
                  <div className="mt-4 flex items-center text-sm font-medium text-[#000000] opacity-0 group-hover:opacity-100 transition-opacity">
                    Browse →
                  </div>
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
