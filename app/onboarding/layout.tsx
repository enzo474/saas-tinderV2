import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { AccountMenu } from './AccountMenu'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Barre de navigation minimale */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-bg-primary/80 backdrop-blur-sm border-b border-border-primary/50">
        {/* Logo */}
        <Link href="/" className="font-montserrat font-extrabold text-sm" style={{
          background: 'linear-gradient(135deg, #E63946, #FF4757)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Crushmaxxing
        </Link>

        {/* Compte */}
        {user ? (
          <AccountMenu userEmail={user.email ?? null} />
        ) : (
          <Link
            href="/auth"
            className="px-3 py-1.5 text-xs font-inter font-semibold text-white bg-red-primary rounded-lg hover:bg-red-light transition-colors"
          >
            Se connecter
          </Link>
        )}
      </header>

      {/* Contenu avec offset pour la barre */}
      <div className="pt-14">
        {children}
      </div>
    </div>
  )
}
