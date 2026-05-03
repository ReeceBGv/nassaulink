import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BusinessPage({ params }: PageProps) {
  const { slug } = await params
  
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-800 mb-4">✅ Route Works!</h1>
        <p className="text-gray-600 mb-4">Slug: {slug}</p>
        <Link href="/" className="text-sm font-medium text-green-700 hover:underline">
          <ArrowLeft size={16} className="inline mr-1" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
