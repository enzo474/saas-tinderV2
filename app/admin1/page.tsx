import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Admin1Form } from './Admin1Form'

export default async function Admin1Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si déjà connecté, vérifier si admin et rediriger
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      redirect('/dashboard/admin')
    } else {
      redirect('/game/accroche')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0A0A0A' }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-8"
        style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <span
            className="font-montserrat font-extrabold text-2xl"
            style={{
              background: 'linear-gradient(135deg, #E63946, #FF4757)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Crushmaxxing
          </span>
          <p className="text-xs mt-1 font-medium" style={{ color: '#6b7280' }}>
            Accès administrateur
          </p>
        </div>

        <Admin1Form />
      </div>
    </div>
  )
}
