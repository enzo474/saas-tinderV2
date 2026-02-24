import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { girlIndex } = await req.json()
    if (!girlIndex || typeof girlIndex !== 'number') {
      return NextResponse.json({ error: 'girlIndex requis (1, 2 ou 3)' }, { status: 400 })
    }

    // Résoudre l'index → UUID via difficulty_level
    const { data: girl, error: girlError } = await supabaseAdmin
      .from('training_girls')
      .select('id, name, personality_type, difficulty_level, badge_color, badge_text, bio, conversation_style')
      .eq('difficulty_level', girlIndex)
      .single()

    if (girlError || !girl) {
      return NextResponse.json({ error: 'Meuf introuvable' }, { status: 404 })
    }

    // Récupérer ou auto-créer la progression
    let { data: progression } = await supabaseAdmin
      .from('user_progression')
      .select('unlocked_girls, total_xp')
      .eq('user_id', user.id)
      .single()

    if (!progression) {
      // Créer progression avec Léa débloquée
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
        .select('unlocked_girls, total_xp')
        .single()
      progression = newProg
    }

    // Vérifier que la meuf est débloquée
    const unlockedGirls: string[] = progression?.unlocked_girls ?? []
    if (!unlockedGirls.includes(girl.id)) {
      return NextResponse.json(
        { error: 'Cette meuf n\'est pas encore débloquée', requiredXP: girl.difficulty_level === 2 ? 100 : 300 },
        { status: 403 }
      )
    }

    // Chercher une conversation active existante (non terminée)
    const { data: existingConv } = await supabaseAdmin
      .from('training_conversations')
      .select('id, messages, current_rizz')
      .eq('user_id', user.id)
      .eq('girl_id', girl.id)
      .eq('is_completed', false)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingConv) {
      return NextResponse.json({
        conversationId: existingConv.id,
        girlInfo: girl,
        isResumed: true,
        currentRizz: existingConv.current_rizz,
        messages: existingConv.messages,
      })
    }

    // Créer nouvelle conversation
    const { data: newConv, error: convError } = await supabaseAdmin
      .from('training_conversations')
      .insert({
        user_id: user.id,
        girl_id: girl.id,
        current_rizz: 50,
        messages: [],
      })
      .select('id')
      .single()

    if (convError || !newConv) {
      console.error('[training/start] insert error:', convError)
      return NextResponse.json({ error: 'Erreur création conversation' }, { status: 500 })
    }

    // Incrémenter total_conversations
    await supabaseAdmin
      .from('user_progression')
      .update({ total_conversations: (progression?.total_xp ?? 0) })
      .eq('user_id', user.id)

    return NextResponse.json({
      conversationId: newConv.id,
      girlInfo: girl,
      isResumed: false,
      currentRizz: 50,
      messages: [],
    })

  } catch (err: any) {
    console.error('[training/start]', err)
    return NextResponse.json({ error: err.message ?? 'Erreur interne' }, { status: 500 })
  }
}
