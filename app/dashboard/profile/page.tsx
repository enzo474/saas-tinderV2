import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfilePreviewClient } from './ProfilePreviewClient'
import { CreditsBadge } from '@/components/ui/CreditsBadge'
import { getUserCredits, isUserAdmin } from '@/lib/credits-server'

export default async function DashboardProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  const [credits, isAdmin] = await Promise.all([getUserCredits(user.id), isUserAdmin(user.id)])

  // Récupérer toutes les images générées
  const { data: generatedImages } = await supabase
    .from('generated_images')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Récupérer l'analyse pour generated_photos_urls
  const { data: analysis } = await supabase
    .from('analyses')
    .select('generated_photos_urls')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .single()

  // Combiner toutes les images disponibles
  const allImageUrls = [
    ...(analysis?.generated_photos_urls || []),
    ...(generatedImages?.map(img => img.image_url) || [])
  ].filter(url => url && !url.includes('placeholder.com'))

  // Récupérer les bios générées
  const { data: bios } = await supabase
    .from('generated_bios')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-montserrat font-bold text-white text-2xl md:text-4xl mb-2">
            Rendu Profil Preview
          </h1>
          <p className="text-text-secondary text-sm md:text-base">
            Prévisualisez votre profil comme sur Tinder, Fruitz ou Hinge.
          </p>
        </div>
        <CreditsBadge initialCredits={credits} isAdmin={isAdmin} />
      </div>

      {/* Client Component */}
      <ProfilePreviewClient 
        availableImages={allImageUrls}
        availableBios={bios || []}
      />
    </div>
  )
}
