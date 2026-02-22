'use client'

import { useRouter } from 'next/navigation'
import { OnboardingFlow } from './OnboardingFlow'

export function CrushTalkOnboardingClient() {
  const router = useRouter()

  const handleComplete = () => {
    router.push('/dashboard/hooks')
  }

  return <OnboardingFlow onComplete={handleComplete} />
}
