'use client'

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { LatLngExpression } from 'leaflet'

interface BusinessMapProps {
  lat?: number | null
  lng?: number | null
  name?: string
}

export default function BusinessMap({ lat, lng, name }: BusinessMapProps) {
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
    <div className="h-64 w-full rounded-xl overflow-hidden">
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
  )
}
