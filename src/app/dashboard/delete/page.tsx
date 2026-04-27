export async function generateStaticParams() {
  return []
}

export default function DeletePage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
          🗑️
        </div>
        <p className="text-gray-500">Deleting listing...</p>
      </div>
    </div>
  )
}