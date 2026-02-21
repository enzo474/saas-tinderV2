'use client'

import React, { useEffect, useState } from 'react'

interface LoadingStep {
  text: string
  delay?: number
}

interface LoadingAnimationProps {
  steps: LoadingStep[]
  onComplete?: () => void
  showProgress?: boolean
  continuous?: boolean
}

export function LoadingAnimation({ steps, onComplete, showProgress = true, continuous = false }: LoadingAnimationProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [progress, setProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    if (continuous) {
      const stepDuration = 3000
      const interval = setInterval(() => {
        setCurrentStepIndex(prev => {
          const next = (prev + 1) % steps.length
          setCompletedSteps(steps.map((_, i) => i).filter(i => i < next))
          return next
        })
      }, stepDuration)
      return () => clearInterval(interval)
    } else {
      let timeoutIds: NodeJS.Timeout[] = []
      const totalDuration = steps.reduce((sum, step) => sum + (step.delay || 0), 0)

      steps.forEach((step, index) => {
        const delay = steps.slice(0, index + 1).reduce((sum, s) => sum + (s.delay || 0), 0)
        const timeoutId = setTimeout(() => {
          setCompletedSteps(prev => [...prev, index])
          if (showProgress) setProgress((delay / totalDuration) * 100)
        }, delay)
        timeoutIds.push(timeoutId)
      })

      if (onComplete) {
        const completeTimeoutId = setTimeout(onComplete, totalDuration)
        timeoutIds.push(completeTimeoutId)
      }

      return () => { timeoutIds.forEach(id => clearTimeout(id)) }
    }
  }, [steps, onComplete, showProgress, continuous])

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(index)
        const isActive = continuous
          ? index === currentStepIndex
          : (index === 0 || completedSteps.includes(index - 1))

        return (
          <div
            key={index}
            className={`flex items-center gap-3 transition-all duration-300 ${
              isCompleted || isActive ? 'text-white' : 'text-text-tertiary'
            }`}
          >
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              {isCompleted ? (
                <div className="w-5 h-5 rounded-full bg-red-primary flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              ) : isActive ? (
                <div className="w-5 h-5 border-2 border-border-primary border-t-red-primary rounded-full animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-border-primary" />
              )}
            </div>
            <p className="font-inter text-sm">{step.text}</p>
          </div>
        )
      })}

      {showProgress && !continuous && (
        <div className="pt-4">
          <div className="w-full h-2 bg-border-primary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-primary to-red-light transition-all duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-text-tertiary text-sm text-center mt-2">
            {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  )
}
