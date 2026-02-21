import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'primary-gold' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-5 py-2 text-sm',
    md: 'px-8 py-3.5',
    lg: 'px-12 py-4 text-lg',
  }

  const variantClasses = {
    primary: `
      bg-gradient-to-br from-red-primary to-red-light
      text-white font-semibold rounded-xl
      shadow-lg shadow-red-primary/30
      hover:scale-[1.02] hover:shadow-xl hover:shadow-red-primary/40
      active:scale-[0.98]
      transition-all duration-300
      inline-flex items-center justify-center gap-2.5
    `,
    'primary-gold': `
      bg-gradient-to-br from-gold-primary to-gold-light
      text-black font-bold rounded-xl
      shadow-lg shadow-gold-primary/30
      hover:scale-[1.02] hover:shadow-xl hover:shadow-gold-primary/40
      active:scale-[0.98]
      transition-all duration-300
      inline-flex items-center justify-center gap-2.5
    `,
    secondary: `
      bg-transparent border-2 border-border-primary
      text-white font-semibold rounded-xl
      hover:border-red-primary hover:text-red-primary
      active:scale-[0.98]
      transition-all duration-300
      inline-flex items-center justify-center gap-2
    `,
    ghost: `
      bg-transparent text-text-secondary
      rounded-lg
      hover:bg-bg-secondary hover:text-white
      transition-all duration-200
      inline-flex items-center justify-center gap-2
    `,
  }

  return (
    <button
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
