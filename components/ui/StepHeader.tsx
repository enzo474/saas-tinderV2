import React from 'react'

interface StepHeaderProps {
  currentStep: number
  totalSteps: number
}

export function StepHeader({ currentStep, totalSteps }: StepHeaderProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        <p className="text-text-secondary text-sm">
          Étape {currentStep} / {totalSteps}
        </p>
        <p className="text-text-tertiary text-sm">{Math.round(progress)}%</p>
      </div>
      <div className="w-full h-2 bg-border-primary rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-primary to-red-light transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
