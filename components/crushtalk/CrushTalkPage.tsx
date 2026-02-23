'use client'

import { MessageGenerator } from './MessageGenerator'

interface CrushTalkPageProps {
  messageType: 'accroche' | 'reponse'
  initialCredits: number
  initialSubscriptionType?: string | null
  userId: string
}

export function CrushTalkPage({ messageType, initialCredits, initialSubscriptionType, userId }: CrushTalkPageProps) {
  return (
    <MessageGenerator
      messageType={messageType}
      initialCredits={initialCredits}
      initialSubscriptionType={initialSubscriptionType}
      userId={userId}
    />
  )
}
