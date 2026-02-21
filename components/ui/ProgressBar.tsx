import React from 'react'

interface ProgressBarProps {
  value: number // 0-100
  className?: string
}

interface StepProgressBarProps {
  steps: { label: string; status: 'completed' | 'active' | 'inactive' }[]
  className?: string
}

export function ProgressBar({ value, className = '' }: ProgressBarProps) {
  return (
    <div className={`w-full h-2 bg-border-primary rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-red-primary to-red-light transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function StepProgressBar({ steps, className = '' }: StepProgressBarProps) {
  return (
    <div className={`flex items-start justify-between max-w-lg mx-auto mb-12 ${className}`}>
      {steps.map((step, idx) => (
        <div key={idx} className="flex-1 relative flex flex-col items-center">
          {/* Connector line */}
          {idx < steps.length - 1 && (
            <div className="absolute top-5 left-1/2 w-full h-0.5 bg-border-primary z-0">
              {step.status === 'completed' && (
                <div className="h-full bg-gradient-to-r from-red-primary to-red-light" />
              )}
            </div>
          )}

          {/* Circle */}
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            font-bold text-sm relative z-10 mb-3
            transition-all duration-300
            ${step.status === 'completed'
              ? 'bg-red-primary text-white'
              : step.status === 'active'
              ? 'bg-red-primary text-white shadow-lg shadow-red-primary/50'
              : 'bg-border-primary text-text-tertiary'
            }
          `}>
            {step.status === 'completed' ? '✓' : idx + 1}
          </div>

          {/* Label */}
          <p className={`
            text-center text-sm leading-tight
            ${step.status === 'active' ? 'text-white font-semibold' : 'text-text-tertiary'}
          `}>
            {step.label}
          </p>
        </div>
      ))}
    </div>
  )
}
