'use client'

import { MessageGenerator } from './MessageGenerator'

interface CrushTalkPageProps {
  messageType: 'accroche' | 'reponse'
  initialCredits: number
  initialSubscriptionType?: string | null
  userId: string
  isGuest?: boolean
}

export function CrushTalkPage({ messageType, initialCredits, initialSubscriptionType, userId, isGuest }: CrushTalkPageProps) {
  return (
    <MessageGenerator
      messageType={messageType}
      initialCredits={initialCredits}
      initialSubscriptionType={initialSubscriptionType}
      userId={userId}
      isGuest={isGuest}
    />
  )
}
