import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { analyzeProfileWithVision, generateMessages } from '@/lib/claude/generate-accroche'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_message, storyImageBase64, user_answer, tone, session_id } = body as {
      user_message: string
      storyImageBase64?: string
      user_answer: 'oui' | 'non'
      tone?: string               // 'Direct' | 'Drôle' | 'Mystérieux' | 'Compliment'
      session_id?: string
    }

    if (!user_message) {
      return NextResponse.json({ error: 'user_message requis' }, { status: 400 })
    }

    // ─── 1. Analyser le profil si une image est fournie ──────────────────────
    let profileAnalysis = null
    if (storyImageBase64) {
      try {
        profileAnalysis = await analyzeProfileWithVision(storyImageBase64, 'image/jpeg')
      } catch {
        // Si l'analyse échoue, on continue sans image
      }
    }

    // Profil par défaut si pas d'image
    if (!profileAnalysis) {
      profileAnalysis = {
        name: null,
        age: null,
        bio: null,
        interests: [],
        vibe: 'profil Instagram, story partagée',
        photo_context: 'story Instagram, personne attrayante',
      }
    }

    // ─── 2. Générer l'accroche optimisée via l'agent avec le ton choisi ─────
    // Si un ton est fourni, l'utiliser ; sinon utiliser CrushMaxxing par défaut
    const validTones = ['Direct', 'Drôle', 'Mystérieux', 'Compliment', 'CrushMaxxing']
    const selectedTone = tone && validTones.includes(tone) ? tone : 'CrushMaxxing'

    const [generatedMessages, evaluation] = await Promise.all([
      generateMessages(profileAnalysis, 'accroche', [selectedTone]),

      // Évaluer le message de l'user + générer les raisons
      anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: `Tu es un expert en séduction et en analyse de messages. Tu vas évaluer l'accroche d'un homme et expliquer pourquoi elle fonctionne ou non, de façon directe, cash, et sans filtre.`,
        messages: [
          {
            role: 'user',
            content: `Un homme a envoyé cette accroche à une fille sur Instagram :
"${user_message}"

L'homme pensait qu'elle allait ${user_answer === 'oui' ? 'répondre' : 'ignorer'}.

Donne 3 raisons pourquoi cette accroche ne va probablement PAS provoquer de réponse (sois cash, direct, 5-8 mots max par raison).

Réponds UNIQUEMENT en JSON :
{
  "raisons_echec": ["raison 1", "raison 2", "raison 3"]
}`,
          },
        ],
      }),
    ])

    // ─── 3. Extraire l'accroche optimisée ────────────────────────────────────
    const bestMessage = generatedMessages.find(m => m.tone === selectedTone) || generatedMessages[0]
    const accrocheOptimisee = bestMessage?.content || 'Tu ronfles ?'

    // ─── 4. Parser les raisons d'échec ────────────────────────────────────────
    let raisonsEchec = ['Trop générique, pas d\'impact', 'Aucune tension ni surprise', 'Elle peut ignorer sans effort']
    try {
      const evalText = evaluation.content[0].type === 'text' ? evaluation.content[0].text : ''
      const jsonMatch = evalText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (Array.isArray(parsed.raisons_echec)) raisonsEchec = parsed.raisons_echec
      }
    } catch { /* fallback */ }

    // ─── 5. Générer les raisons de succès pour l'accroche optimisée ──────────
    let raisonsSucces = ['Présuppose une intimité', 'Elle doit répondre pour corriger', 'Court, percutant, inattendu']
    try {
      const successEval = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: 'Tu es un expert en séduction. Explique en 3 raisons courtes (5-8 mots max) pourquoi une accroche fonctionne. Réponds uniquement en JSON.',
        messages: [
          {
            role: 'user',
            content: `Accroche : "${accrocheOptimisee}"\n\nPourquoi ça va marcher ?\n\n{"raisons_succes": ["raison 1", "raison 2", "raison 3"]}`,
          },
        ],
      })
      const successText = successEval.content[0].type === 'text' ? successEval.content[0].text : ''
      const jsonMatch = successText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (Array.isArray(parsed.raisons_succes)) raisonsSucces = parsed.raisons_succes
      }
    } catch { /* fallback */ }

    // ─── 6. Tracker dans rizz_sessions si pas de session_id ─────────────────
    let newSessionId = session_id
    if (!session_id) {
      try {
        const supabase = createServiceRoleClient()
        const headersList = await headers()
        const ip =
          headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          headersList.get('x-real-ip') ||
          'unknown'
        const flowType = headersList.get('x-flow-type') || 'unknown'

        const { data } = await supabase
          .from('rizz_sessions')
          .insert({
            ip_address: ip,
            flow_type: flowType,
            user_message,
            user_answer,
          })
          .select('id')
          .single()

        newSessionId = data?.id
      } catch { /* non-bloquant */ }
    }

    return NextResponse.json({
      verdict: 'ne_marche_pas',
      raisons_echec: raisonsEchec,
      accroche_optimisee: accrocheOptimisee,
      raisons_succes: raisonsSucces,
      session_id: newSessionId,
    })
  } catch (error) {
    console.error('[analyze-rizz] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse' },
      { status: 500 }
    )
  }
}
