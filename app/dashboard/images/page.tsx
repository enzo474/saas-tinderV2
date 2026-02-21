import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ImageGeneratorClient } from './ImageGeneratorClient'
import { CreditsBadge } from '@/components/ui/CreditsBadge'
import { getUserCredits, isUserAdmin } from '@/lib/credits-server'

export default async function DashboardImagesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  const [credits, isAdmin] = await Promise.all([getUserCredits(user.id), isUserAdmin(user.id)])

  // Récupérer les styles actifs depuis la DB
  const { data: styles } = await supabase
    .from('photo_styles')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  // Récupérer les images générées pour la galerie du mode "Reprendre"
  const { data: generatedImages } = await supabase
    .from('generated_images')
    .select('id, image_url, photo_number, created_at')
    .eq('user_id', user.id)
    .not('image_url', 'like', '%placeholder.com%')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-montserrat font-bold text-white text-2xl md:text-4xl mb-2">
            Générateur d&apos;Images IA
          </h1>
          <p className="text-text-secondary text-sm md:text-base">
            Créez ou modifiez vos images avec l&apos;IA. Coût : 10 crédits par image.
          </p>
        </div>
        <CreditsBadge initialCredits={credits} isAdmin={isAdmin} />
      </div>

      {/* Client Component - Suspense pour useSearchParams */}
      <Suspense fallback={<div className="text-[#9da3af]">Chargement...</div>}>
        <ImageGeneratorClient 
          userId={user.id}
          availableStyles={styles || []}
          generatedImages={generatedImages || []}
          initialMode="new"
        />
      </Suspense>
    </div>
  )
}
