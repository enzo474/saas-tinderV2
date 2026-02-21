export function getAbVariant(userId: string): 'A' | 'B' {
  const percentage = parseInt(
    process.env.NEXT_PUBLIC_AB_VARIANT_B_PERCENT || '50'
  )
  
  // Hash déterministe basé sur userId
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100
  
  return hash < percentage ? 'B' : 'A'
}

export function getOnboardingRoute(userId: string): '/onboarding/intro' | '/ob2/intro' {
  const variant = getAbVariant(userId)
  return variant === 'B' ? '/ob2/intro' : '/onboarding/intro'
}
