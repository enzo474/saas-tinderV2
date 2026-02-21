import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { isUserAdmin } from '@/lib/credits-server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  // Récupérer les crédits et le rôle de l'utilisateur
  const isAdmin = await isUserAdmin(user.id)

  // Les admins bypass la vérification de paiement
  if (!isAdmin) {
    // Vérifier que l'utilisateur a payé
    const { data: analysis } = await supabase
      .from('analyses')
      .select('paid_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .single()

    if (!analysis?.paid_at) {
      redirect('/pricing')
    }
  }

  return (
    <div className="h-screen bg-bg-primary flex overflow-hidden">
      {/* Mobile top nav */}
      <MobileNav userEmail={user.email || ''} isAdmin={isAdmin} />

      {/* Sidebar (desktop only) */}
      <Sidebar userEmail={user.email || ''} isAdmin={isAdmin} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <main className="flex-1 min-h-0 overflow-auto p-6 md:p-8 pt-20 md:pt-8 bg-bg-primary">
          {children}
        </main>
      </div>
    </div>
  )
}
