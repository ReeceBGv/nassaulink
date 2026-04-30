'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, MessageCircle, ThumbsUp } from 'lucide-react'

interface Review {
  id: string
  rating: number
  title?: string
  content: string
  author_name: string
  created_at: string
  helpful_count: number
}

interface ReviewSectionProps {
  listingId: string
  listingName: string
}

export default function ReviewSection({ listingId, listingName }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchReviews()
  }, [listingId])

  async function fetchReviews() {
    setLoading(true)
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('listing_id', listingId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setReviews(data)
    }
    setLoading(false)
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    const { error } = await supabase
      .from('reviews')
      .insert({
        listing_id: listingId,
        rating,
        title: title.trim() || null,
        content: content.trim(),
        author_name: authorName.trim() || 'Anonymous',
        status: 'approved' // Auto-approve for demo
      })

    if (!error) {
      setTitle('')
      setContent('')
      setAuthorName('')
      setRating(5)
      setShowForm(false)
      fetchReviews()
    }
    setSubmitting(false)
  }

  async function markHelpful(reviewId: string) {
    const { error } = await supabase
      .from('reviews')
      .update({ helpful_count: reviews.find(r => r.id === reviewId)!.helpful_count + 1 })
      .eq('id', reviewId)

    if (!error) {
      fetchReviews()
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            Reviews ({reviews.length})
          </span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-medium text-[#000000] hover:underline"
        >
          {showForm ? 'Cancel' : '+ Write Review'}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={submitReview} className="mb-4 p-3 bg-gray-50 rounded-xl space-y-3">
          {/* Star Rating Selector */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-2xl transition-transform hover:scale-110"
                >
                  {star <= (hoverRating || rating) ? '⭐' : '☆'}
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500 self-center">
                {rating}/5 {rating === 5 ? '(Excellent)' : rating === 4 ? '(Great)' : rating === 3 ? '(Good)' : rating === 2 ? '(Fair)' : '(Poor)'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Review title (optional)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#000000]"
            />
          </div>

          {/* Content */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience as a past customer..."
              required
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#000000] resize-none"
            />
          </div>

          {/* Author */}
          <div>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#000000]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="w-full bg-[#000000] text-white text-sm font-semibold py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-4 text-sm text-gray-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-4 text-sm text-gray-400">
          No reviews yet. Be the first to review {listingName}!
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {reviews.map((review) => (
            <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{review.author_name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-sm">
                        {star <= review.rating ? '⭐' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {review.title && (
                <h4 className="text-sm font-medium text-gray-700 mb-1">{review.title}</h4>
              )}
              <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>
              <button
                onClick={() => markHelpful(review.id)}
                className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-[#000000] transition-colors"
              >
                <ThumbsUp size={12} />
                Helpful ({review.helpful_count})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
