import React from 'react'
import { Card } from '../ui/Card'

interface MetricDisplayProps {
  title: string
  value: number
  maxValue?: number
  subtitle?: string
  description?: string
  size?: 'large' | 'medium'
}

export function MetricDisplay({
  title,
  value,
  maxValue = 10,
  subtitle,
  description,
  size = 'large'
}: MetricDisplayProps) {
  const fontSize = size === 'large' ? 'text-7xl' : 'text-4xl'

  return (
    <div className="text-center">
      <p className="text-[#9da3af] font-inter mb-2">{title}</p>
      <p className={`text-white font-sora font-bold ${fontSize} mb-1`}>
        {value.toFixed(1)} <span className="text-3xl text-[#9da3af]">/{maxValue}</span>
      </p>
      {subtitle && (
        <p className="text-[#9da3af] font-inter text-sm">{subtitle}</p>
      )}
      {description && (
        <Card className="mt-4">
          <p className="text-white font-inter text-base">{description}</p>
        </Card>
      )}
    </div>
  )
}
