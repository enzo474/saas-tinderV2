import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full bg-bg-secondary border-2 border-border-primary
          text-white placeholder:text-text-tertiary
          px-4 py-3 rounded-lg
          focus:border-red-primary focus:outline-none
          transition-colors duration-200
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-red-light text-sm mt-1">{error}</p>
      )}
    </div>
  )
}
