import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DataDashboard } from '@/components/admin/DataDashboard'
import { fetchAdminData } from '@/lib/admin/fetchAdminData'

export default async function AdminDataPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: userData } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') redirect('/dashboard/home')

  const data = await fetchAdminData()

  return (
    <div className="min-h-full">
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        <div className="space-y-1">
          <h1 className="font-sora font-bold text-white text-2xl md:text-3xl">
            Data Analytics
          </h1>
          <p className="font-inter text-sm" style={{ color: '#9da3af' }}>
            Parcours utilisateur complet — mis à jour en temps réel
          </p>
        </div>
        <DataDashboard data={data} />
      </div>
    </div>
  )
}
