import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'large' | 'hover'
}

export function Card({ children, className = '', variant = 'default', ...props }: CardProps) {
  const variantClasses = {
    default: 'bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-6',
    large: 'bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8',
    hover: `
      bg-gradient-to-br from-bg-secondary to-bg-tertiary
      border-2 border-border-primary rounded-2xl p-6
      hover:border-red-primary hover:-translate-y-1
      hover:shadow-xl hover:shadow-red-primary/20
      transition-all duration-300 cursor-pointer
    `,
  }

  return (
    <div
      {...props}
      className={`${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  )
}
