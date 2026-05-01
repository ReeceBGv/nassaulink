'use server'

interface GeocodeResult {
  lat: number
  lng: number
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!address || address.trim().length === 0) return null
  
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address + ', Nassau, The Bahamas')}`,
      { 
        headers: { 
          'User-Agent': 'NassauLink/1.0 (contact@nassaulink.vercel.app)' 
        } 
      }
    )
    
    if (!res.ok) return null
    
    const data = await res.json()
    if (!data || data.length === 0) return null
    
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    }
  } catch {
    return null
  }
}
