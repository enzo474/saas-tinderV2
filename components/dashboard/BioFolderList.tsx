'use client'

import Link from 'next/link'

export interface BioFolder {
  slug: string
  label: string
  count: number
  items: { id: string; bio_text: string; tone: string | null; generation_type?: string; created_at?: string }[]
}

interface BioFolderListProps {
  folders: BioFolder[]
}

export function BioFolderList({ folders }: BioFolderListProps) {
  if (folders.length === 0) {
    return (
      <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 bg-red-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✍️</span>
          </div>
          <h3 className="font-montserrat font-bold text-white text-lg mb-2">
            Aucune bio générée
          </h3>
          <p className="text-text-secondary text-sm">
            Utilisez le générateur de bio ou complétez votre analyse pour créer des bios optimisées.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
      {folders.map((folder) => {
        const preview = folder.items[0]?.bio_text
        return (
          <Link
            key={folder.slug}
            href={`/dashboard/home/bios/${folder.slug}`}
            className="group bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl overflow-hidden hover:border-red-primary hover:-translate-y-1 hover:shadow-xl hover:shadow-red-primary/15 transition-all duration-300"
          >
            {/* Preview zone */}
            <div className="h-40 p-4 bg-bg-tertiary flex items-start overflow-hidden">
              {preview ? (
                <p className="text-text-secondary text-xs leading-relaxed line-clamp-6">
                  {preview}
                </p>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-text-tertiary text-3xl">✍️</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h4 className="font-montserrat font-bold text-white text-sm mb-1 truncate">
                {folder.label}
              </h4>
              <p className="text-text-tertiary text-xs">
                {folder.count} bio{folder.count > 1 ? 's' : ''}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
