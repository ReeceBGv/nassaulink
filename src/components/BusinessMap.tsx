'use client'

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { LatLngExpression } from 'leaflet'

interface BusinessMapProps {
  lat?: number | null
  lng?: number | null
  name?: string
  address?: string
}

export default function BusinessMap({ lat, lng, name, address }: BusinessMapProps) {
  // Safety guard: don't render if no coordinates
  if (!lat || !lng) {
    return (
      <div className="h-64 w-full rounded-xl bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">📍 Map location coming soon</p>
      </div>
    )
  }

  const position: LatLngExpression = [lat, lng]

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-[#242926] mb-4">Location</h2>
      
      {/* Address */}
      {address && (
        <p className="text-sm text-gray-500 mb-4">
          {address}, Nassau, Bahamas
        </p>
      )}

      {/* Map */}
      <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-100">
        <MapContainer 
          center={position} 
          zoom={15} 
          className="h-full w-full"
          scrollWheelZoom={false}
        >
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <Marker position={position}>
            <Popup>{name || 'Business location'}</Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Directions Link */}
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block bg-[#000000] hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm"
      >
        Get Directions on Google Maps
      </a>
    </div>
  )
}
