import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  showCount?: boolean
}

export function Textarea({ label, error, showCount, maxLength, className = '', value, ...props }: TextareaProps) {
  const currentLength = typeof value === 'string' ? value.length : 0

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full bg-bg-secondary border-2 border-border-primary
          text-white placeholder:text-text-tertiary
          px-4 py-3 rounded-lg
          focus:border-red-primary focus:outline-none
          transition-colors duration-200
          resize-none
          ${className}
        `}
        value={value}
        maxLength={maxLength}
        {...props}
      />
      {showCount && maxLength && (
        <p className="text-text-tertiary text-xs mt-1 text-right">
          {currentLength} / {maxLength}
        </p>
      )}
      {error && (
        <p className="text-red-light text-sm mt-1">{error}</p>
      )}
    </div>
  )
}
