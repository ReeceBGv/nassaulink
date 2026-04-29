import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Building2, Phone, Mail, MapPin, Globe, Clock, ExternalLink } from 'lucide-react'
import AdminClaimActions from '@/components/AdminClaimActions'

export default async function ClaimsAdminPage() {
  const supabase = await createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?redirect=/dashboard/claims')
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Fetch claims
  const { data: claims } = await supabase
    .from('business_claims')
    .select('*')
    .order('created_at', { ascending: false })

  const pending = claims?.filter(c => c.status === 'pending') || []
  const approved = claims?.filter(c => c.status === 'approved') || []
  const rejected = claims?.filter(c => c.status === 'rejected') || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-amber-400 text-amber-900 text-center text-sm font-medium py-2 px-4">
        🚧 Demo Mode — These are sample listings. Real Nassau businesses coming soon.
        <Link href="/signup" className="underline ml-1 hover:text-amber-700">Add your business →</Link>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#2ECFDA] flex items-center gap-2">
            <img src="/logo.png" alt="NassauLink" className="h-16 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-[#2ECFDA]">
              Dashboard
            </Link>
            <span className="text-sm text-gray-500">
              {user.email}
            </span>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Claims</h1>
            <p className="text-gray-600 mt-1">Review and approve business submissions</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-medium">
              {pending.length} Pending
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
              {approved.length} Approved
            </div>
          </div>
        </div>

        {!isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl mb-6">
            ⚠️ You need admin privileges to approve claims. Contact the site owner.
          </div>
        )}

        {/* Pending Claims */}
        {pending.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-amber-600" />
              Pending Review
            </h2>
            <div className="grid gap-4">
              {pending.map((claim) => (
                <ClaimCard key={claim.id} claim={claim} isAdmin={isAdmin} />
              ))}
            </div>
          </div>
        )}

        {/* Approved Claims */}
        {approved.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              Approved
            </h2>
            <div className="grid gap-4">
              {approved.map((claim) => (
                <ClaimCard key={claim.id} claim={claim} isAdmin={isAdmin} readonly />
              ))}
            </div>
          </div>
        )}

        {claims?.length === 0 && (
          <div className="text-center py-16">
            <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No claims yet</h3>
            <p className="text-gray-600 mt-1">
              Business owners haven't submitted any claims. Share the /claim page!
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

function ClaimCard({ claim, isAdmin, readonly = false }: { claim: any, isAdmin: boolean, readonly?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{claim.business_name}</h3>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-cyan-50 text-[#2ECFDA]">
              {claim.category}
            </span>
            {claim.source === 'scraper' && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
                🤖 Scraped
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-3">{claim.description || 'No description provided'}</p>

          <div className="grid md:grid-cols-2 gap-2 text-sm">
            {claim.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={14} className="text-gray-400" />
                {claim.phone}
              </div>
            )}
            {claim.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={14} className="text-gray-400" />
                {claim.email}
              </div>
            )}
            {claim.address && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={14} className="text-gray-400" />
                {claim.address}
              </div>
            )}
            {claim.website && (
              <div className="flex items-center gap-2 text-gray-600">
                <Globe size={14} className="text-gray-400" />
                <a href={claim.website} target="_blank" rel="noopener" className="text-[#2ECFDA] hover:underline">
                  Website <ExternalLink size={12} className="inline" />
                </a>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              <strong>Submitted by:</strong> {claim.contact_name || 'Unknown'} ({claim.contact_email})
              {claim.contact_phone && ` • ${claim.contact_phone}`}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(claim.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {!readonly && isAdmin && (
          <div className="ml-6 flex flex-col gap-2">
            <AdminClaimActions claimId={claim.id} />
          </div>
        )}
      </div>
    </div>
  )
}
