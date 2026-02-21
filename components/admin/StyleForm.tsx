'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface PhotoStyle {
  id: string
  photo_number: number
  style_name: string
  style_description: string | null
  preview_image_url: string
  prompt_template: string
  is_active: boolean
  display_order: number
}

interface StyleFormProps {
  style: PhotoStyle | null // null = création
  defaultPhotoNumber: number
  onSave: (style: PhotoStyle) => void
  onClose: () => void
}

export function StyleForm({ style, defaultPhotoNumber, onSave, onClose }: StyleFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const [photoNumber, setPhotoNumber] = useState(style?.photo_number || defaultPhotoNumber)
  const [styleName, setStyleName] = useState(style?.style_name || '')
  const [styleDescription, setStyleDescription] = useState(style?.style_description || '')
  const [previewImageUrl, setPreviewImageUrl] = useState(style?.preview_image_url || '')
  const [promptTemplate, setPromptTemplate] = useState(style?.prompt_template || '')
  const [isActive, setIsActive] = useState(style?.is_active ?? true)
  const [displayOrder, setDisplayOrder] = useState(style?.display_order || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!styleName.trim() || !promptTemplate.trim() || !previewImageUrl.trim()) {
      alert('Nom, prompt et URL de preview sont requis')
      return
    }

    setIsLoading(true)

    try {
      const method = style ? 'PUT' : 'POST'
      const url = style 
        ? `/api/admin/photo-styles/${style.id}`
        : '/api/admin/photo-styles'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photo_number: photoNumber,
          style_name: styleName.trim(),
          style_description: styleDescription.trim() || null,
          preview_image_url: previewImageUrl.trim(),
          prompt_template: promptTemplate.trim(),
          is_active: isActive,
          display_order: displayOrder,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save style')
      }

      const data = await response.json()
      onSave(data.style)
    } catch (error: any) {
      console.error('Save error:', error)
      alert(`Erreur: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#13151a] rounded-xl max-w-3xl w-full p-6 my-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9da3af] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <h2 className="font-sora font-bold text-white text-2xl mb-6">
          {style ? 'Modifier le style' : 'Créer un style'}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Number */}
          <div>
            <label className="font-inter text-[#9da3af] text-sm mb-2 block">
              Numéro de photo <span className="text-red-500">*</span>
            </label>
            <select
              value={photoNumber}
              onChange={(e) => setPhotoNumber(parseInt(e.target.value))}
              className="w-full bg-[#1f2128] border border-[#2a2d36] rounded-lg px-4 py-3 text-white font-inter text-sm focus:outline-none focus:border-[#6366f1]"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  Photo {num}
                </option>
              ))}
            </select>
          </div>

          {/* Style Name */}
          <div>
            <label className="font-inter text-[#9da3af] text-sm mb-2 block">
              Nom du style <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={styleName}
              onChange={(e) => setStyleName(e.target.value)}
              placeholder="Ex: Urban Lifestyle"
              className="w-full bg-[#1f2128] border border-[#2a2d36] rounded-lg px-4 py-3 text-white font-inter text-sm focus:outline-none focus:border-[#6366f1]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-inter text-[#9da3af] text-sm mb-2 block">
              Description
            </label>
            <input
              type="text"
              value={styleDescription}
              onChange={(e) => setStyleDescription(e.target.value)}
              placeholder="Ex: Style urbain moderne et décontracté"
              className="w-full bg-[#1f2128] border border-[#2a2d36] rounded-lg px-4 py-3 text-white font-inter text-sm focus:outline-none focus:border-[#6366f1]"
            />
          </div>

          {/* Preview Image URL */}
          <div>
            <label className="font-inter text-[#9da3af] text-sm mb-2 block">
              URL de l'image de preview <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={previewImageUrl}
              onChange={(e) => setPreviewImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#1f2128] border border-[#2a2d36] rounded-lg px-4 py-3 text-white font-inter text-sm focus:outline-none focus:border-[#6366f1]"
            />
          </div>

          {/* Prompt Template */}
          <div>
            <label className="font-inter text-[#9da3af] text-sm mb-2 block">
              Template de prompt <span className="text-red-500">*</span>
            </label>
            <textarea
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              placeholder="Ex: Photorealistic smartphone photo in urban outdoor setting..."
              rows={6}
              className="w-full bg-[#1f2128] border border-[#2a2d36] rounded-lg px-4 py-3 text-white font-inter text-sm focus:outline-none focus:border-[#6366f1] resize-none"
            />
          </div>

          {/* Display Order */}
          <div>
            <label className="font-inter text-[#9da3af] text-sm mb-2 block">
              Ordre d'affichage
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
              min="0"
              className="w-full bg-[#1f2128] border border-[#2a2d36] rounded-lg px-4 py-3 text-white font-inter text-sm focus:outline-none focus:border-[#6366f1]"
            />
          </div>

          {/* Is Active */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-[#2a2d36] bg-[#1f2128] text-[#6366f1] focus:ring-[#6366f1] focus:ring-offset-0"
              />
              <span className="font-inter text-white text-sm">
                Actif (visible pour les utilisateurs)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#2a2d36] hover:bg-[#3a3d46] text-white py-3 rounded-lg font-inter font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#6366f1] hover:bg-[#5558e3] text-white py-3 rounded-lg font-inter font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                style ? 'Mettre à jour' : 'Créer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
