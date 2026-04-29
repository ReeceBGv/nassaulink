import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-[#000000] flex items-center gap-2">
            <img src="/logo.png" alt="NassauLink" className="h-16 w-auto" />
          </a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-red-500 hover:text-red-600 font-medium">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
