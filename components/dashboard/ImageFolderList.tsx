'use client'

import Link from 'next/link'
import { Image as ImageIcon } from 'lucide-react'

export interface ImageFolder {
  slug: string
  label: string
  count: number
  items: { id: string; image_url: string; photo_number: number; generation_type: string; created_at: string }[]
}

interface ImageFolderListProps {
  folders: ImageFolder[]
}

export function ImageFolderList({ folders }: ImageFolderListProps) {
  if (folders.length === 0) {
    return (
      <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 bg-red-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-red-primary/60" />
          </div>
          <h3 className="font-montserrat font-bold text-white text-lg mb-2">
            Aucune image générée
          </h3>
          <p className="text-text-secondary text-sm">
            Générez des images depuis le générateur pour les voir apparaître ici.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
      {folders.map((folder) => {
        const thumbnail = folder.items[0]?.image_url
        return (
          <Link
            key={folder.slug}
            href={`/dashboard/home/images/${folder.slug}`}
            className="group bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl overflow-hidden hover:border-red-primary hover:-translate-y-1 hover:shadow-xl hover:shadow-red-primary/15 transition-all duration-300"
          >
            {/* Thumbnail */}
            <div className="h-40 bg-gradient-to-br from-border-primary to-bg-tertiary overflow-hidden">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={folder.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-text-tertiary" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h4 className="font-montserrat font-bold text-white text-sm mb-1 truncate">
                {folder.label}
              </h4>
              <p className="text-text-tertiary text-xs">
                {folder.count} image{folder.count > 1 ? 's' : ''}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
