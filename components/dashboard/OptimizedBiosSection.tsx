'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface OptimizedBio {
  type: string
  text: string
  why: string
}

interface OptimizedBiosSectionProps {
  bios: OptimizedBio[]
}

export function OptimizedBiosSection({ bios }: OptimizedBiosSectionProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const handleCopy = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  if (!bios || bios.length === 0) return null

  return (
    <section>
      <Card>
        <h2 className="font-sora font-bold text-white text-xl mb-2 flex items-center gap-2">
          <span>✍️</span> Tes bios optimisées
        </h2>
        <p className="font-inter text-[#9da3af] text-sm mb-6">
          4 accroches différentes à tester. Utilise celle qui te correspond le mieux.
        </p>
        
        <div className="space-y-4">
          {bios.map((bio, index) => (
            <div key={index} className="bg-[#27272a] rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[#9da3af] font-inter text-xs uppercase font-bold">
                  Option {index + 1} — {bio.type}
                </span>
              </div>
              
              <p className="text-white font-inter text-[15px] leading-[1.8] mb-3">
                {bio.text}
              </p>

              <p className="text-[#9da3af] font-inter text-sm italic mb-4">
                {bio.why}
              </p>

              <Button
                variant="secondary"
                onClick={() => handleCopy(bio.text, `bio-${index}`)}
                className="w-full"
              >
                {copiedSection === `bio-${index}` ? '✅ Copié !' : 'Copier cette bio'}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
