import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AnalysisIntro() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let inexploitedPercent: number | null = null
  if (user) {
    const { data } = await supabase
      .from('analyses')
      .select('inexploited_percent')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    inexploitedPercent = data?.inexploited_percent ?? null
  }

  const pct = inexploitedPercent ?? 70

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-xl mx-auto text-center">
        {/* Titre avec % dynamique */}
        <h1 className="font-montserrat font-black text-white text-4xl md:text-5xl mb-5 leading-tight">
          Débloque tes{' '}
          <span style={{
            background: 'linear-gradient(135deg, #E63946, #FF4757)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {pct}%
          </span>{' '}
          gâchés
        </h1>

        {/* Description */}
        <p className="text-text-secondary text-base leading-relaxed mb-8">
          On va identifier exactement ce qui te freine et comment le corriger.
          En 5 minutes, tu auras un plan d&apos;action clair pour maximiser tes résultats.
        </p>

        {/* Liste */}
        <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-6 mb-8 text-left space-y-3">
          <p className="font-montserrat font-semibold text-white text-sm mb-4">
            Ce qu&apos;on va analyser :
          </p>
          {[
            'Tes photos actuelles (qualité, ordre, impact)',
            'Ta bio (clarté, accroche, différenciation)',
            'Ton positionnement (cible, vibe, unicité)',
            'Ton plan d\'amélioration personnalisé',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-red-primary font-bold mt-0.5 shrink-0">✓</span>
              <p className="font-inter text-text-secondary text-sm">{item}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link href="/analysis/step/1">
          <Button className="text-base justify-center w-full">
            Allons chercher tes {pct}% →
          </Button>
        </Link>
      </div>
    </div>
  )
}
