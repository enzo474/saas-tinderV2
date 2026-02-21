'use client'

import { useState } from 'react'
import { AppSelector } from '@/components/profile-preview/AppSelector'
import { ImageSelector } from '@/components/profile-preview/ImageSelector'
import { DragDropReorder } from '@/components/profile-preview/DragDropReorder'
import { FeedPreview } from '@/components/profile-preview/FeedPreview'
import { BioSelector } from '@/components/profile-preview/BioSelector'
import { Card } from '@/components/ui/Card'

type AppType = 'tinder' | 'fruitz' | 'hinge' | null

interface ProfilePreviewClientProps {
  availableImages: string[]
  availableBios: any[]
}

export function ProfilePreviewClient({ availableImages, availableBios }: ProfilePreviewClientProps) {
  const [selectedApp, setSelectedApp] = useState<AppType>('tinder')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [orderedImages, setOrderedImages] = useState<string[]>([])
  const [selectedBio, setSelectedBio] = useState<string>('')

  const handleImagesSelected = (images: string[]) => {
    setSelectedImages(images)
    setOrderedImages(images)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left Panel - Configuration */}
      <div className="space-y-6">
        {/* App Selection */}
        <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-6">
          <h2 className="font-montserrat font-bold text-white text-xl mb-5">
            1. Choisir l&apos;application
          </h2>
          <AppSelector
            selectedApp={selectedApp}
            onSelectApp={setSelectedApp}
          />
        </div>

        {/* Image Selection */}
        <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-6">
          <h2 className="font-montserrat font-bold text-white text-xl mb-2">
            2. Sélectionner jusqu&apos;à 6 images
          </h2>
          <p className="text-text-secondary text-sm mb-5">
            {selectedImages.length} / 6 sélectionnées
          </p>
          <ImageSelector
            availableImages={availableImages}
            selectedImages={selectedImages}
            onImagesSelected={handleImagesSelected}
          />
        </div>

        {/* Image Reordering */}
        {orderedImages.length > 0 && (
          <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-6">
            <h2 className="font-montserrat font-bold text-white text-xl mb-2">
              3. Réorganiser vos images
            </h2>
            <p className="text-text-secondary text-sm mb-5">
              Glissez-déposez pour changer l&apos;ordre d&apos;affichage
            </p>
            <DragDropReorder
              images={orderedImages}
              onReorder={setOrderedImages}
            />
          </div>
        )}

        {/* Bio Selection */}
        <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-6">
          <h2 className="font-montserrat font-bold text-white text-xl mb-5">
            4. Choisir une bio
          </h2>
          <BioSelector
            availableBios={availableBios}
            selectedBio={selectedBio}
            onSelectBio={setSelectedBio}
          />
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="lg:sticky lg:top-8 h-fit">
        <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-6">
          <h2 className="font-montserrat font-bold text-white text-xl mb-6 text-center">
            Aperçu du profil
          </h2>
          {selectedApp && orderedImages.length > 0 ? (
            <FeedPreview
              appType={selectedApp}
              images={orderedImages}
              bio={selectedBio}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-text-tertiary">
              <span className="text-5xl mb-4">📱</span>
              <p className="text-sm leading-relaxed">
                Sélectionnez une app et des images<br />pour voir l&apos;aperçu
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
