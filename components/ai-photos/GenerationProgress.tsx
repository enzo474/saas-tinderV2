'use client'

import { useEffect, useState } from 'react'

interface TaskStatus {
  status: string
}

interface GenerationProgressProps {
  tasks: TaskStatus[]
  globalProgress: number
  completedCount: number
}

const photoNames = ['Photo principale', 'Photo lifestyle', 'Photo sociale', 'Photo passion', 'Photo élégante']

const motivationalMessages = [
  "L'IA analyse tes traits et crée tes photos...",
  "Génération en cours : lumière, pose, cadrage parfait...",
  "Tes photos optimisées arrivent bientôt...",
  "L'IA adapte chaque photo à ton profil...",
  "Derniers ajustements pour un résultat parfait...",
]

export default function GenerationProgress({ tasks, globalProgress, completedCount }: GenerationProgressProps) {
  const [currentMessage, setCurrentMessage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % motivationalMessages.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 py-12">
      {/* En-tête */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto border-4 border-border-primary border-t-red-primary rounded-full animate-spin" />
        <h2 className="font-montserrat font-bold text-white text-2xl">
          Génération de tes photos en cours...
        </h2>
        <p className="text-text-secondary text-sm transition-all duration-500">
          {motivationalMessages[currentMessage]}
        </p>
        <p className="text-xs text-text-tertiary">
          ⏱️ Environ 2 à 4 minutes • Ne ferme pas cette page
        </p>
      </div>

      {/* Progression globale */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm mb-1">
          <span className="font-montserrat font-semibold text-white">Progression globale</span>
          <span className="text-text-secondary font-inter">
            {completedCount} / 5 photos
          </span>
        </div>
        <div className="w-full bg-border-primary rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-red-primary to-red-light h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${globalProgress}%` }}
          />
        </div>
        <p className="text-center font-montserrat font-bold text-red-light text-lg mt-1">
          {globalProgress}%
        </p>
      </div>

      {/* Barres individuelles par photo */}
      <div className="space-y-3">
        {tasks?.map((task, index) => {
          const isCompleted = task.status === 'completed'
          const isProcessing = task.status === 'processing'

          return (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    isCompleted
                      ? 'bg-red-primary text-white'
                      : isProcessing
                      ? 'bg-red-primary/30 text-red-light border border-red-primary/50'
                      : 'bg-border-primary text-text-tertiary'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <span className="font-inter text-sm text-white">{photoNames[index]}</span>
                </div>
                <span className={`font-inter text-xs ${isCompleted ? 'text-red-light' : isProcessing ? 'text-text-secondary' : 'text-text-tertiary'}`}>
                  {isCompleted ? 'Terminée ✓' : isProcessing ? 'En cours...' : 'En attente'}
                </span>
              </div>
              <div className="w-full bg-border-primary rounded-full h-1.5 overflow-hidden ml-10">
                <div className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-red-primary to-red-light w-full'
                    : isProcessing
                    ? 'bg-red-primary/50 w-2/3 animate-pulse'
                    : 'w-0'
                }`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Message d'attente */}
      <div className="bg-red-primary/8 border border-red-primary/25 rounded-xl p-5 text-center">
        <p className="font-inter text-white text-sm font-medium">
          L&apos;IA travaille sur tes photos pour maximiser tes matchs 🔥
        </p>
        <p className="font-inter text-text-tertiary text-xs mt-1.5">
          La page se mettra à jour automatiquement une fois terminé
        </p>
      </div>
    </div>
  )
}
