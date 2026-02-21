'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw, Trash2, Settings, Infinity, ArrowRight } from 'lucide-react'

interface AdminToolsProps {
  userEmail: string
  currentAnalysis: any
  credits: number
}

export function AdminTools({ userEmail, currentAnalysis, credits }: AdminToolsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleResetOnboarding = async () => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser complètement l\'onboarding ?\n\nCela supprimera TOUTES vos analyses et vous ramènera au début.')) {
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/reset-onboarding', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
        return
      }

      alert('✅ Onboarding réinitialisé avec succès !\n\nVous allez être redirigé vers le début.')
      router.push('/onboarding/intro')
    } catch (error) {
      console.error('Reset onboarding error:', error)
      alert('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetToStep = async (step: 1 | 2) => {
    const labels = {
      1: 'Onboarding 1 (questionnaire)',
      2: 'Onboarding 2 (upload selfie)',
    }
    const destinations = {
      1: '/onboarding/step/1',
      2: '/onboarding/step/2',
    }

    if (!confirm(`⚠️ Reset ${labels[step]} ?\n\nVous serez redirigé vers ${labels[step]}.`)) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/reset-onboarding-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
        return
      }

      router.push(destinations[step])
    } catch (error) {
      console.error('Reset step error:', error)
      alert('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPhotos = async () => {
    if (!currentAnalysis) {
      alert('Aucune analyse trouvée')
      return
    }

    if (!confirm('⚠️ Réinitialiser la génération de photos ?\n\nVous pourrez régénérer 5 nouvelles photos.')) {
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/reset-photo-generation', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
        return
      }

      alert('✅ Génération de photos réinitialisée !\n\nVous pouvez maintenant retester.')
      router.refresh()
    } catch (error) {
      console.error('Reset photos error:', error)
      alert('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status actuel */}
      <div className="bg-[#1f2128] border border-[#2a2d36] rounded-lg p-6">
        <h3 className="font-sora font-bold text-white text-lg mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Statut Administrateur
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-inter text-[#9da3af] text-sm">Email</span>
              <span className="font-inter text-white text-sm font-medium">{userEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-inter text-[#9da3af] text-sm">Rôle</span>
              <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-bold">ADMIN</span>
            </div>
            <div className="flex justify-between">
              <span className="font-inter text-[#9da3af] text-sm">Crédits</span>
              <span className="font-inter text-[#fbbf24] text-sm font-bold flex items-center gap-1">
                <Infinity className="w-4 h-4" />
                Illimités
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-inter text-[#9da3af] text-sm">Onboarding</span>
              <span className={`font-inter text-sm font-medium ${currentAnalysis ? 'text-green-500' : 'text-orange-500'}`}>
                {currentAnalysis ? '✓ Complété' : '○ À faire'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-inter text-[#9da3af] text-sm">Paiement</span>
              <span className={`font-inter text-sm font-medium ${currentAnalysis?.paid_at ? 'text-green-500' : 'text-orange-500'}`}>
                {currentAnalysis?.paid_at ? '✓ Payé' : '○ Non payé'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-inter text-[#9da3af] text-sm">Photos IA</span>
              <span className={`font-inter text-sm font-medium ${currentAnalysis?.image_generation_used ? 'text-green-500' : 'text-orange-500'}`}>
                {currentAnalysis?.image_generation_used ? '✓ Générées' : '○ Non générées'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions de test */}
      <div className="bg-[#1f2128] border border-[#2a2d36] rounded-lg p-6">
        <h3 className="font-sora font-bold text-white text-lg mb-4">
          Outils de Test Rapide
        </h3>
        
        <div className="space-y-3">
          {/* Reset onboarding par step */}
          <div className="bg-[#16171b] border border-[#2a2d36] rounded-lg p-4 space-y-3">
            <p className="font-sora font-semibold text-white text-sm">Reset Onboarding par étape</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleResetToStep(1)}
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2.5 px-3 rounded-lg font-inter font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Onboarding 1
              </button>
              <button
                onClick={() => handleResetToStep(2)}
                disabled={isLoading}
                className="bg-orange-400 hover:bg-orange-500 disabled:opacity-50 text-white py-2.5 px-3 rounded-lg font-inter font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Onboarding 2
              </button>
            </div>
            <p className="font-inter text-[#9da3af] text-xs">
              Step 1 = questionnaire · Step 2 = upload selfie
            </p>
          </div>

          {/* Navigation directe */}
          <div className="bg-[#16171b] border border-[#2a2d36] rounded-lg p-4 space-y-3">
            <p className="font-sora font-semibold text-white text-sm">Aller directement à…</p>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/onboarding/intro"
                className="bg-[#1f2128] hover:bg-[#2a2d36] border border-[#2a2d36] text-text-secondary hover:text-white py-2.5 px-3 rounded-lg font-inter text-sm transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Intro
              </a>
              <a
                href="/onboarding/step/1"
                className="bg-[#1f2128] hover:bg-[#2a2d36] border border-[#2a2d36] text-text-secondary hover:text-white py-2.5 px-3 rounded-lg font-inter text-sm transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Step 1
              </a>
              <a
                href="/onboarding/step/2"
                className="bg-[#1f2128] hover:bg-[#2a2d36] border border-[#2a2d36] text-text-secondary hover:text-white py-2.5 px-3 rounded-lg font-inter text-sm transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Step 2
              </a>
              <a
                href="/onboarding/step/3"
                className="bg-[#1f2128] hover:bg-[#2a2d36] border border-[#2a2d36] text-text-secondary hover:text-white py-2.5 px-3 rounded-lg font-inter text-sm transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Step 3
              </a>
            </div>
          </div>

          <button
            onClick={handleResetOnboarding}
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-inter font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reset Onboarding Complet
          </button>
          <p className="font-inter text-[#9da3af] text-xs">
            Supprime toutes vos analyses et vous ramène au début du parcours
          </p>

          <button
            onClick={handleResetPhotos}
            disabled={isLoading || !currentAnalysis}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-inter font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Reset Génération Photos
          </button>
          <p className="font-inter text-[#9da3af] text-xs">
            Réinitialise uniquement la génération de photos pour retester
          </p>

          <a
            href="/dashboard/admin/photo-styles"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-inter font-medium transition-colors flex items-center justify-center gap-2 inline-block text-center"
          >
            <Settings className="w-5 h-5" />
            Gérer les Styles de Photos
          </a>
          <p className="font-inter text-[#9da3af] text-xs">
            CRUD complet des styles disponibles pour la génération IA
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-lg p-4">
        <p className="font-inter text-[#6366f1] text-sm">
          💡 <strong>Mode Admin :</strong> Vos crédits ne sont jamais déduits. Vous pouvez tester toutes les fonctionnalités de manière illimitée.
        </p>
      </div>
    </div>
  )
}
