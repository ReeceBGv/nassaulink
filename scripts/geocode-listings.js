#!/usr/bin/env node
/**
 * Geocode NassauLink business listings
 * Uses Nominatim (OpenStreetMap) - free, no API key required
 * Usage: node scripts/geocode-listings.js
 */

const https = require('https')

// Supabase config from env or hardcoded
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cdheueobyfqskigeytss.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkaGV1ZW9ieWZxc2tpZ2V5dHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MTY4MDAsImV4cCI6MjA2MDk5MjgwMH0.4qZGMZzvpZ_oV_KXpN3G8zzJPqr5dPJP7yeU-EdPfY'

// Rate limiting: Nominatim asks for 1 req/sec max
const RATE_LIMIT_MS = 1100

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function nominatimGeocode(address) {
  return new Promise((resolve, reject) => {
    const query = encodeURIComponent(address + ', Nassau, The Bahamas')
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=bs`
    
    const options = {
      headers: {
        'User-Agent': 'NassauLink/1.0 (nassaulink.vercel.app)',
        'Accept-Language': 'en'
      }
    }
    
    https.get(url, options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const results = JSON.parse(data)
          if (results.length > 0) {
            resolve({
              lat: parseFloat(results[0].lat),
              lng: parseFloat(results[0].lon)
            })
          } else {
            resolve(null)
          }
        } catch (e) {
          reject(e)
        }
      })
    }).on('error', reject)
  })
}

async function fetchListings() {
  const url = `${SUPABASE_URL}/rest/v1/listings?select=id,name,address&latitude=is.null&longitude=is.null`
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  })
  return res.json()
}

async function updateListing(id, lat, lng) {
  const url = `${SUPABASE_URL}/rest/v1/listings?id=eq.${id}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ latitude: lat, longitude: lng })
  })
  return res.ok
}

async function main() {
  console.log('🔍 Fetching listings without coordinates...')
  const listings = await fetchListings()
  console.log(`Found ${listings.length} listings to geocode\n`)
  
  let success = 0
  let failed = 0
  
  for (const listing of listings) {
    const address = listing.address || listing.name + ', Nassau'
    console.log(`📍 Geocoding: ${listing.name}`)
    console.log(`   Address: ${address}`)
    
    try {
      const coords = await nominatimGeocode(address)
      
      if (coords) {
        console.log(`   ✅ Found: ${coords.lat}, ${coords.lng}`)
        const updated = await updateListing(listing.id, coords.lat, coords.lng)
        
        if (updated) {
          console.log(`   ✅ Updated database\n`)
          success++
        } else {
          console.log(`   ❌ Failed to update database\n`)
          failed++
        }
      } else {
        console.log(`   ⚠️  No results found\n`)
        failed++
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}\n`)
      failed++
    }
    
    // Rate limit
    await sleep(RATE_LIMIT_MS)
  }
  
  console.log(`\n✨ Done! Success: ${success}, Failed: ${failed}`)
}

main().catch(console.error)
