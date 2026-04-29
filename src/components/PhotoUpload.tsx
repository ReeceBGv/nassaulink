'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface PhotoUploadProps {
  listingId: string
  existingPhotos?: string[]
  onPhotosChange?: (photos: string[]) => void
}

export default function PhotoUpload({ listingId, existingPhotos = [], onPhotosChange }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Enforce max 5 photos total
    const remainingSlots = 5 - photos.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)
    if (filesToUpload.length === 0) {
      setError('Maximum 5 photos allowed. Remove some first.')
      return
    }

    setUploading(true)
    setError('')

    const supabase = createClient()
    const newPhotos: string[] = []

    for (const file of filesToUpload) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        setError('Please upload only image files')
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be under 5MB')
        continue
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${listingId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('business-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        setError(uploadError.message)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('business-photos')
        .getPublicUrl(fileName)

      newPhotos.push(publicUrl)
    }

    const updatedPhotos = [...photos, ...newPhotos]
    setPhotos(updatedPhotos)
    onPhotosChange?.(updatedPhotos)
    setUploading(false)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removePhoto = async (index: number) => {
    const photoToRemove = photos[index]
    const updatedPhotos = photos.filter((_, i) => i !== index)
    setPhotos(updatedPhotos)
    onPhotosChange?.(updatedPhotos)

    // Try to delete from storage
    const supabase = createClient()
    const path = photoToRemove.split('/business-photos/').pop()
    if (path) {
      await supabase.storage.from('business-photos').remove([path])
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Photos
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Upload up to 5 photos of your business. First photo will be the main image.
        </p>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
              <Image
                src={photo}
                alt={`Business photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="150px"
              />
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-[#000000] text-white text-xs px-2 py-0.5 rounded-full">
                  Main
                </div>
              )}
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {photos.length < 5 && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 hover:border-[#000000] rounded-xl p-6 flex flex-col items-center gap-2 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <div className="w-8 h-8 border-2 border-[#000000] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Upload size={24} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Click to upload photos</span>
              <span className="text-xs text-gray-400">JPG, PNG up to 5MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
      )}
    </div>
  )
}
