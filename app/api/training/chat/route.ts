import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function calculateRizzDelta(userMsg: string, aiResponse: string, style: any): number {
  let delta = 0
  const msgLower = userMsg.toLowerCase()
  const aiLower = aiResponse.toLowerCase()

  // Red flags → pénalité
  const redFlagsFound = (style.red_flags as string[]).filter(f =>
    msgLower.includes(f.toLowerCase())
  )
  delta -= redFlagsFound.length * 5

  // Green flags → bonus
  const greenFlagsFound = (style.green_flags as string[]).filter(f =>
    msgLower.includes(f.toLowerCase())
  )
  delta += greenFlagsFound.length * 5

  // Longueur du message
  const wordCount = userMsg.trim().split(/\s+/).length
  if (wordCount < 3)  delta -= 3
  if (wordCount > 35) delta -= 2

  // Question posée = engagement
  if (userMsg.includes('?')) delta += 3

  // Messages monosyllabiques = désengagement
  if (['ok', 'ouais', 'oui', 'non', 'd\'accord', 'okay'].includes(msgLower.trim())) {
    delta -= 5
  }

  // Analyser la réponse IA
  const positivePatterns: string[] = style.response_patterns?.positive ?? []
  const negativePatterns: string[] = style.response_patterns?.negative ?? []

  if (positivePatterns.some(p => aiLower.includes(p.toLowerCase()))) delta += 3
  if (negativePatterns.some(p => aiLower.includes(p.toLowerCase()))) delta -= 3

  return Math.max(-10, Math.min(10, delta))
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { conversationId, userMessage } = await req.json()
    if (!conversationId || !userMessage?.trim()) {
      return NextResponse.json({ error: 'conversationId et userMessage requis' }, { status: 400 })
    }

    // Récupérer la conversation avec les infos de la meuf
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('training_conversations')
      .select('id, user_id, messages, current_rizz, is_completed, girl_id, training_girls(name, personality_type, bio, conversation_style)')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
    }
    if (conversation.is_completed) {
      return NextResponse.json({ error: 'Conversation déjà terminée' }, { status: 400 })
    }

    const girl = conversation.training_girls as any
    const style = girl.conversation_style
    const messages: any[] = conversation.messages ?? []

    // Construire le prompt système de la meuf
    const systemPrompt = `Tu es ${girl.name}, ${girl.personality_type}.

BIO : ${girl.bio}

PERSONNALITÉ (paramètres) :
- Amabilité : ${style.friendliness}/100
- Niveau de challenge : ${style.challenge_level}/100
- Longueur max réponse : ${style.avg_response_length} tokens

TES SUJETS FAVORIS : ${(style.topics as string[]).join(', ')}

CE QUI TE PLAÎT (green flags) : ${(style.green_flags as string[]).join(', ')}

CE QUI TE DÉPLAÎT (red flags) : ${(style.red_flags as string[]).join(', ')}

EXEMPLES DE RÉPONSES :
- Accueil : ${(style.response_patterns?.greeting as string[] ?? []).join(' / ')}
- Positif : ${(style.response_patterns?.positive as string[] ?? []).join(' / ')}
- Neutre : ${(style.response_patterns?.neutral as string[] ?? []).join(' / ')}
- Négatif : ${(style.response_patterns?.negative as string[] ?? []).join(' / ')}
- Flirt : ${(style.response_patterns?.flirty as string[] ?? []).join(' / ')}

INSTRUCTIONS ABSOLUES :
1. Réponds UNIQUEMENT comme ${girl.name} le ferait
2. Reste en FRANÇAIS, langage naturel de fille jeune
3. Maximum ${style.avg_response_length} tokens
4. Si red flag détecté dans le message → sois plus froide/distante
5. Si green flag détecté → sois plus engagée/chaleureuse
6. NE RÉVÈLE JAMAIS que tu es une IA
7. Sois ${girl.personality_type.toLowerCase()} — c'est ton identité
8. Pas d'explication, juste la réponse naturelle`

    // Construire l'historique pour Claude
    const claudeMessages = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.content,
    }))
    claudeMessages.push({ role: 'user', content: userMessage })

    // Appel Claude
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: Math.max(60, style.avg_response_length ?? 80),
      system: systemPrompt,
      messages: claudeMessages,
    })

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : ''

    // Calculer delta Rizz
    const rizzDelta = calculateRizzDelta(userMessage, aiResponse, style)
    const newRizz = Math.max(0, Math.min(100, (conversation.current_rizz ?? 50) + rizzDelta))

    // Sauvegarder les 2 nouveaux messages
    const updatedMessages = [
      ...messages,
      { role: 'user',      content: userMessage,  timestamp: new Date().toISOString() },
      { role: 'assistant', content: aiResponse,   timestamp: new Date().toISOString(), rizzDelta },
    ]

    await supabaseAdmin
      .from('training_conversations')
      .update({ messages: updatedMessages, current_rizz: newRizz })
      .eq('id', conversationId)

    return NextResponse.json({
      aiResponse,
      rizzDelta,
      currentRizz: newRizz,
      messageCount: updatedMessages.length,
    })

  } catch (err: any) {
    console.error('[training/chat]', err)
    return NextResponse.json({ error: err.message ?? 'Erreur interne' }, { status: 500 })
  }
}
