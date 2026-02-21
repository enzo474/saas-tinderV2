'use client'

import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react'

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

interface StyleCardProps {
  style: PhotoStyle
  onEdit: () => void
  onDelete: () => void
}

export function StyleCard({ style, onEdit, onDelete }: StyleCardProps) {
  const handleToggleActive = async () => {
    try {
      const response = await fetch(`/api/admin/photo-styles/${style.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !style.is_active,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle active status')
      }

      window.location.reload()
    } catch (error) {
      console.error('Toggle active error:', error)
      alert('Erreur lors du changement de statut')
    }
  }

  return (
    <div className={`bg-[#1f2128] border rounded-lg overflow-hidden transition-colors ${
      style.is_active ? 'border-[#2a2d36]' : 'border-red-500/50 opacity-60'
    }`}>
      {/* Preview Image */}
      <div className="aspect-[9/16] bg-[#13151a] relative">
        {style.preview_image_url && !style.preview_image_url.includes('placeholder.com') ? (
          <img
            src={style.preview_image_url}
            alt={style.style_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="font-inter text-[#9da3af] text-sm">Pas d'aperçu</p>
          </div>
        )}

        {/* Active badge */}
        <div className="absolute top-2 right-2">
          <button
            onClick={handleToggleActive}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              style.is_active
                ? 'bg-green-500/20 text-green-500'
                : 'bg-red-500/20 text-red-500'
            }`}
            title={style.is_active ? 'Actif' : 'Inactif'}
          >
            {style.is_active ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-sora font-bold text-white text-sm">
              {style.style_name}
            </h3>
            {style.style_description && (
              <p className="font-inter text-[#9da3af] text-xs mt-1">
                {style.style_description}
              </p>
            )}
          </div>
          <span className="text-[#6366f1] text-xs font-inter bg-[#6366f1]/10 px-2 py-1 rounded">
            #{style.display_order}
          </span>
        </div>

        {/* Prompt preview */}
        <div className="bg-[#13151a] border border-[#2a2d36] rounded p-2 mb-3">
          <p className="font-inter text-[#9da3af] text-xs line-clamp-2">
            {style.prompt_template}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-[#2a2d36] hover:bg-[#6366f1] text-white py-2 rounded-lg font-inter text-xs transition-colors flex items-center justify-center gap-1"
          >
            <Edit2 className="w-3 h-3" />
            Modifier
          </button>
          <button
            onClick={onDelete}
            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
