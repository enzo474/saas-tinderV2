import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ImageGeneratorClient } from '../ImageGeneratorClient'
import { CreditsBadge } from '@/components/ui/CreditsBadge'
import { getUserCredits, isUserAdmin } from '@/lib/credits-server'

export default async function DashboardImagesReprendrePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  const [credits, isAdmin] = await Promise.all([getUserCredits(user.id), isUserAdmin(user.id)])

  const { data: styles } = await supabase
    .from('photo_styles')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  // Fetch with style join to build folders
  const { data: rawImages } = await supabase
    .from('generated_images')
    .select('id, image_url, photo_number, created_at, generation_type, photo_styles(style_name)')
    .eq('user_id', user.id)
    .not('image_url', 'like', '%placeholder.com%')
    .order('created_at', { ascending: false })

  const styleToSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const validImages = (rawImages || []).filter(
    (img) => img.image_url && !img.image_url.includes('undefined')
  )

  // Group images by style into folders
  const imageFolders: {
    slug: string
    label: string
    count: number
    items: { id: string; image_url: string; photo_number: number; created_at: string }[]
  }[] = []

  const regenImages = validImages.filter((img) => img.generation_type === 'regeneration')
  if (regenImages.length > 0) {
    imageFolders.push({
      slug: 'image-reprise',
      label: 'Image reprise',
      count: regenImages.length,
      items: regenImages,
    })
  }

  const styleGroups = new Map<string, typeof validImages>()
  for (const img of validImages) {
    if (img.generation_type !== 'regeneration') {
      const style = img.photo_styles as { style_name?: string } | null
      const styleName = style?.style_name || 'Sans style'
      const slug = styleToSlug(styleName)
      if (!styleGroups.has(slug)) styleGroups.set(slug, [])
      styleGroups.get(slug)!.push(img)
    }
  }
  for (const [slug, items] of styleGroups) {
    const style = items[0]?.photo_styles as { style_name?: string } | null
    imageFolders.push({
      slug,
      label: style?.style_name || (slug === 'sans-style' ? 'Sans style' : slug),
      count: items.length,
      items,
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-montserrat font-bold text-white text-2xl md:text-4xl mb-2">
            Choisis ton propre style
          </h1>
          <p className="text-text-secondary text-sm md:text-base">
            Modifiez une image existante avec vos instructions. Coût : 10 crédits par image.
          </p>
        </div>
        <CreditsBadge initialCredits={credits} isAdmin={isAdmin} />
      </div>

      <Suspense fallback={<div className="text-[#9da3af]">Chargement...</div>}>
        <ImageGeneratorClient
          userId={user.id}
          availableStyles={styles || []}
          imageFolders={imageFolders}
          initialMode="edit"
        />
      </Suspense>
    </div>
  )
}
