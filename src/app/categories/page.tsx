import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <header className="bg-white border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#0066cc] flex items-center gap-2">
            <span className="w-8 h-8 bg-[#0066cc] rounded-lg flex items-center justify-center text-white text-sm">🏝️</span>
            NassauLink
          </Link>
          <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-[#0066cc]">Sign In</Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#1a1a2e] mb-8">All Categories</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(categories || []).map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-[#0066cc]"
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4 bg-gray-50">{cat.icon}</div>
              <h3 className="font-bold text-[#1a1a2e] mb-1">{cat.name}</h3>
              <p className="text-sm text-gray-500">{cat.listing_count} listings</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
