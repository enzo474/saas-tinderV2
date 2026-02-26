import { redirect } from 'next/navigation'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { DataDashboard } from '@/components/admin/DataDashboard'

export const dynamic = 'force-dynamic'

async function fetchAdminData() {
  const serviceRole = createServiceRoleClient()

  // Parallel fetches
  const [
    funnelResult,
    generationsResult,
    creditsResult,
    usersListResult,
  ] = await Promise.all([
    // 1. Funnel onboarding (ip_tracking)
    serviceRole.from('ip_tracking').select(
      'ip_address, onboarding_started_at, onboarding_video_viewed, onboarding_question_1_at, onboarding_question_2_at, onboarding_question_3_at, onboarding_question_4_at, onboarding_question_5_at, onboarding_completed_at, onboarding_drop_step, dashboard_first_visit_at, dashboard_total_visits, has_subscribed, subscription_plan, subscribed_at, pricing_visited_at, pricing_visit_count, checkout_started_at, checkout_plan, created_at'
    ).order('created_at', { ascending: false }),

    // 2. Toutes les générations
    serviceRole.from('crushtalk_generations').select(
      'id, user_id, message_type, selected_tones, created_at'
    ).order('created_at', { ascending: false }),

    // 3. Credits / abonnements
    serviceRole.from('crushtalk_credits').select(
      'user_id, balance, used_total, subscription_type, subscription_status, subscription_current_period_end, stripe_customer_id, created_at, updated_at'
    ),

    // 4. Liste des users via admin API
    serviceRole.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])

  // user_profiles pour les emails
  const { data: profiles } = await serviceRole.from('user_profiles').select('id, email, created_at')

  const users = usersListResult.data?.users ?? []
  const generations = generationsResult.data ?? []
  const credits = creditsResult.data ?? []
  const funnel = funnelResult.data ?? []
  const profilesList = profiles ?? []

  // Enrichir les users avec plan, nb générations, email
  const enrichedUsers = users.map((u) => {
    const profile = profilesList.find((p) => p.id === u.id)
    const credit = credits.find((c) => c.user_id === u.id)
    const userGens = generations.filter((g) => g.user_id === u.id)
    const email = profile?.email ?? u.email ?? '—'
    const provider = (u.app_metadata?.provider as string) ?? 'email'
    return {
      id: u.id,
      email,
      provider,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      plan: credit?.subscription_type ?? null,
      subscription_status: credit?.subscription_status ?? null,
      subscription_period_end: credit?.subscription_current_period_end ?? null,
      used_total: credit?.used_total ?? 0,
      balance: credit?.balance ?? 0,
      gen_count: userGens.length,
      gen_accroche: userGens.filter((g) => g.message_type === 'accroche').length,
      gen_reponse: userGens.filter((g) => g.message_type === 'reponse').length,
    }
  })

  // KPIs globaux
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const activeThisMonth = users.filter((u) =>
    u.last_sign_in_at && new Date(u.last_sign_in_at) > thirtyDaysAgo
  ).length

  const activeSubscribers = credits.filter((c) => c.subscription_status === 'active').length
  const totalGens = generations.length
  const totalAccroches = generations.filter((g) => g.message_type === 'accroche').length
  const totalReponses = generations.filter((g) => g.message_type === 'reponse').length

  // Funnel onboarding
  const funnelSteps = {
    total_ips: funnel.length,
    started: funnel.filter((r) => r.onboarding_started_at).length,
    video_viewed: funnel.filter((r) => r.onboarding_video_viewed).length,
    q1: funnel.filter((r) => r.onboarding_question_1_at).length,
    q2: funnel.filter((r) => r.onboarding_question_2_at).length,
    q3: funnel.filter((r) => r.onboarding_question_3_at).length,
    q4: funnel.filter((r) => r.onboarding_question_4_at).length,
    q5: funnel.filter((r) => r.onboarding_question_5_at).length,
    completed: funnel.filter((r) => r.onboarding_completed_at).length,
    dashboard: funnel.filter((r) => r.dashboard_first_visit_at).length,
    pricing_visited: funnel.filter((r) => r.pricing_visited_at).length,
    checkout_started: funnel.filter((r) => r.checkout_started_at).length,
    subscribed: funnel.filter((r) => r.has_subscribed).length,
  }

  // Inscriptions par jour (30 derniers jours)
  const signupsByDay: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    signupsByDay[d.toISOString().slice(0, 10)] = 0
  }
  users.forEach((u) => {
    const day = u.created_at?.slice(0, 10)
    if (day && day in signupsByDay) signupsByDay[day]++
  })

  // Générations par jour (30 derniers jours)
  const gensByDay: Record<string, { accroche: number; reponse: number }> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    gensByDay[d.toISOString().slice(0, 10)] = { accroche: 0, reponse: 0 }
  }
  generations.forEach((g) => {
    const day = (g.created_at as string)?.slice(0, 10)
    if (day && day in gensByDay) {
      if (g.message_type === 'accroche') gensByDay[day].accroche++
      else gensByDay[day].reponse++
    }
  })

  // Tones les plus utilisés
  const toneCounts: Record<string, number> = {}
  generations.forEach((g) => {
    const tones = (g.selected_tones as string[] | null) ?? []
    tones.forEach((t) => {
      toneCounts[t] = (toneCounts[t] ?? 0) + 1
    })
  })
  const topTones = Object.entries(toneCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  // Répartition Google vs Email
  const providerCounts = { google: 0, email: 0, other: 0 }
  users.forEach((u) => {
    const p = (u.app_metadata?.provider as string) ?? 'email'
    if (p === 'google') providerCounts.google++
    else if (p === 'email') providerCounts.email++
    else providerCounts.other++
  })

  // Plan distribution
  const planDist = { free: 0, chill: 0, charo: 0, canceled: 0 }
  enrichedUsers.forEach((u) => {
    if (!u.plan || u.subscription_status === 'canceled') planDist.free++
    else if (u.plan === 'chill') planDist.chill++
    else if (u.plan === 'charo') planDist.charo++
  })
  credits.filter((c) => c.subscription_status === 'canceled').forEach(() => planDist.canceled++)

  return {
    kpis: {
      total_users: users.length,
      active_this_month: activeThisMonth,
      active_subscribers: activeSubscribers,
      conversion_rate: users.length > 0 ? Math.round((activeSubscribers / users.length) * 100) : 0,
      total_gens: totalGens,
      total_accroches: totalAccroches,
      total_reponses: totalReponses,
    },
    funnelSteps,
    signupsByDay: Object.entries(signupsByDay).map(([date, count]) => ({ date, count })),
    gensByDay: Object.entries(gensByDay).map(([date, v]) => ({ date, ...v })),
    topTones,
    providerCounts,
    planDist,
    enrichedUsers,
  }
}

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
