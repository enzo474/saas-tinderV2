import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BioForm } from '@/components/bio-generator/BioForm'
import { getUserCredits, isUserAdmin } from '@/lib/credits-server'
import { CreditsBadge } from '@/components/ui/CreditsBadge'

export default async function BioGeneratorPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  const [credits, isAdmin] = await Promise.all([getUserCredits(user.id), isUserAdmin(user.id)])

  // Récupérer l'analyse (formulaire + full_plan pour les 4 bios optimisées)
  const { data: analysesData } = await supabase
    .from('analyses')
    .select('job, sport, lifestyle, vibe, anecdotes, passions, current_bio, personality, full_plan, paid_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const analysis = analysesData?.[0]

  // Vérifier que le user a payé CrushPicture — sinon rediriger vers pricing
  if (!isAdmin && !analysis?.paid_at) {
    redirect('/pricing')
  }

  const analysisData = analysis ? {
    job: analysis.job || '',
    passions: (analysis.passions || []).filter(Boolean) as string[],
    anecdotes: (analysis.anecdotes || []).filter(Boolean) as string[],
    personality: (analysis as { personality?: string })?.personality || '',
  } : null

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-montserrat font-bold text-white text-2xl md:text-4xl mb-2">
            Générateur de Bio
          </h1>
          <p className="text-text-secondary text-sm md:text-base">
            Créez une bio personnalisée et optimisée pour votre profil dating.
          </p>
        </div>
        <CreditsBadge initialCredits={credits} isAdmin={isAdmin} />
      </div>

      <BioForm initialCredits={credits} userId={user.id} analysisData={analysisData} />
    </div>
  )
}
