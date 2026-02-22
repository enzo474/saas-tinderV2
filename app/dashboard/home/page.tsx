import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHomeClient } from '@/components/dashboard/DashboardHomeClient'
import { getOrCreateAnalysis } from '@/lib/actions/onboarding'
import { isUserAdmin, getUserCredits } from '@/lib/credits-server'

export default async function DashboardHomePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  // Lancer toutes les queries indépendantes en parallèle
  const [analysesResult, imagesResult, biosResult, isAdmin, initialCredits] = await Promise.all([
    supabase
      .from('analyses')
      .select('id, full_plan, paid_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('generated_images')
      .select('*, photo_styles(style_name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('generated_bios')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    isUserAdmin(user.id),
    getUserCredits(user.id),
  ])

  let analysis = analysesResult.data?.[0]
  const rawImages = imagesResult.data
  const generatedBios = biosResult.data

  // Si aucune analyse : en créer une (admin peut arriver sans avoir fait l'onboarding)
  if (!analysis) {
    const created = await getOrCreateAnalysis()
    if (created) {
      analysis = { id: created.id, full_plan: created.full_plan, paid_at: created.paid_at }
      if (isAdmin && !created.paid_at) {
        await supabase
          .from('analyses')
          .update({ paid_at: new Date().toISOString(), status: 'paid', product_type: 'plan' })
          .eq('id', created.id)
          .eq('user_id', user.id)
        analysis = { ...analysis, paid_at: new Date().toISOString() }
      }
    }
  }

  const fullPlan = analysis?.full_plan as { optimized_bios?: Array<{ type: string; text: string }> } | null

  // Construire bioFolders: { slug, label, count, items }[]
  const bioFolders: { slug: string; label: string; count: number; items: { id: string; bio_text: string; tone: string | null; generation_type?: string; created_at?: string }[] }[] = []
  if (fullPlan?.optimized_bios?.length) {
    const planBios = fullPlan.optimized_bios.map((bio, i) => ({
      id: `plan-${i}`,
      bio_text: bio.text,
      tone: bio.type || null,
    }))
    bioFolders.push({ slug: 'bio-optimisees', label: 'Bio optimisées', count: planBios.length, items: planBios })
  }
  const toneSlugs = ['direct', 'intrigant', 'humoristique', 'aventurier'] as const
  const toneLabels: Record<string, string> = { direct: 'Direct', intrigant: 'Intrigant', humoristique: 'Humoristique', aventurier: 'Aventurier' }
  for (const tone of toneSlugs) {
    const items = (generatedBios || []).filter((b) => b.tone === tone).map((b) => ({
      id: b.id,
      bio_text: b.bio_text,
      tone: b.tone,
      generation_type: b.generation_type,
      created_at: b.created_at,
    }))
    if (items.length > 0) {
      bioFolders.push({ slug: tone, label: toneLabels[tone], count: items.length, items })
    }
  }

  // Helper slug depuis style_name
  const styleToSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  // Construire imageFolders: { slug, label, count, items }[]
  const imageFolders: { slug: string; label: string; count: number; items: { id: string; image_url: string; photo_number: number; generation_type: string; created_at: string }[] }[] = []
  const validImages = (rawImages || []).filter((img) => img.image_url && !img.image_url.includes('placeholder.com') && !img.image_url.includes('undefined'))
  const regenImages = validImages.filter((img) => img.generation_type === 'regeneration')
  if (regenImages.length > 0) {
    imageFolders.push({ slug: 'image-reprise', label: 'Image reprise', count: regenImages.length, items: regenImages })
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

  const analysisId = analysis?.id ?? ''

  return (
    <DashboardHomeClient
      analysisId={analysisId}
      analysisFullPlan={analysis?.full_plan}
      bioFolders={bioFolders}
      imageFolders={imageFolders}
      userId={user.id}
      initialCredits={initialCredits}
      isAdmin={isAdmin}
    />
  )
}
