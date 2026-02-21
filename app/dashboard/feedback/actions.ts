'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const FEEDBACK_TYPES = ['feature', 'modification', 'style', 'improvement'] as const

export async function submitFeedback(feedbackType: string, content: string): Promise<{ error?: string }> {
  const trimmed = content?.trim()
  if (!trimmed) {
    return { error: 'Veuillez saisir votre idée' }
  }
  if (!FEEDBACK_TYPES.includes(feedbackType as (typeof FEEDBACK_TYPES)[number])) {
    return { error: 'Type d\'idée invalide' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Vous devez être connecté' }
  }

  const { error } = await supabase
    .from('user_feedback')
    .insert({
      user_id: user.id,
      feedback_type: feedbackType,
      content: trimmed,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/feedback')
  return {}
}
