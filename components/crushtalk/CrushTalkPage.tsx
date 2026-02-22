'use client'

import { useState } from 'react'
import { OnboardingFlow } from './OnboardingFlow'
import { MessageGenerator } from './MessageGenerator'

interface CrushTalkPageProps {
  messageType: 'accroche' | 'reponse'
  hasOnboarding: boolean
  initialCredits: number
  initialSubscriptionType?: string | null
  userId: string
}

export function CrushTalkPage({ messageType, hasOnboarding, initialCredits, initialSubscriptionType, userId }: CrushTalkPageProps) {
  const [onboardingDone, setOnboardingDone] = useState(hasOnboarding)
  const [credits, setCredits] = useState(initialCredits)

  if (!onboardingDone) {
    return (
      <OnboardingFlow
        onComplete={() => {
          setCredits(5)
          setOnboardingDone(true)
        }}
      />
    )
  }

  return (
    <MessageGenerator
      messageType={messageType}
      initialCredits={credits}
      initialSubscriptionType={initialSubscriptionType}
      userId={userId}
    />
  )
}
