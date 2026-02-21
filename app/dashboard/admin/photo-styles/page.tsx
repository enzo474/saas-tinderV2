import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StyleList } from '@/components/admin/StyleList'

export default async function DashboardAdminPhotoStylesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  const { data: userData } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    redirect('/dashboard/home')
  }

  const { data: styles } = await supabase
    .from('photo_styles')
    .select('*')
    .order('photo_number')
    .order('display_order')

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-sora font-bold text-white text-3xl mb-2">
          Panel Admin - Styles de Photos
        </h1>
        <p className="font-inter text-[#9da3af]">
          Gérez les styles de photos disponibles pour la génération IA.
        </p>
      </div>
      <StyleList initialStyles={styles || []} />
    </div>
  )
}
