'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function DeletePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [status, setStatus] = useState('Deleting listing...')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setStatus('No listing ID provided')
      setTimeout(() => router.push('/dashboard'), 2000)
      return
    }

    const deleteListing = async () => {
      const supabase = createClient()
      
      // Verify ownership first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setStatus('You must be signed in')
        setTimeout(() => router.push('/login'), 2000)
        return
      }

      // Check ownership
      const { data: listing } = await supabase
        .from('listings')
        .select('owner_id')
        .eq('id', id)
        .single()

      if (!listing || listing.owner_id !== user.id) {
        setStatus('You can only delete your own listings')
        setTimeout(() => router.push('/dashboard'), 2000)
        return
      }

      // Delete listing
      const { error: deleteError } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)

      if (deleteError) {
        setError(deleteError.message)
        setStatus('Failed to delete listing')
        return
      }

      setStatus('Listing deleted successfully')
      setTimeout(() => router.push('/dashboard'), 1500)
    }

    deleteListing()
  }, [id, router])

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
          🗑️
        </div>
        <p className="text-gray-700 font-medium">{status}</p>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
        {!error && status !== 'Listing deleted successfully' && (
          <div className="mt-4 w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto" />
        )}
      </div>
    </div>
  )
}
