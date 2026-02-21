'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { StyleCard } from './StyleCard'
import { StyleForm } from './StyleForm'

interface PhotoStyle {
  id: string
  photo_number: number
  style_name: string
  style_description: string | null
  preview_image_url: string
  prompt_template: string
  is_active: boolean
  display_order: number
  created_at: string
}

interface StyleListProps {
  initialStyles: PhotoStyle[]
}

export function StyleList({ initialStyles }: StyleListProps) {
  const [styles, setStyles] = useState(initialStyles)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStyle, setEditingStyle] = useState<PhotoStyle | null>(null)
  const [selectedPhotoNumber, setSelectedPhotoNumber] = useState<number>(1)

  const handleCreate = () => {
    setEditingStyle(null)
    setIsFormOpen(true)
  }

  const handleEdit = (style: PhotoStyle) => {
    setEditingStyle(style)
    setIsFormOpen(true)
  }

  const handleDelete = async (styleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce style ?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/photo-styles/${styleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete style')
      }

      setStyles(styles.filter(s => s.id !== styleId))
    } catch (error) {
      console.error('Delete error:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleSave = (savedStyle: PhotoStyle) => {
    if (editingStyle) {
      // Update
      setStyles(styles.map(s => s.id === savedStyle.id ? savedStyle : s))
    } else {
      // Create
      setStyles([...styles, savedStyle])
    }
    setIsFormOpen(false)
  }

  // Grouper par photo number
  const stylesByPhoto = styles.reduce((acc, style) => {
    if (!acc[style.photo_number]) {
      acc[style.photo_number] = []
    }
    acc[style.photo_number].push(style)
    return acc
  }, {} as Record<number, PhotoStyle[]>)

  return (
    <div>
      {/* Filter by photo number */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => setSelectedPhotoNumber(num)}
              className={`px-4 py-2 rounded-lg font-inter text-sm transition-colors ${
                selectedPhotoNumber === num
                  ? 'bg-[#6366f1] text-white'
                  : 'bg-[#1f2128] text-[#9da3af] border border-[#2a2d36] hover:border-[#6366f1]'
              }`}
            >
              Photo {num}
            </button>
          ))}
        </div>

        <button
          onClick={handleCreate}
          className="ml-auto bg-[#6366f1] hover:bg-[#5558e3] text-white px-4 py-2 rounded-lg font-inter font-medium text-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau style
        </button>
      </div>

      {/* Styles for selected photo */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(stylesByPhoto[selectedPhotoNumber] || []).map((style) => (
          <StyleCard
            key={style.id}
            style={style}
            onEdit={() => handleEdit(style)}
            onDelete={() => handleDelete(style.id)}
          />
        ))}

        {(!stylesByPhoto[selectedPhotoNumber] || stylesByPhoto[selectedPhotoNumber].length === 0) && (
          <div className="col-span-full bg-[#1f2128] border border-[#2a2d36] rounded-lg p-12 text-center">
            <p className="font-inter text-[#9da3af]">
              Aucun style pour la Photo {selectedPhotoNumber}
            </p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <StyleForm
          style={editingStyle}
          defaultPhotoNumber={selectedPhotoNumber}
          onSave={handleSave}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  )
}
