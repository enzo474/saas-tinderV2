import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BioList } from '@/components/dashboard/BioList'
import { getOrCreateAnalysis } from '@/lib/actions/onboarding'
import { isUserAdmin } from '@/lib/credits-server'

const TONE_LABELS: Record<string, string> = {
  direct: 'Direct',
  intrigant: 'Intrigant',
  humoristique: 'Humoristique',
  aventurier: 'Aventurier',
  'bio-optimisees': 'Bio optimisées',
}

export default async function BioFolderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  let items: { id: string; bio_text: string; tone: string | null; generation_type?: string; created_at?: string }[] = []

  if (slug === 'bio-optimisees') {
    let { data: analysesData } = await supabase
      .from('analyses')
      .select('full_plan')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    let analysis = analysesData?.[0]
    if (!analysis) {
      const created = await getOrCreateAnalysis()
      if (created) analysis = { full_plan: created.full_plan }
    }

    const fullPlan = analysis?.full_plan as { optimized_bios?: Array<{ type: string; text: string }> } | null
    if (!fullPlan?.optimized_bios?.length) notFound()
    items = fullPlan.optimized_bios.map((bio, i) => ({
      id: `plan-${i}`,
      bio_text: bio.text,
      tone: bio.type || null,
    }))
  } else if (['direct', 'intrigant', 'humoristique', 'aventurier'].includes(slug)) {
    const { data } = await supabase
      .from('generated_bios')
      .select('*')
      .eq('user_id', user.id)
      .eq('tone', slug)
      .order('created_at', { ascending: false })
    if (!data?.length) notFound()
    items = data.map((b) => ({
      id: b.id,
      bio_text: b.bio_text,
      tone: b.tone,
      generation_type: b.generation_type,
      created_at: b.created_at,
    }))
  } else {
    notFound()
  }

  const label = TONE_LABELS[slug] || slug

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/dashboard/home"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l&apos;accueil
      </Link>
      <div>
        <h1 className="font-montserrat font-bold text-white text-xl md:text-2xl mb-1">{label}</h1>
        <p className="text-text-secondary text-sm">
          {items.length} bio{items.length > 1 ? 's' : ''} dans ce dossier
        </p>
      </div>
      <BioList initialBios={items} userId={user.id} />
    </div>
  )
}
