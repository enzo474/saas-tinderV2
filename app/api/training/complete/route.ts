import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { calculateXPEarned, calculateStarRating } from '@/lib/gamification/xp-calculator'
import { calculateLevel, getLevelProgressPercent } from '@/lib/gamification/level-system'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { conversationId } = await req.json()
    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId requis' }, { status: 400 })
    }

    // Récupérer la conversation
    const { data: conversation } = await supabaseAdmin
      .from('training_conversations')
      .select('id, user_id, current_rizz, messages, is_completed, training_girls(difficulty_level, name)')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
    }
    if (conversation.is_completed) {
      return NextResponse.json({ error: 'Conversation déjà terminée' }, { status: 400 })
    }

    const girl = conversation.training_girls as any
    const finalRizz = conversation.current_rizz ?? 50
    const dateObtained = finalRizz >= 70
    const messageCount = (conversation.messages as any[])?.length ?? 0

    const xpEarned = calculateXPEarned({
      finalRizz,
      dateObtained,
      difficultyLevel: girl.difficulty_level,
      messageCount,
    })
    const stars = calculateStarRating(finalRizz, dateObtained)

    // Marquer la conversation comme terminée
    await supabaseAdmin
      .from('training_conversations')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        final_rizz_percentage: finalRizz,
        final_score: stars,
        xp_earned: xpEarned,
        date_obtained: dateObtained,
      })
      .eq('id', conversationId)

    // Récupérer progression actuelle (créer si absente)
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

    const oldLevel = prog.current_level ?? 0
    const newTotalXP = (prog.total_xp ?? 0) + xpEarned
    const newLevel = calculateLevel(newTotalXP)
    const leveledUp = newLevel > oldLevel

    const newCompleted = (prog.total_completed_conversations ?? 0) + 1
    const oldAvg = Number(prog.average_rizz) || 0
    const newAvg = ((oldAvg * (prog.total_completed_conversations ?? 0)) + finalRizz) / newCompleted

    // Débloquer nouvelles meufs si XP suffisant
    const currentUnlocked: string[] = prog.unlocked_girls ?? []
    const { data: girlsToUnlock } = await supabaseAdmin
      .from('training_girls')
      .select('id, name, personality_type, badge_color, badge_text')
      .lte('required_xp', newTotalXP)

    const newUnlocked = girlsToUnlock
      ? girlsToUnlock.filter(g => !currentUnlocked.includes(g.id))
      : []
    const allUnlocked = [
      ...currentUnlocked,
      ...newUnlocked.map(g => g.id),
    ]

    // Mettre à jour la progression
    await supabaseAdmin
      .from('user_progression')
      .update({
        total_xp: newTotalXP,
        current_level: newLevel,
        total_completed_conversations: newCompleted,
        total_conversations: Math.max(prog.total_conversations ?? 0, newCompleted),
        total_dates_obtained: (prog.total_dates_obtained ?? 0) + (dateObtained ? 1 : 0),
        best_score: Math.max(prog.best_score ?? 0, stars),
        average_rizz: Number(newAvg.toFixed(2)),
        unlocked_girls: allUnlocked,
      })
      .eq('user_id', user.id)

    // Enregistrer XP history
    await supabaseAdmin
      .from('xp_history')
      .insert({
        user_id: user.id,
        amount: xpEarned,
        source: 'training_conversation',
        conversation_id: conversationId,
      })

    return NextResponse.json({
      stars,
      xpEarned,
      dateObtained,
      finalRizz,
      newTotalXP,
      newLevel,
      levelProgressPercent: getLevelProgressPercent(newTotalXP, newLevel),
      levelUp: leveledUp ? {
        oldLevel,
        newLevel,
        newGirlsUnlocked: newUnlocked.map(g => ({
          id: g.id,
          name: g.name,
          personalityType: g.personality_type,
          badgeColor: g.badge_color,
          badgeText: g.badge_text,
        })),
      } : null,
    })

  } catch (err: any) {
    console.error('[training/complete]', err)
    return NextResponse.json({ error: err.message ?? 'Erreur interne' }, { status: 500 })
  }
}
