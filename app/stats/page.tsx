import { createClient } from '@/lib/supabase/server'
import { DataDashboard } from '@/components/admin/DataDashboard'
import { fetchAdminData } from '@/lib/admin/fetchAdminData'
import { StatsLoginPage } from './StatsLoginButton'

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Non connecté → page de connexion Google
  if (!user) {
    return <StatsLoginPage />
  }

  const adminEmail = process.env.ADMIN_EMAIL

  // Connecté mais mauvaise adresse → accès refusé
  if (!adminEmail || user.email !== adminEmail) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0A0A0A' }}
      >
        <div
          className="w-full max-w-sm p-8 flex flex-col items-center gap-4 rounded-2xl text-center"
          style={{ background: '#111', border: '1px solid #1F1F1F' }}
        >
          <p className="text-4xl">🔒</p>
          <h1 className="text-xl font-black text-white">Accès refusé</h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Ce compte n&apos;est pas autorisé à accéder aux analytics.
          </p>
          <p className="text-xs px-3 py-1.5 rounded-lg" style={{ background: '#1A1A1A', color: '#6b7280' }}>
            {user.email}
          </p>
        </div>
      </div>
    )
  }

  // Admin confirmé → charger et afficher les données
  const data = await fetchAdminData()

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A' }}>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#E63946' }}>
              Crushmaxxing
            </p>
            <h1 className="font-bold text-white text-2xl md:text-3xl">
              Data Analytics
            </h1>
            <p className="text-sm" style={{ color: '#9da3af' }}>
              Parcours utilisateur complet — mis à jour en temps réel
            </p>
          </div>
          <p className="text-xs hidden md:block" style={{ color: '#374151' }}>
            {user.email}
          </p>
        </div>
        <DataDashboard data={data} />
      </div>
    </div>
  )
}
