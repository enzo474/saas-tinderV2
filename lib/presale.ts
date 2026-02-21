import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * Compte le nombre d'utilisateurs ayant acheté la prévente.
 * Réel : jusqu'à 200. Affichage : 0-50 (1 barre = 4 acheteurs).
 */
export async function getPresaleCount(): Promise<number> {
  try {
    const supabase = createServiceRoleClient()
    const { count, error } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .not('presale_purchased_at', 'is', null)

    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}
