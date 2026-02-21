import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AccountMenu } from '@/app/onboarding/AccountMenu'

export default async function ResultsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  const { data: analysis } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!analysis || analysis.status !== 'complete') {
    redirect('/onboarding/intro')
  }

  const scores = [
    { label: 'Note des photos', value: analysis.photo_score || 0 },
    { label: 'Note biographie', value: analysis.bio_score || 0 },
    { label: 'Note cohérence cible', value: analysis.coherence_score || 0 },
  ]

  const total = analysis.total_score || 0
  const totalColor = total >= 60 ? '#22c55e' : total >= 40 ? '#f97316' : '#E63946'

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-bg-primary/80 backdrop-blur-sm border-b border-border-primary/50">
        <Link href="/" className="font-montserrat font-extrabold text-sm" style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Crushmaxxing
        </Link>
        <AccountMenu userEmail={user.email ?? null} />
      </header>

      <div className="flex flex-col items-center justify-center px-4 py-12 pt-20">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(230,57,70,0.08), transparent 60%)' }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto space-y-4">
        <div className="text-center mb-8">
          <h1 className="font-montserrat font-black text-white text-3xl md:text-4xl mb-2">
            Ton score de profil
          </h1>
          <p className="text-text-secondary text-sm">Voici une analyse honnête de ton profil actuel</p>
        </div>

        {/* Score cards */}
        {scores.map((score, i) => {
          const color = score.value >= 60 ? '#22c55e' : score.value >= 40 ? '#f97316' : '#E63946'
          return (
            <div key={i} className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-montserrat font-semibold text-white text-sm">{score.label}</p>
                <p className="font-montserrat font-black text-white text-xl">
                  {score.value} <span className="text-text-tertiary text-sm font-normal">/100</span>
                </p>
              </div>
              <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${score.value}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}

        {/* Total score */}
        <div
          className="rounded-2xl p-5 border-2"
          style={{ background: 'linear-gradient(135deg, rgba(230,57,70,0.1), rgba(255,71,87,0.05))', borderColor: 'rgba(230,57,70,0.4)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-montserrat font-bold text-white">Score total</p>
            <p className="font-montserrat font-black text-white text-2xl">
              {total} <span className="text-text-tertiary text-sm font-normal">/100</span>
            </p>
          </div>
          <div className="w-full h-2.5 bg-bg-primary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${total}%`, backgroundColor: totalColor }}
            />
          </div>
        </div>

        <Link href="/pricing" className="btn-primary w-full justify-center text-base mt-2 block text-center">
          Optimiser mon profil maintenant →
        </Link>
      </div>
      </div>
    </div>
  )
}
