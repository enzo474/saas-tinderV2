import React from 'react'
import { Card } from '../ui/Card'

interface ScoreCardProps {
  icon: string
  title: string
  score: number
  maxScore?: number
  showBar?: boolean
}

export function ScoreCard({ icon, title, score, maxScore = 100, showBar = true }: ScoreCardProps) {
  const percentage = (score / maxScore) * 100
  
  // Color based on percentage
  let barColor = '#ef4444' // red
  if (percentage >= 60) barColor = '#22c55e' // green
  else if (percentage >= 40) barColor = '#f97316' // orange

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-white font-inter font-medium">{title}</h3>
      </div>
      <p className="text-white font-sora font-bold text-4xl mb-3">
        {score} <span className="text-[#9da3af] text-2xl">/{maxScore}</span>
      </p>
      {showBar && (
        <div className="w-full h-2 bg-[#27272a] rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              backgroundColor: barColor
            }}
          />
        </div>
      )}
    </Card>
  )
}
