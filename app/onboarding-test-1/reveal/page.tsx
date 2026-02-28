import { redirect } from 'next/navigation'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { RizzRevealClient } from '@/components/onboarding/RizzRevealClient'

export default async function RizzRevealPage1() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth?context=rizz&from=test-1')
  }

  // Ajouter 1 crédit rizz si pas encore fait pour cet user
  try {
    const admin = createServiceRoleClient()

    // Vérifier si le bonus rizz a déjà été donné
    const { data: existingSession } = await admin
      .from('rizz_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('credit_given', true)
      .maybeSingle()

    if (!existingSession) {
      // Ajouter 1 crédit
      const { data: credits } = await admin
        .from('crushtalk_credits')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (credits) {
        await admin
          .from('crushtalk_credits')
          .update({ balance: credits.balance + 1 })
          .eq('user_id', user.id)
      } else {
        // Créer l'entrée si elle n'existe pas encore
        await admin.from('crushtalk_credits').insert({
          user_id: user.id,
          balance: 1,
          used_total: 0,
        })
      }

      // Marquer le bonus comme donné dans rizz_sessions
      await admin.from('rizz_sessions').insert({
        user_id: user.id,
        flow_type: 'test-1',
        credit_given: true,
        completed_auth: true,
        saw_unblurred_result: true,
      })
    } else {
      // Juste marquer comme vu
      await admin
        .from('rizz_sessions')
        .update({ saw_unblurred_result: true })
        .eq('user_id', user.id)
        .eq('credit_given', true)
    }
  } catch { /* non-bloquant */ }

  return <RizzRevealClient userId={user.id} />
}
