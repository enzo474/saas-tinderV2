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
    rizzSessionsResult,
    dashboardVisitsResult,
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

    // 5. Sessions A/B onboarding
    serviceRole.from('rizz_sessions').select(
      'id, flow_type, ab_variant, device_type, selected_tone, selected_girl, has_uploaded_image, user_answer, message_length, saw_blurred_result, clicked_unlock, completed_auth, saw_unblurred_result, copied_result, credit_given, arrived_at, submitted_at, saw_result_at, clicked_unlock_at, auth_completed_at, saw_reveal_at, copied_at, created_at'
    ).order('created_at', { ascending: false }),

    // 6. Visites dashboard (users déjà connectés)
    serviceRole.from('dashboard_visits').select('id, user_id, source, visited_at'),
  ])

  // user_profiles = source de vérité (seuls les vrais users actifs)
  const { data: profiles } = await serviceRole.from('user_profiles').select('id, email, created_at')

  const allAuthUsers = usersListResult.data?.users ?? []
  const generations = generationsResult.data ?? []
  const credits = creditsResult.data ?? []
  const funnel = funnelResult.data ?? []
  const profilesList = profiles ?? []
  const rizzSessions = rizzSessionsResult.data ?? []
  const dashboardVisits = dashboardVisitsResult.data ?? []

  // On ne garde que les users qui ont un user_profile (supprimés = exclus)
  const enrichedUsers = profilesList.map((profile) => {
    const authUser = allAuthUsers.find((u) => u.id === profile.id)
    const credit = credits.find((c) => c.user_id === profile.id)
    const userGens = generations.filter((g) => g.user_id === profile.id)
    const provider = (authUser?.app_metadata?.provider as string) ?? 'email'
    return {
      id: profile.id,
      email: profile.email ?? authUser?.email ?? '—',
      provider,
      created_at: profile.created_at ?? authUser?.created_at ?? '',
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
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

  // KPIs globaux — basés sur les profils existants uniquement
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const activeThisMonth = enrichedUsers.filter((u) =>
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
  enrichedUsers.forEach((u) => {
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

  // Répartition Google vs Email (basé sur les profils existants)
  const providerCounts = { google: 0, email: 0, other: 0 }
  enrichedUsers.forEach((u) => {
    if (u.provider === 'google') providerCounts.google++
    else if (u.provider === 'email') providerCounts.email++
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

  // ── A/B onboarding funnel ──────────────────────────────────────────
  type RizzRow = typeof rizzSessions[number]
  function abFunnel(rows: RizzRow[]) {
    const total     = rows.length
    const submitted = rows.filter(r => r.submitted_at).length
    const sawResult = rows.filter(r => r.saw_blurred_result).length
    const unlocked  = rows.filter(r => r.clicked_unlock).length
    const converted = rows.filter(r => r.completed_auth).length
    const revealed  = rows.filter(r => r.saw_unblurred_result).length
    const copied    = rows.filter(r => r.copied_result).length
    const withImage = rows.filter(r => r.has_uploaded_image).length
    const oui       = rows.filter(r => r.user_answer === 'oui').length
    const non       = rows.filter(r => r.user_answer === 'non').length
    const mobile    = rows.filter(r => r.device_type === 'mobile').length
    const desktop   = rows.filter(r => r.device_type === 'desktop').length
    const pct = (n: number, d: number) => d > 0 ? Math.round((n / d) * 100) : 0

    // Distribution des tons
    const toneDist: Record<string, number> = {}
    rows.forEach(r => { if (r.selected_tone) toneDist[r.selected_tone] = (toneDist[r.selected_tone] ?? 0) + 1 })
    const topTones = Object.entries(toneDist).sort((a, b) => b[1] - a[1])

    // Distribution des filles (test-2)
    const girlDist: Record<string, number> = {}
    rows.forEach(r => { if (r.selected_girl) girlDist[r.selected_girl] = (girlDist[r.selected_girl] ?? 0) + 1 })

    // Durée moyenne arrivée → soumission (secondes)
    const durations = rows
      .filter(r => r.arrived_at && r.submitted_at)
      .map(r => (new Date(r.submitted_at as string).getTime() - new Date(r.arrived_at as string).getTime()) / 1000)
    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null

    return {
      total, submitted, sawResult, unlocked, converted, revealed, copied,
      withImage, oui, non, mobile, desktop, topTones, girlDist, avgDuration,
      pct_submitted:  pct(submitted, total),
      pct_saw_result: pct(sawResult, submitted),
      pct_unlocked:   pct(unlocked, sawResult),
      pct_converted:  pct(converted, unlocked),
      pct_revealed:   pct(revealed, converted),
      pct_copied:     pct(copied, revealed),
    }
  }

  const test1Sessions = rizzSessions.filter(r => r.flow_type === 'test-1')
  const test2Sessions = rizzSessions.filter(r => r.flow_type === 'test-2')

  const abData = {
    test1: abFunnel(test1Sessions),
    test2: abFunnel(test2Sessions),
    total: abFunnel(rizzSessions),
    dashboardDirectVisits: dashboardVisits.length,
    recentSessions: rizzSessions.slice(0, 50).map(r => ({
      id: r.id as string,
      flow_type: r.flow_type as string,
      device_type: r.device_type as string | null,
      selected_tone: r.selected_tone as string | null,
      selected_girl: r.selected_girl as string | null,
      user_answer: r.user_answer as string | null,
      message_length: r.message_length as number | null,
      saw_result: r.saw_blurred_result as boolean,
      clicked_unlock: r.clicked_unlock as boolean,
      completed_auth: r.completed_auth as boolean,
      saw_reveal: r.saw_unblurred_result as boolean,
      copied: r.copied_result as boolean,
      created_at: r.created_at as string,
    })),
  }

  return {
    kpis: {
      total_users: enrichedUsers.length,
      active_this_month: activeThisMonth,
      active_subscribers: activeSubscribers,
      conversion_rate: enrichedUsers.length > 0 ? Math.round((activeSubscribers / enrichedUsers.length) * 100) : 0,
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
    abData,
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
