'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'

interface PhotoGalleryProps {
  photos: string[]
  businessName: string
  categoryImage?: string
}

export default function PhotoGallery({ photos, businessName, categoryImage }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Merge uploaded photos with category fallback image
  const displayPhotos = photos?.length > 0 
    ? photos 
    : categoryImage 
      ? [categoryImage] 
      : []

  if (!displayPhotos || displayPhotos.length === 0) {
    return (
      <div className="relative h-64 bg-gradient-to-br from-[#000000] to-[#333333] flex items-center justify-center overflow-hidden rounded-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-32 h-32 bg-white rounded-full" />
          <div className="absolute bottom-8 right-8 w-48 h-48 bg-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative text-center">
          <span className="text-7xl opacity-30">🏢</span>
          <p className="text-white/60 text-sm mt-2">Photo coming soon</p>
        </div>
      </div>
    )
  }

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % displayPhotos.length)
  }

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length)
  }

  return (
    <div className="space-y-3">
      {/* Main Photo */}
      <div 
        className="relative h-64 md:h-80 rounded-2xl overflow-hidden cursor-pointer group"
        onClick={() => setLightboxOpen(true)}
      >
        <Image
          src={displayPhotos[currentIndex]}
          alt={`${businessName} - Photo ${currentIndex + 1}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        
        {/* Navigation Arrows (only if multiple photos) */}
        {displayPhotos.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevPhoto() }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextPhoto() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {displayPhotos.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(i) }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Photo Counter */}
        {displayPhotos.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
            {currentIndex + 1} / {displayPhotos.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {displayPhotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayPhotos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 transition-all ${
                i === currentIndex 
                  ? 'ring-2 ring-[#000000] ring-offset-1' 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={photo}
                alt={`Thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          {displayPhotos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevPhoto() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextPhoto() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          
          <div className="relative w-full h-full max-w-5xl max-h-[85vh] mx-4 my-8">
            <Image
              src={displayPhotos[currentIndex]}
              alt={`${businessName} - Photo ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {currentIndex + 1} / {displayPhotos.length} — {businessName}
          </div>
        </div>
      )}
    </div>
  )
}
