// Category-matched Unsplash placeholder images
export const unsplashPhotos: Record<string, string[]> = {
  'Pool Services': [
    'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=800&q=80',
    'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  ],
  'AC & Cooling': [
    'https://images.unsplash.com/photo-1631545308772-81a0e0a3a6eb?w=800&q=80',
    'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80',
  ],
  'Landscaping': [
    'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80',
    'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=800&q=80',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80',
  ],
  'Auto Repair': [
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
    'https://images.unsplash.com/photo-1619642757334-4b3e6e3c9b0e?w=800&q=80',
    'https://images.unsplash.com/photo-1530046339160-ce3e5306047d?w=800&q=80',
  ],
  'Marine Services': [
    'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    'https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?w=800&q=80',
  ],
  'Trades & Repairs': [
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
  ],
  'Catering': [
    'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  ],
  'Home Services': [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
  ],
}

// Default fallback images
const defaultPhotos = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
]

export function getPlaceholderPhotos(category: string, count: number = 3): string[] {
  const photos = unsplashPhotos[category] || defaultPhotos
  return photos.slice(0, count)
}

export function getHeroPhoto(category: string): string {
  const photos = unsplashPhotos[category] || defaultPhotos
  return photos[0]
}
