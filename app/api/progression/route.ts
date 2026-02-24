import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getLevelInfo, getXPForNextLevel, getLevelProgressPercent } from '@/lib/gamification/level-system'

export async function GET() {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer ou créer la progression
    let { data: prog } = await supabaseAdmin
      .from('user_progression')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!prog) {
      const { data: firstGirl } = await supabaseAdmin
        .from('training_girls')
        .select('id')
        .eq('difficulty_level', 1)
        .single()

      const { data: newProg } = await supabaseAdmin
        .from('user_progression')
        .insert({
          user_id: user.id,
          unlocked_girls: firstGirl ? [firstGirl.id] : [],
        })
        .select('*')
        .single()
      prog = newProg
    }

    if (!prog) {
      return NextResponse.json({ error: 'Impossible de créer la progression' }, { status: 500 })
    }

    const totalXP: number = prog.total_xp ?? 0
    const currentLevel: number = prog.current_level ?? 0
    const levelInfo = getLevelInfo(currentLevel)
    const xpToNext = getXPForNextLevel(totalXP, currentLevel)
    const progressPercent = getLevelProgressPercent(totalXP, currentLevel)

    // Récupérer toutes les meufs
    const { data: allGirls } = await supabaseAdmin
      .from('training_girls')
      .select('id, name, personality_type, difficulty_level, required_xp, badge_color, badge_text, bio')
      .order('difficulty_level', { ascending: true })

    const unlockedIds: string[] = prog.unlocked_girls ?? []
    const girlsWithState = (allGirls ?? []).map(g => ({
      ...g,
      locked: !unlockedIds.includes(g.id),
    }))

    const completedConvos = prog.total_completed_conversations ?? 0
    const totalDates = prog.total_dates_obtained ?? 0

    return NextResponse.json({
      currentLevel,
      levelName: levelInfo.name,
      totalXP,
      xpToNextLevel: xpToNext,
      progressPercent,
      girls: girlsWithState,
      stats: {
        totalConversations: prog.total_conversations ?? 0,
        totalCompletedConversations: completedConvos,
        totalDates,
        bestScore: prog.best_score ?? 0,
        averageRizz: Math.round(Number(prog.average_rizz) || 0),
        successRate: completedConvos > 0
          ? Math.round((totalDates / completedConvos) * 100)
          : 0,
      },
    })

  } catch (err: any) {
    console.error('[progression]', err)
    return NextResponse.json({ error: err.message ?? 'Erreur interne' }, { status: 500 })
  }
}
