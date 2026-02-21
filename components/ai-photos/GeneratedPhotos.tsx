'use client'

import { useState } from 'react'
import Image from 'next/image'
import { downloadImage, downloadAllAsZip } from '@/lib/utils/download'

interface GeneratedPhotosProps {
  photos: string[]
}

const photoTitles = [
  'Photo principale',
  'Photo lifestyle',
  'Photo sociale',
  'Photo passion',
  'Photo élégante',
]

export default function GeneratedPhotos({ photos }: GeneratedPhotosProps) {
  const [downloading, setDownloading] = useState<number | null>(null)
  const [downloadingAll, setDownloadingAll] = useState(false)

  const handleDownload = async (url: string, index: number) => {
    setDownloading(index)
    try {
      await downloadImage(url, `crushmaxxing-photo-${index + 1}.jpg`)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloading(null)
    }
  }

  const handleDownloadAll = async () => {
    setDownloadingAll(true)
    try {
      await downloadAllAsZip(photos, 'crushmaxxing-photos-ia.zip')
    } catch (error) {
      console.error('Download all failed:', error)
    } finally {
      setDownloadingAll(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-8">
      {/* En-tête succès */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-primary to-red-light rounded-full flex items-center justify-center shadow-lg shadow-red-primary/30">
          <span className="text-white text-3xl font-bold">✓</span>
        </div>
        <h2 className="font-montserrat font-bold text-white text-3xl">
          Tes photos sont prêtes !
        </h2>
        <p className="text-text-secondary font-inter">
          5 photos optimisées par IA pour maximiser tes matchs
        </p>
      </div>

      {/* Bouton tout télécharger */}
      <div className="flex justify-center">
        <button
          onClick={handleDownloadAll}
          disabled={downloadingAll}
          className="flex items-center gap-2 bg-gradient-to-br from-red-primary to-red-light text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-red-primary/30 hover:scale-[1.02] hover:shadow-xl hover:shadow-red-primary/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {downloadingAll ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Téléchargement...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Télécharger toutes les photos (ZIP)
            </>
          )}
        </button>
      </div>

      {/* Grille de photos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl overflow-hidden hover:border-red-primary hover:-translate-y-1 hover:shadow-xl hover:shadow-red-primary/15 transition-all duration-300"
          >
            <div className="relative aspect-[3/4] bg-bg-primary">
              <Image
                src={photo}
                alt={photoTitles[index]}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 flex items-center justify-between">
              <h3 className="font-montserrat font-semibold text-white text-sm">
                {photoTitles[index]}
              </h3>
              <button
                onClick={() => handleDownload(photo, index)}
                disabled={downloading === index}
                className="flex items-center gap-1.5 bg-bg-primary border border-border-primary hover:border-red-primary text-text-secondary hover:text-white text-xs font-inter py-1.5 px-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading === index ? (
                  <>
                    <div className="w-3 h-3 border-2 border-text-tertiary border-t-red-primary rounded-full animate-spin" />
                    ...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Télécharger
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Conseils */}
      <div className="bg-red-primary/8 border border-red-primary/25 rounded-xl p-5">
        <h3 className="font-montserrat font-semibold text-white text-sm mb-3">
          📱 Comment utiliser ces photos ?
        </h3>
        <div className="space-y-1.5 font-inter text-sm text-text-secondary">
          <p><strong className="text-white">Photo principale</strong> → En première position sur ton profil</p>
          <p><strong className="text-white">Photos lifestyle/sociale</strong> → Montre ta vie sociale et tes activités</p>
          <p><strong className="text-white">Photo passion</strong> → Affiche tes centres d&apos;intérêt</p>
          <p><strong className="text-white">Photo élégante</strong> → Ferme en beauté ton profil</p>
          <p className="pt-2 text-red-light font-medium">
            💡 Alterne les styles pour un profil équilibré et attractif
          </p>
        </div>
      </div>
    </div>
  )
}
