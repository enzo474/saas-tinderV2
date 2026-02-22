import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminTools } from '@/components/admin/AdminTools'
import { CreditManager } from '@/components/admin/CreditManager'

export default async function DashboardAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  const { data: userData } = await supabase
    .from('user_profiles')
    .select('role, credits')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    redirect('/dashboard/home')
  }

  const { data: analysis } = await supabase
    .from('analyses')
    .select('status, paid_at, image_generation_used, generated_photos_urls, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="min-h-full">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="font-sora font-bold text-white text-2xl md:text-4xl">
            Panel Admin
          </h1>
          <p className="font-inter text-[#9da3af] text-lg">
            Outils de test et gestion pour administrateur
          </p>
        </div>

        <AdminTools
          userEmail={user.email!}
          currentAnalysis={analysis}
          credits={userData.credits}
        />

        <CreditManager />

        <div className="bg-[#1f2128] border border-[#2a2d36] rounded-lg p-6">
          <h3 className="font-sora font-bold text-white text-lg mb-4">
            Navigation Rapide
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            <a
              href="/dashboard/home"
              className="bg-[#16171b] hover:bg-[#1a1b20] border border-[#2a2d36] text-white py-3 px-4 rounded-lg font-inter text-sm transition-colors text-center"
            >
              Dashboard Principal
            </a>
            <a
              href="/dashboard/images"
              className="bg-[#16171b] hover:bg-[#1a1b20] border border-[#2a2d36] text-white py-3 px-4 rounded-lg font-inter text-sm transition-colors text-center"
            >
              Générateur d&apos;Images
            </a>
            <a
              href="/dashboard/bio"
              className="bg-[#16171b] hover:bg-[#1a1b20] border border-[#2a2d36] text-white py-3 px-4 rounded-lg font-inter text-sm transition-colors text-center"
            >
              Générateur de Bio
            </a>
            <a
              href="/dashboard/admin/photo-styles"
              className="bg-[#16171b] hover:bg-[#1a1b20] border border-[#2a2d36] text-white py-3 px-4 rounded-lg font-inter text-sm transition-colors text-center"
            >
              Styles photos
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
