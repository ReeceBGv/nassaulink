import Link from 'next/link'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const name = slug.replace(/-/g, ' ')
  return {
    title: `${name} in Nassau | NassauLink`,
    description: `Find the best ${name} businesses in Nassau and across The Bahamas.`,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="bg-amber-400 text-amber-900 text-center text-sm font-medium py-2 px-4">
        🚧 Demo Mode — Sample category page for {name}
      </div>
      
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <nav className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#000000] flex items-center gap-2">
            <img src="/logo.png" alt="NassauLink" className="h-16 w-auto" />
          </Link>
          <Link href="/categories" className="text-sm font-medium text-gray-500 hover:text-[#000000]">
            ← Categories
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#242926] mb-4">
          {name}
        </h1>
        <p className="text-gray-500 mb-8">
          This is a demo page for the {name} category. Real listings coming soon!
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border-2 border-gray-200">
              <div className="h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-6xl">🏪</span>
              </div>
              <h3 className="font-bold text-[#242926] mb-2">Sample Business {i}</h3>
              <p className="text-sm text-gray-500">This is a sample listing for demo purposes.</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
