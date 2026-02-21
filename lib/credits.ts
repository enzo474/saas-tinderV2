// Coûts en crédits (CONSTANTES SEULEMENT - safe pour client et serveur)
export const CREDIT_COSTS = {
  IMAGE_GENERATION: 10,  // par image (10 crédits × 5 images = 50 crédits)
  BIO_GENERATION: 2,     // par bio
  INITIAL_PURCHASE: 130, // crédits inclus dans l'achat à 9,90€
} as const

// Montants des packs de recharge
export const CREDIT_PACKS = {
  PACK_50: { credits: 50, price: 5.00, priceId: process.env.STRIPE_PRICE_CREDITS_50 },
  PACK_100: { credits: 100, price: 8.90, priceId: process.env.STRIPE_PRICE_CREDITS_100 },
} as const

/**
 * Calcule le coût total pour une génération d'images
 */
export function calculateImageGenerationCost(imageCount: number): number {
  return CREDIT_COSTS.IMAGE_GENERATION * imageCount
}

/**
 * Formatte l'affichage des crédits
 */
export function formatCredits(credits: number): string {
  return `${credits} crédit${credits > 1 ? 's' : ''}`
}
