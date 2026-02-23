import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminConversationsClient from '@/components/admin/AdminConversationsClient'

export default async function AdminConversationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: userData } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') redirect('/dashboard/home')

  return <AdminConversationsClient />
}
