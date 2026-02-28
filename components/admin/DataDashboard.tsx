'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'

type EnrichedUser = {
  id: string
  email: string
  provider: string
  created_at: string
  last_sign_in_at: string | null
  plan: string | null
  subscription_status: string | null
  subscription_period_end: string | null
  used_total: number
  balance: number
  gen_count: number
  gen_accroche: number
  gen_reponse: number
}

type AbFlowStats = {
  total: number
  submitted: number
  sawResult: number
  unlocked: number
  converted: number
  revealed: number
  copied: number
  withImage: number
  oui: number
  non: number
  mobile: number
  desktop: number
  topTones: [string, number][]
  girlDist: Record<string, number>
  avgDuration: number | null
  pct_submitted: number
  pct_saw_result: number
  pct_unlocked: number
  pct_converted: number
  pct_revealed: number
  pct_copied: number
}

type AbSession = {
  id: string
  flow_type: string
  device_type: string | null
  selected_tone: string | null
  selected_girl: string | null
  user_answer: string | null
  message_length: number | null
  saw_result: boolean
  clicked_unlock: boolean
  completed_auth: boolean
  saw_reveal: boolean
  copied: boolean
  generated_football: string | null
  created_at: string
}

type Props = {
  data: {
    kpis: {
      total_users: number
      active_this_month: number
      active_subscribers: number
      conversion_rate: number
      total_gens: number
      total_accroches: number
      total_reponses: number
    }
    funnelSteps: {
      total_ips: number
      started: number
      video_viewed: number
      q1: number
      q2: number
      q3: number
      q4: number
      q5: number
      completed: number
      dashboard: number
      pricing_visited: number
      checkout_started: number
      subscribed: number
    }
    signupsByDay: { date: string; count: number }[]
    gensByDay: { date: string; accroche: number; reponse: number }[]
    topTones: [string, number][]
    providerCounts: { google: number; email: number; other: number }
    planDist: { free: number; chill: number; charo: number; canceled: number }
    enrichedUsers: EnrichedUser[]
    abData: {
      test1: AbFlowStats
      test2: AbFlowStats
      total: AbFlowStats
      dashboardDirectVisits: number
      recentSessions: AbSession[]
    }
  }
}

const RED = '#E63946'
const RED2 = '#FF4757'
const GRAY = '#9da3af'
const CARD = { background: '#111111', border: '1px solid #1F1F1F', borderRadius: 16 }

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="p-5 flex flex-col gap-1" style={CARD}>
      <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: GRAY }}>{label}</p>
      <p className="text-3xl font-black text-white font-montserrat">{value}</p>
      {sub && <p className="text-xs" style={{ color: GRAY }}>{sub}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: RED }}>
      {children}
    </h2>
  )
}

function FunnelBar({ label, value, max, prev }: { label: string; value: number; max: number; prev?: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const drop = prev !== undefined && prev > 0 ? Math.round(((prev - value) / prev) * 100) : null
  return (
    <div className="flex items-center gap-3">
      <div className="w-36 text-xs shrink-0 text-right" style={{ color: GRAY }}>{label}</div>
      <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ background: '#1F1F1F' }}>
        <div
          className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
          style={{
            width: `${Math.max(pct, 1)}%`,
            background: `linear-gradient(90deg, ${RED}, ${RED2})`,
          }}
        >
          <span className="text-[10px] font-bold text-white">{value}</span>
        </div>
      </div>
      <div className="w-16 text-xs text-right shrink-0" style={{ color: GRAY }}>
        {pct}%
        {drop !== null && drop > 0 && (
          <span className="ml-1" style={{ color: '#f87171' }}>-{drop}%</span>
        )}
      </div>
    </div>
  )
}

const PROVIDER_COLORS = [RED, '#3b82f6', '#10b981']
const PLAN_COLORS = [GRAY, RED, RED2, '#6b7280']

function downloadCSV(users: EnrichedUser[]) {
  const headers = ['Email', 'Provider', 'Inscrit le', 'Dernière connexion', 'Plan', 'Statut', 'Générations', 'Accroches', 'Réponses']
  const rows = users.map((u) => [
    u.email,
    u.provider,
    u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—',
    u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('fr-FR') : '—',
    u.plan ?? 'Gratuit',
    u.subscription_status ?? '—',
    u.gen_count,
    u.gen_accroche,
    u.gen_reponse,
  ])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `crushmaxxing_users_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}

const fmt = (d: string) => {
  const date = new Date(d)
  return `${date.getDate()}/${date.getMonth() + 1}`
}

export function DataDashboard({ data }: Props) {
  const { kpis, funnelSteps, signupsByDay, gensByDay, topTones, providerCounts, planDist, enrichedUsers, abData } = data
  const [userSort, setUserSort] = useState<'gen_count' | 'created_at' | 'last_sign_in_at'>('gen_count')
  const [userSearch, setUserSearch] = useState('')

  const sortedUsers = [...enrichedUsers]
    .filter((u) => !userSearch || u.email.toLowerCase().includes(userSearch.toLowerCase()))
    .sort((a, b) => {
      if (userSort === 'gen_count') return b.gen_count - a.gen_count
      if (userSort === 'created_at') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (userSort === 'last_sign_in_at') {
        const aT = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0
        const bT = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0
        return bT - aT
      }
      return 0
    })

  const providerData = [
    { name: 'Google', value: providerCounts.google },
    { name: 'Email', value: providerCounts.email },
    { name: 'Autre', value: providerCounts.other },
  ].filter((d) => d.value > 0)

  const planData = [
    { name: 'Gratuit', value: planDist.free },
    { name: 'Chill', value: planDist.chill },
    { name: 'Charo', value: planDist.charo },
    { name: 'Annulé', value: planDist.canceled },
  ].filter((d) => d.value > 0)

  const funnelMax = funnelSteps.total_ips || 1
  const funnelRows: { label: string; value: number; prevKey?: keyof typeof funnelSteps }[] = [
    { label: 'IPs totales', value: funnelSteps.total_ips },
    { label: 'Onboarding démarré', value: funnelSteps.started, prevKey: 'total_ips' },
    { label: 'Vidéo regardée', value: funnelSteps.video_viewed, prevKey: 'started' },
    { label: 'Q1 atteinte', value: funnelSteps.q1, prevKey: 'video_viewed' },
    { label: 'Q2 atteinte', value: funnelSteps.q2, prevKey: 'q1' },
    { label: 'Q3 atteinte', value: funnelSteps.q3, prevKey: 'q2' },
    { label: 'Q4 atteinte', value: funnelSteps.q4, prevKey: 'q3' },
    { label: 'Q5 atteinte', value: funnelSteps.q5, prevKey: 'q4' },
    { label: 'Onboarding complété', value: funnelSteps.completed, prevKey: 'q5' },
    { label: 'Dashboard visité', value: funnelSteps.dashboard, prevKey: 'completed' },
    { label: 'Pricing visité', value: funnelSteps.pricing_visited, prevKey: 'dashboard' },
    { label: 'Checkout démarré', value: funnelSteps.checkout_started, prevKey: 'pricing_visited' },
    { label: 'Abonné', value: funnelSteps.subscribed, prevKey: 'checkout_started' },
  ]

  // Last 14 days for charts (less crowded)
  const last14Signups = signupsByDay.slice(-14)
  const last14Gens = gensByDay.slice(-14)

  const planLabel = (p: string | null, s: string | null) => {
    if (!p || s === 'canceled') return <span style={{ color: GRAY }}>Gratuit</span>
    if (p === 'charo') return <span style={{ color: RED2, fontWeight: 700 }}>Charo ∞</span>
    return <span style={{ color: RED, fontWeight: 700 }}>Chill</span>
  }

  return (
    <div className="space-y-10">

      {/* ── 1. KPIs ── */}
      <section>
        <SectionTitle>Vue d&apos;ensemble</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <KpiCard label="Inscrits" value={kpis.total_users} />
          <KpiCard label="Actifs ce mois" value={kpis.active_this_month} />
          <KpiCard label="Abonnés actifs" value={kpis.active_subscribers} />
          <KpiCard label="Taux conversion" value={`${kpis.conversion_rate}%`} sub="inscrits → payants" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <KpiCard label="Générations totales" value={kpis.total_gens} />
          <KpiCard label="Accroches" value={kpis.total_accroches} />
          <KpiCard label="Réponses" value={kpis.total_reponses} />
        </div>
      </section>

      {/* ── 2. Funnel ── */}
      <section>
        <SectionTitle>Funnel parcours utilisateur</SectionTitle>
        <div className="p-5 space-y-3" style={CARD}>
          {funnelRows.map((row) => (
            <FunnelBar
              key={row.label}
              label={row.label}
              value={row.value}
              max={funnelMax}
              prev={row.prevKey ? funnelSteps[row.prevKey] : undefined}
            />
          ))}
        </div>
      </section>

      {/* ── A/B Onboarding ── */}
      <section>
        <SectionTitle>A/B Onboarding — Funnel complet</SectionTitle>

        {/* KPIs globaux A/B */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <KpiCard label="Visites totales" value={abData.total.total} sub="test-1 + test-2" />
          <KpiCard label="Ont soumis" value={abData.total.submitted} sub={`${abData.total.pct_submitted}% des visites`} />
          <KpiCard label="Ont créé un compte" value={abData.total.converted} sub={`${abData.total.pct_converted}% après débloc.`} />
          <KpiCard label="Dashboard direct" value={abData.dashboardDirectVisits} sub="users déjà connectés" />
        </div>

        {/* Comparaison test-1 vs test-2 */}
        <div className="grid md:grid-cols-2 gap-4 mb-5">
          {([['test-1', abData.test1, 'Onboarding 1 (story)'], ['test-2', abData.test2, 'Onboarding 2 (filles)']] as const).map(([key, stats, label]) => (
            <div key={key} className="p-5 space-y-3" style={CARD}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-white">{label}</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(230,57,70,0.15)', color: RED }}>{stats.total} visites</span>
              </div>
              {([
                ['Arrivée', stats.total, stats.total, null],
                ['Ont soumis un message', stats.submitted, stats.total, stats.pct_submitted],
                ['Ont vu le résultat', stats.sawResult, stats.submitted, stats.pct_saw_result],
                ['Ont cliqué "Voir le football"', stats.unlocked, stats.sawResult, stats.pct_unlocked],
                ['Ont créé un compte', stats.converted, stats.unlocked, stats.pct_converted],
                ['Ont vu la révélation', stats.revealed, stats.converted, stats.pct_revealed],
                ['Ont copié le football', stats.copied, stats.revealed, stats.pct_copied],
              ] as [string, number, number, number | null][]).map(([lbl, val, max, pct]) => (
                <div key={lbl}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: GRAY }}>{lbl}</span>
                    <span className="text-white font-semibold">{val} {pct !== null && <span style={{ color: GRAY }}>({pct}%)</span>}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: '#1F1F1F' }}>
                    <div className="h-full rounded-full" style={{ width: `${max > 0 ? Math.round((val / max) * 100) : 0}%`, background: `linear-gradient(90deg, ${RED}, ${RED2})` }} />
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: '#1F1F1F' }}>
                <div className="text-xs"><span style={{ color: GRAY }}>OUI :</span> <span className="text-white font-semibold">{stats.oui}</span></div>
                <div className="text-xs"><span style={{ color: GRAY }}>NON :</span> <span className="text-white font-semibold">{stats.non}</span></div>
                <div className="text-xs"><span style={{ color: GRAY }}>Mobile :</span> <span className="text-white font-semibold">{stats.mobile}</span></div>
                <div className="text-xs"><span style={{ color: GRAY }}>Desktop :</span> <span className="text-white font-semibold">{stats.desktop}</span></div>
                {stats.avgDuration !== null && (
                  <div className="text-xs col-span-2"><span style={{ color: GRAY }}>Durée moy. :</span> <span className="text-white font-semibold">{stats.avgDuration}s</span></div>
                )}
                {key === 'test-1' && (
                  <div className="text-xs col-span-2"><span style={{ color: GRAY }}>Avec photo :</span> <span className="text-white font-semibold">{stats.withImage}</span></div>
                )}
                {key === 'test-2' && Object.keys(stats.girlDist).length > 0 && (
                  <div className="text-xs col-span-2">
                    <span style={{ color: GRAY }}>Filles : </span>
                    {Object.entries(stats.girlDist).map(([g, n]) => (
                      <span key={g} className="text-white font-semibold ml-2">{g}: {n}</span>
                    ))}
                  </div>
                )}
              </div>
              {/* Top tons */}
              {stats.topTones.length > 0 && (
                <div className="pt-2 border-t" style={{ borderColor: '#1F1F1F' }}>
                  <p className="text-xs mb-2" style={{ color: GRAY }}>Tons choisis</p>
                  <div className="space-y-1">
                    {stats.topTones.map(([tone, count]) => (
                      <div key={tone} className="flex items-center gap-2">
                        <span className="text-xs w-20 shrink-0" style={{ color: GRAY }}>{tone}</span>
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: '#1F1F1F' }}>
                          <div className="h-full rounded-full" style={{ width: `${stats.topTones[0]?.[1] > 0 ? Math.round((count / stats.topTones[0][1]) * 100) : 0}%`, background: RED }} />
                        </div>
                        <span className="text-xs text-white w-6 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sessions récentes */}
        {abData.recentSessions.length > 0 && (
          <div className="p-5" style={CARD}>
            <p className="text-xs font-semibold mb-4" style={{ color: GRAY }}>Sessions récentes (50 dernières)</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ color: GRAY, borderBottom: '1px solid #1F1F1F' }}>
                    <th className="text-left py-2 pr-3 font-semibold">Flow</th>
                    <th className="text-center py-2 pr-3 font-semibold">Device</th>
                    <th className="text-center py-2 pr-3 font-semibold">Ton</th>
                    <th className="text-center py-2 pr-3 font-semibold">Réponse</th>
                    <th className="text-center py-2 pr-3 font-semibold">Résultat</th>
                    <th className="text-center py-2 pr-3 font-semibold">Débloqué</th>
                    <th className="text-center py-2 pr-3 font-semibold">Compte</th>
                    <th className="text-center py-2 pr-3 font-semibold">Copié</th>
                    <th className="text-left py-2 pr-3 font-semibold">Football généré</th>
                    <th className="text-right py-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {abData.recentSessions.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #111' }}>
                      <td className="py-2 pr-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: 'rgba(230,57,70,0.1)', color: RED }}>
                          {s.flow_type}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-center" style={{ color: GRAY }}>{s.device_type ?? '—'}</td>
                      <td className="py-2 pr-3 text-center text-white">{s.selected_tone ?? '—'}</td>
                      <td className="py-2 pr-3 text-center">
                        <span style={{ color: s.user_answer === 'oui' ? '#22c55e' : s.user_answer === 'non' ? RED : GRAY }}>
                          {s.user_answer ?? '—'}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-center">{s.saw_result ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#374151' }}>✗</span>}</td>
                      <td className="py-2 pr-3 text-center">{s.clicked_unlock ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#374151' }}>✗</span>}</td>
                      <td className="py-2 pr-3 text-center">{s.completed_auth ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#374151' }}>✗</span>}</td>
                      <td className="py-2 pr-3 text-center">{s.copied ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#374151' }}>✗</span>}</td>
                      <td className="py-2 pr-3 max-w-[280px]">
                        {s.generated_football ? (
                          <span className="text-white italic leading-snug line-clamp-2" title={s.generated_football}>
                            &ldquo;{s.generated_football}&rdquo;
                          </span>
                        ) : (
                          <span style={{ color: '#374151' }}>—</span>
                        )}
                      </td>
                      <td className="py-2 text-right shrink-0" style={{ color: GRAY }}>
                        {new Date(s.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ── 3. Acquisitions ── */}
      <section>
        <SectionTitle>Acquisitions — 30 derniers jours</SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-5" style={CARD}>
            <p className="text-xs font-semibold mb-4" style={{ color: GRAY }}>Inscriptions / jour</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={last14Signups} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tickFormatter={fmt} tick={{ fill: GRAY, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: GRAY, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: RED }}
                  formatter={(v: number | undefined) => [`${v ?? 0} inscriptions`, '']}
                  labelFormatter={(l) => new Date(l).toLocaleDateString('fr-FR')}
                />
                <Bar dataKey="count" fill={RED} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-5 flex flex-col" style={CARD}>
            <p className="text-xs font-semibold mb-4" style={{ color: GRAY }}>Méthode d&apos;inscription</p>
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={providerData} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                    {providerData.map((_, i) => (
                      <Cell key={i} fill={PROVIDER_COLORS[i % PROVIDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: GRAY }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Générations ── */}
      <section>
        <SectionTitle>Générations</SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-5" style={CARD}>
            <p className="text-xs font-semibold mb-4" style={{ color: GRAY }}>Générations / jour (14j)</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={last14Gens} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tickFormatter={fmt} tick={{ fill: GRAY, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: GRAY, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#fff' }}
                  labelFormatter={(l) => new Date(l).toLocaleDateString('fr-FR')}
                />
                <Bar dataKey="accroche" stackId="a" fill={RED} radius={[0, 0, 0, 0]} name="Accroche" />
                <Bar dataKey="reponse" stackId="a" fill={RED2} radius={[4, 4, 0, 0]} name="Réponse" />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: GRAY }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-5" style={CARD}>
            <p className="text-xs font-semibold mb-4" style={{ color: GRAY }}>Top tons utilisés</p>
            <div className="space-y-2">
              {topTones.length === 0 && <p className="text-xs" style={{ color: GRAY }}>Aucune donnée</p>}
              {topTones.map(([tone, count], i) => {
                const max = topTones[0]?.[1] ?? 1
                return (
                  <div key={tone} className="flex items-center gap-2">
                    <span className="text-xs w-3 shrink-0" style={{ color: GRAY }}>{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-white font-medium">{tone}</span>
                        <span style={{ color: GRAY }}>{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: '#1F1F1F' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(count / max) * 100}%`, background: `linear-gradient(90deg, ${RED}, ${RED2})` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top users par générations */}
        <div className="p-5 mt-4" style={CARD}>
          <p className="text-xs font-semibold mb-4" style={{ color: GRAY }}>Top 10 utilisateurs (générations)</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ color: GRAY, borderBottom: '1px solid #1F1F1F' }}>
                  <th className="text-left py-2 pr-4 font-semibold">#</th>
                  <th className="text-left py-2 pr-4 font-semibold">Email</th>
                  <th className="text-right py-2 pr-4 font-semibold">Total</th>
                  <th className="text-right py-2 pr-4 font-semibold">Accroches</th>
                  <th className="text-right py-2 font-semibold">Réponses</th>
                </tr>
              </thead>
              <tbody>
                {[...enrichedUsers]
                  .sort((a, b) => b.gen_count - a.gen_count)
                  .slice(0, 10)
                  .map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #1A1A1A' }}>
                      <td className="py-2 pr-4" style={{ color: GRAY }}>{i + 1}</td>
                      <td className="py-2 pr-4 text-white font-medium truncate max-w-[200px]">{u.email}</td>
                      <td className="py-2 pr-4 text-right font-bold" style={{ color: RED }}>{u.gen_count}</td>
                      <td className="py-2 pr-4 text-right" style={{ color: GRAY }}>{u.gen_accroche}</td>
                      <td className="py-2 text-right" style={{ color: GRAY }}>{u.gen_reponse}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 5. Conversion ── */}
      <section>
        <SectionTitle>Conversion &amp; abonnements</SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-5 flex flex-col" style={CARD}>
            <p className="text-xs font-semibold mb-4" style={{ color: GRAY }}>Répartition des plans</p>
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={planData} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                    {planData.map((_, i) => (
                      <Cell key={i} fill={PLAN_COLORS[i % PLAN_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: GRAY }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="md:col-span-2 p-5" style={CARD}>
            <p className="text-xs font-semibold mb-4" style={{ color: GRAY }}>Abonnés actifs</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ color: GRAY, borderBottom: '1px solid #1F1F1F' }}>
                    <th className="text-left py-2 pr-4 font-semibold">Email</th>
                    <th className="text-right py-2 pr-4 font-semibold">Plan</th>
                    <th className="text-right py-2 pr-4 font-semibold">Générations</th>
                    <th className="text-right py-2 font-semibold">Expire</th>
                  </tr>
                </thead>
                <tbody>
                  {enrichedUsers
                    .filter((u) => u.plan && u.subscription_status === 'active')
                    .sort((a, b) => b.gen_count - a.gen_count)
                    .map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #1A1A1A' }}>
                        <td className="py-2 pr-4 text-white truncate max-w-[180px]">{u.email}</td>
                        <td className="py-2 pr-4 text-right">{planLabel(u.plan, u.subscription_status)}</td>
                        <td className="py-2 pr-4 text-right" style={{ color: GRAY }}>{u.gen_count}</td>
                        <td className="py-2 text-right" style={{ color: GRAY }}>
                          {u.subscription_period_end
                            ? new Date(u.subscription_period_end).toLocaleDateString('fr-FR')
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  {enrichedUsers.filter((u) => u.plan && u.subscription_status === 'active').length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center" style={{ color: GRAY }}>Aucun abonné actif</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Tableau utilisateurs complet ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Tous les utilisateurs</SectionTitle>
          <button
            onClick={() => downloadCSV(sortedUsers)}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
            style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: RED }}
          >
            ↓ Exporter CSV
          </button>
        </div>

        <div className="p-5" style={CARD}>
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              placeholder="Rechercher par email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-xs text-white outline-none"
              style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
            />
            <select
              value={userSort}
              onChange={(e) => setUserSort(e.target.value as typeof userSort)}
              className="px-3 py-2 rounded-lg text-xs text-white outline-none"
              style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
            >
              <option value="gen_count">Trier : + de générations</option>
              <option value="created_at">Trier : + récents</option>
              <option value="last_sign_in_at">Trier : dernière connexion</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ color: GRAY, borderBottom: '1px solid #1F1F1F' }}>
                  <th className="text-left py-2 pr-3 font-semibold">Email</th>
                  <th className="text-center py-2 pr-3 font-semibold">Auth</th>
                  <th className="text-center py-2 pr-3 font-semibold">Plan</th>
                  <th className="text-right py-2 pr-3 font-semibold">Générations</th>
                  <th className="text-right py-2 pr-3 font-semibold">Inscrit</th>
                  <th className="text-right py-2 font-semibold">Dernière co.</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.slice(0, 100).map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #111' }}>
                    <td className="py-2 pr-3 text-white font-medium max-w-[180px] truncate">{u.email}</td>
                    <td className="py-2 pr-3 text-center">
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                        style={{
                          background: u.provider === 'google' ? 'rgba(59,130,246,0.15)' : 'rgba(230,57,70,0.1)',
                          color: u.provider === 'google' ? '#60a5fa' : RED,
                        }}
                      >
                        {u.provider === 'google' ? 'G' : 'E'}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-center">{planLabel(u.plan, u.subscription_status)}</td>
                    <td className="py-2 pr-3 text-right font-semibold" style={{ color: u.gen_count > 0 ? '#fff' : GRAY }}>
                      {u.gen_count > 0 ? (
                        <span>
                          {u.gen_count}
                          <span className="ml-1 font-normal" style={{ color: GRAY }}>({u.gen_accroche}A/{u.gen_reponse}R)</span>
                        </span>
                      ) : '0'}
                    </td>
                    <td className="py-2 pr-3 text-right" style={{ color: GRAY }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="py-2 text-right" style={{ color: GRAY }}>
                      {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                  </tr>
                ))}
                {sortedUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center" style={{ color: GRAY }}>Aucun utilisateur trouvé</td>
                  </tr>
                )}
              </tbody>
            </table>
            {sortedUsers.length > 100 && (
              <p className="text-center text-xs mt-3" style={{ color: GRAY }}>
                Affichage des 100 premiers sur {sortedUsers.length} — exporte le CSV pour tout voir
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
