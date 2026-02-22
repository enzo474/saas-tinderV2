'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { BioFolderList, type BioFolder } from '@/components/dashboard/BioFolderList'
import { ImageFolderList, type ImageFolder } from '@/components/dashboard/ImageFolderList'
import { CreditsBadge } from '@/components/ui/CreditsBadge'

interface DashboardHomeClientProps {
  analysisId: string
  analysisFullPlan: any
  bioFolders: BioFolder[]
  imageFolders: ImageFolder[]
  userId: string
  initialCredits?: number
  isAdmin?: boolean
}

export function DashboardHomeClient({
  analysisId,
  analysisFullPlan,
  bioFolders,
  imageFolders,
  userId,
  initialCredits = 0,
  isAdmin = false,
}: DashboardHomeClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(!analysisFullPlan)
  const [plan, setPlan] = useState(analysisFullPlan)
  const [credits, setCredits] = useState(initialCredits)

  // Poll credits every 10s
  useEffect(() => {
    if (isAdmin) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/user/credits')
        if (res.ok) {
          const data = await res.json()
          setCredits(data.credits)
        }
      } catch {}
    }, 10000)
    return () => clearInterval(interval)
  }, [isAdmin])
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Lancement de la génération...')
  const pollCountRef = useRef(0)

  useEffect(() => {
    if (!analysisFullPlan) {
      if (!analysisId) {
        setLoading(false)
        return
      }

      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(90, p + 3))
      }, 1000)

      const doGenerate = async () => {
        setStatusText('Lancement de la génération...')
        try {
          await fetch('/api/analysis/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ analysisId }),
          })
        } catch {}
      }

      doGenerate()

      setStatusText('Génération des 4 bios en cours...')

      const pollInterval = setInterval(async () => {
        pollCountRef.current += 1
        try {
          const response = await fetch(`/api/analysis/${analysisId}/plan`)
          const data = await response.json()

          if (data.full_plan) {
            setPlan(data.full_plan)
            setProgress(100)
            setStatusText('Terminé !')
            setLoading(false)
            clearInterval(pollInterval)
            clearInterval(progressInterval)
          }
        } catch {}
      }, 3000)

      return () => {
        clearInterval(pollInterval)
        clearInterval(progressInterval)
      }
    }
  }, [analysisId, analysisFullPlan])

  // Inclure "Bio optimisées" si le plan charge après le polling
  const allBioFolders = useMemo(() => {
    const hasPlanFolder = bioFolders.some((f) => f.slug === 'bio-optimisees')
    if (plan?.optimized_bios?.length && !hasPlanFolder) {
      const planFolder: BioFolder = {
        slug: 'bio-optimisees',
        label: 'Bio optimisées',
        count: plan.optimized_bios.length,
        items: plan.optimized_bios.map((bio: { type: string; text: string }, i: number) => ({
          id: `plan-${i}`,
          bio_text: bio.text,
          tone: bio.type || null,
        })),
      }
      return [planFolder, ...bioFolders]
    }
    return bioFolders
  }, [bioFolders, plan?.optimized_bios])

  const totalImages = imageFolders.reduce((s, f) => s + f.count, 0)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-4 py-12">
        <div className="w-full max-w-md mx-auto text-center">
          {/* Spinner */}
          <div className="w-20 h-20 mx-auto mb-6 border-4 border-border-primary border-t-red-primary rounded-full animate-spin" />

          <h2 className="font-montserrat font-bold text-white text-2xl mb-2">
            On prépare ton espace créateur...
          </h2>
          <p className="text-text-secondary mb-6">
            {statusText}
          </p>

          {/* Progress bar */}
          <div className="w-full h-2 bg-border-primary rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-red-primary to-red-light transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-text-tertiary text-sm mb-6">
            {Math.round(progress)}% — La barre se termine uniquement quand l&apos;analyse est prête.
          </p>

        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-montserrat font-bold text-white text-2xl md:text-4xl mb-2 leading-tight">
            Bienvenue sur<br className="sm:hidden" /> votre espace créateur
          </h1>
          <p className="text-text-secondary text-sm md:text-base">
            Retrouvez toutes vos images et bios générées en un seul endroit.
          </p>
        </div>

        <CreditsBadge initialCredits={credits} isAdmin={isAdmin} />
      </div>

      {/* Section Images */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-montserrat font-bold text-white text-xl">
            Vos images générées
          </h2>
          {imageFolders.length > 0 && (
            <p className="text-text-secondary text-sm">
              {totalImages} image{totalImages > 1 ? 's' : ''} · {imageFolders.length} dossier{imageFolders.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <ImageFolderList folders={imageFolders} />
      </section>

      {/* Section Bios */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-montserrat font-bold text-white text-xl">
            Vos bios générées
          </h2>
          {allBioFolders.length > 0 && (
            <p className="text-text-secondary text-sm">
              {allBioFolders.reduce((s, f) => s + f.count, 0)} bio{(allBioFolders.reduce((s, f) => s + f.count, 0)) > 1 ? 's' : ''} · {allBioFolders.length} dossier{allBioFolders.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <BioFolderList folders={allBioFolders} />
      </section>

      {/* CTA Banner */}
      <section className="relative bg-gradient-to-br from-red-primary/10 to-red-dark/5 border-2 border-red-primary/30 rounded-2xl p-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none animate-pulse-glow"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(230,57,70,0.08), transparent 70%)' }} />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-montserrat font-bold text-white text-2xl mb-2">
              Prêt à générer tes photos ?
            </h3>
            <p className="text-text-secondary text-sm">
              Plus de 1296 styles disponibles pour transformer ton profil.
            </p>
          </div>
          <a
            href="/dashboard/images"
            className="btn-primary whitespace-nowrap"
          >
            Générer mes photos
          </a>
        </div>
      </section>
    </div>
  )
}
