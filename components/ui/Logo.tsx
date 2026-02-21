import React from 'react'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className="font-montserrat font-extrabold text-xl"
        style={{
          background: 'linear-gradient(135deg, #E63946, #FF4757)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Crushmaxxing
      </span>
    </div>
  )
}
