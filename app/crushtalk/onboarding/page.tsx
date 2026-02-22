import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CrushTalkOnboardingClient } from '@/components/crushtalk/CrushTalkOnboardingClient'

export default async function CrushTalkOnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/crushtalk/login')

  // Si onboarding déjà fait → aller directement au dashboard
  const { data: existing } = await supabase
    .from('crushtalk_onboarding')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) redirect('/dashboard/hooks')

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Header minimaliste */}
      <header className="border-b border-white/5 px-4 h-14 flex items-center">
        <span
          className="font-montserrat font-extrabold text-xl"
          style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          Crushmaxxing
        </span>
        <div className="ml-3 px-3 py-1 rounded-full border border-[#F77F00]/30 bg-[#F77F00]/10 text-[#F77F00] text-xs font-semibold">
          CrushTalk
        </div>
      </header>

      {/* Contenu centré */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg mb-8 text-center">
          <h1 className="font-montserrat font-bold text-white text-2xl md:text-3xl mb-2">
            Bienvenue sur CrushTalk
          </h1>
          <p className="text-[#9da3af] text-sm">
            Quelques questions rapides pour personnaliser tes messages.
          </p>
        </div>
        <CrushTalkOnboardingClient />
      </div>
    </div>
  )
}
