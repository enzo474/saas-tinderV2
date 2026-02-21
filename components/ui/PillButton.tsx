'use client'

import React from 'react'

interface PillButtonProps {
  children: React.ReactNode
  selected: boolean
  onClick: () => void
  disabled?: boolean
}

export function PillButton({ children, selected, onClick, disabled }: PillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
        selected
          ? 'bg-red-primary text-white border-2 border-red-primary shadow-lg shadow-red-primary/30'
          : 'bg-bg-secondary text-white border-2 border-border-primary hover:border-red-primary/60 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
