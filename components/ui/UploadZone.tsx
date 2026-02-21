'use client'

import React, { useCallback, useState } from 'react'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number // in MB
  preview?: string | null
  label?: string
}

export function UploadZone({
  onFileSelect,
  accept = 'image/jpeg,image/png',
  maxSize = 5,
  preview,
  label = 'Glisser-déposer ou cliquer pour ajouter'
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const validateAndSelectFile = useCallback((file: File) => {
    setError(null)

    // Check file size
    const maxBytes = maxSize * 1024 * 1024
    if (file.size > maxBytes) {
      setError(`La taille du fichier ne doit pas dépasser ${maxSize}MB`)
      return
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(t => t.trim())
    if (!acceptedTypes.some(type => file.type.match(type.replace('*', '.*')))) {
      setError('Format de fichier non accepté')
      return
    }

    onFileSelect(file)
  }, [accept, maxSize, onFileSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      validateAndSelectFile(file)
    }
  }, [validateAndSelectFile])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSelectFile(file)
    }
  }, [validateAndSelectFile])

  if (preview) {
    return (
      <div className="relative w-full">
        <img
          src={preview}
          alt="Preview"
          className="w-full h-64 object-cover rounded-xl border border-[#27272a]"
        />
        <button
          type="button"
          onClick={() => onFileSelect(null as any)}
          className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black transition-colors"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`block w-full min-h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          isDragging
            ? 'border-white bg-[#27272a]'
            : 'border-[#27272a] bg-[#18181b] hover:border-white'
        }`}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center h-full py-12">
          <svg
            className="w-12 h-12 text-[#9da3af] mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-white font-medium mb-1">{label}</p>
          <p className="text-[#9da3af] text-sm">
            {accept.includes('image') ? 'JPG, PNG' : ''} • Max {maxSize}MB
          </p>
        </div>
      </label>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}
