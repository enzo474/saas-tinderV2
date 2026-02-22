import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CrushTalkPricingClient } from '@/components/crushtalk/CrushTalkPricingClient'

export default async function CrushTalkPricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/crushtalk/login')

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 border-b" style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(12px)', borderColor: '#1F1F1F' }}>
        <Link href="/ct/accroche" className="font-montserrat font-extrabold text-lg" style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Crushmaxxing
        </Link>
        <div className="px-2.5 py-1 rounded-full border text-xs font-bold" style={{ background: 'rgba(247,127,0,0.1)', borderColor: 'rgba(247,127,0,0.3)', color: '#F77F00' }}>
          CrushTalk
        </div>
      </header>

      <div className="px-4 py-12 pt-24 max-w-3xl mx-auto">
        {/* Glow */}
        <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(247,127,0,0.06), transparent 60%)' }} />

        <div className="relative z-10">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#F77F00' }}>Abonnement mensuel</p>
            <h1 className="font-montserrat font-black text-white text-4xl md:text-5xl mb-4 leading-tight">
              Choisis ton <span style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>niveau</span>
            </h1>
            <p className="text-lg" style={{ color: '#9da3af' }}>
              Des messages qui matchent, des dates qui se concrétisent
            </p>
          </div>

          <CrushTalkPricingClient />

          <p className="text-center text-xs mt-8" style={{ color: '#6b7280' }}>
            Paiement sécurisé · Résiliation à tout moment · Sans engagement
          </p>
        </div>
      </div>
    </div>
  )
}
