'use client'

import { useState } from 'react'
import { OnboardingFlow } from './OnboardingFlow'
import { MessageGenerator } from './MessageGenerator'

interface CrushTalkPageProps {
  messageType: 'accroche' | 'reponse'
  hasOnboarding: boolean
  initialCredits: number
  userId: string
}

export function CrushTalkPage({ messageType, hasOnboarding, initialCredits, userId }: CrushTalkPageProps) {
  const [onboardingDone, setOnboardingDone] = useState(hasOnboarding)
  // Après l'onboarding, 20 crédits sont offerts
  const [credits, setCredits] = useState(hasOnboarding ? initialCredits : initialCredits)

  if (!onboardingDone) {
    return (
      <OnboardingFlow
        onComplete={() => {
          // Après onboarding, les crédits sont créés côté API (20 crédits)
          // On les rafraîchit en rechargeant les données
          setCredits(20)
          setOnboardingDone(true)
        }}
      />
    )
  }

  return (
    <MessageGenerator
      messageType={messageType}
      initialCredits={credits}
      userId={userId}
    />
  )
}
