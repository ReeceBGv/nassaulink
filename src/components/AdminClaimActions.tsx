'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function AdminClaimActions({ claimId }: { claimId: string }) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [result, setResult] = useState<'approved' | 'rejected' | null>(null)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleApprove = async () => {
    setLoading('approve')
    
    // Call the Supabase function to approve and create listing
    const { data, error } = await supabase
      .rpc('approve_business_claim', { claim_id: claimId })

    setLoading(null)
    
    if (error) {
      alert('Error: ' + error.message)
      return
    }
    
    setResult('approved')
    // Refresh page to show updated status
    window.location.reload()
  }

  const handleReject = async () => {
    setLoading('reject')
    
    const { error } = await supabase
      .from('business_claims')
      .update({ status: 'rejected' })
      .eq('id', claimId)

    setLoading(null)
    
    if (error) {
      alert('Error: ' + error.message)
      return
    }
    
    setResult('rejected')
    window.location.reload()
  }

  if (result) {
    return (
      <span className={`text-sm font-medium ${result === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
        {result === 'approved' ? '✅ Approved' : '❌ Rejected'}
      </span>
    )
  }

  return (
    <>
      <button
        onClick={handleApprove}
        disabled={!!loading}
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {loading === 'approve' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <CheckCircle size={16} />
        )}
        Approve
      </button>
      <button
        onClick={handleReject}
        disabled={!!loading}
        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        {loading === 'reject' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <XCircle size={16} />
        )}
        Reject
      </button>
    </>
  )
}
