import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * FICHIER SERVEUR UNIQUEMENT
 * Toutes les fonctions ici utilisent next/headers et ne peuvent être importées côté client
 */

/**
 * Vérifie si un utilisateur est admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = createServiceRoleClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }
  
  return data?.role === 'admin'
}

/**
 * Récupère les crédits d'un utilisateur
 */
export async function getUserCredits(userId: string): Promise<number> {
  const supabase = createServiceRoleClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('credits')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user credits:', error)
    return 0
  }
  
  return data?.credits || 0
}

/**
 * Vérifie si un utilisateur a assez de crédits
 * Les admins ont des crédits illimités
 */
export async function checkCredits(userId: string, cost: number): Promise<boolean> {
  // Admin = crédits illimités
  if (await isUserAdmin(userId)) {
    return true
  }
  
  const credits = await getUserCredits(userId)
  return credits >= cost
}

/**
 * Déduit des crédits du compte utilisateur (transaction atomique)
 * Retourne true si succès, false si crédits insuffisants
 * Les admins ne sont jamais débités
 */
export async function deductCredits(userId: string, cost: number): Promise<boolean> {
  // Admin = pas de déduction, toujours true
  if (await isUserAdmin(userId)) {
    return true
  }
  
  const supabase = createServiceRoleClient()
  
  // Utiliser la fonction PostgreSQL pour garantir l'atomicité
  const { data, error } = await supabase.rpc('deduct_credits', {
    user_id_param: userId,
    cost: cost
  })
  
  if (error) {
    console.error('Error deducting credits:', error)
    return false
  }
  
  return data === true
}

/**
 * Ajoute des crédits au compte utilisateur
 */
export async function addCredits(userId: string, amount: number): Promise<void> {
  const supabase = createServiceRoleClient()
  
  const { error } = await supabase.rpc('add_credits', {
    user_id_param: userId,
    amount: amount
  })
  
  if (error) {
    console.error('Error adding credits:', error)
    throw new Error(`Failed to add credits: ${error.message}`)
  }
}

/**
 * Récupère les crédits avec le client authentifié (pour usage côté serveur avec user context)
 */
export async function getAuthenticatedUserCredits(): Promise<number> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return 0
  }
  
  return getUserCredits(user.id)
}

/**
 * Vérifie et déduit les crédits en une seule opération
 * Lance une erreur si crédits insuffisants
 */
export async function requireAndDeductCredits(userId: string, cost: number): Promise<void> {
  const hasEnough = await checkCredits(userId, cost)
  
  if (!hasEnough) {
    const currentCredits = await getUserCredits(userId)
    throw new Error(`Crédits insuffisants. Vous avez ${currentCredits} crédits, ${cost} requis.`)
  }
  
  const success = await deductCredits(userId, cost)
  
  if (!success) {
    throw new Error('Échec de la déduction des crédits. Veuillez réessayer.')
  }
}
