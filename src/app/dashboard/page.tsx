import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Pencil, Eye, Trash2 } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('owner_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Your Listings</h1>
          <p className="text-gray-500 mt-1">Manage your business listings</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/claims"
            className="bg-[#0066cc] hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Eye size={18} />
            Review Claims
          </Link>
          <Link
            href="/dashboard/listings/new"
            className="bg-[#ff6b4a] hover:bg-[#e55a3a] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Add Listing
          </Link>
        </div>
      </div>

      {listings && listings.length > 0 ? (
        <div className="grid gap-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-[#1a1a2e]">{listing.name}</h3>
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
                    listing.tier === 'premium'
                      ? 'bg-red-100 text-red-700'
                      : listing.tier === 'featured'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {listing.tier}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    listing.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {listing.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{listing.category} · {listing.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/listing/${listing.slug}`}
                  target="_blank"
                  className="p-2 text-gray-400 hover:text-[#0066cc] transition-colors"
                  title="View"
                >
                  <Eye size={18} />
                </a>
                <Link
                  href={`/dashboard/listings/${listing.id}/edit`}
                  className="p-2 text-gray-400 hover:text-[#0066cc] transition-colors"
                  title="Edit"
                >
                  <Pencil size={18} />
                </Link>
                <a
                  href={`/dashboard/delete?id=${listing.id}`}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
            🏝️
          </div>
          <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">No listings yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Add your first business listing to get found by Nassau residents searching for what you do.
          </p>
          <Link
            href="/dashboard/listings/new"
            className="bg-[#ff6b4a] hover:bg-[#e55a3a] text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Add Your First Listing
          </Link>
        </div>
      )}
    </div>
  )
}
