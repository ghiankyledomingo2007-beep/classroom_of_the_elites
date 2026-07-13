'use client'

import React, { useRef, useState } from 'react'
import { Camera, Loader2, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export interface AvatarUploaderProps {
  value?: string | null
  userId: string
  onUploadComplete: (url: string) => void
  onError?: (error: string) => void
}

export function AvatarUploader({
  value,
  userId,
  onUploadComplete,
  onError
}: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!acceptedTypes.includes(file.type)) {
      const errMsg = 'Images only (JPEG, PNG, and WebP are accepted)'
      onError?.(errMsg)
      alert(errMsg)
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5 MB
    if (file.size > maxSize) {
      const errMsg = 'Maximum file size is 5 MB'
      onError?.(errMsg)
      alert(errMsg)
      return
    }

    try {
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to public 'avatars' bucket
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      onUploadComplete(publicUrl)
    } catch (err: any) {
      console.error('Avatar upload error:', err)
      const errMsg = err.message || 'Failed to upload profile picture'
      onError?.(errMsg)
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        onClick={isUploading ? undefined : triggerFileInput}
        className={`w-32 h-32 rounded-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center relative overflow-hidden group cursor-pointer ${
          isUploading ? 'cursor-not-allowed opacity-80' : 'hover:border-indigo-500 transition-colors'
        }`}
      >
        {value ? (
          <img 
            src={value} 
            alt="Profile Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center text-zinc-400 dark:text-zinc-500">
            <User className="w-12 h-12 stroke-[1.5]" />
          </div>
        )}
        
        {/* Overlay Hover State */}
        {!isUploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
        )}

        {/* Uploading loader */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}
      </div>

      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      
      <button
        type="button"
        disabled={isUploading}
        onClick={triggerFileInput}
        className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
      >
        {isUploading ? 'Uploading...' : 'Change Profile Picture'}
      </button>
    </div>
  )
}
