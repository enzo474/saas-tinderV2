import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_message, screenshot_url, user_answer, session_id } = body as {
      user_message: string
      screenshot_url?: string
      user_answer: 'oui' | 'non'
      session_id?: string
    }

    if (!user_message) {
      return NextResponse.json({ error: 'user_message requis' }, { status: 400 })
    }

    const systemPrompt = `Tu es CrushMaxxing, l'expert numéro 1 de la drague par message en France.

Tu maîtrises parfaitement les techniques d'accroche qui font répondre les filles :

TECHNIQUES VALIDÉES PAR DES CONVERSATIONS RÉELLES :

1. PRÉSUPPOSITIONNELLE : Suppose une intimité future déjà décidée
   Exemples : "Tu ronfles ?" / "Tu dors de quel côté ?" / "T'as une place pour moi sur ton canapé ?"
   → La fille répond parce qu'elle doit corriger/confirmer

2. TRASH/DIRECTE sur ce qui est visible ou quotidien
   Exemples : "T'as mis un boxer ou un string sous ta robe ?" / "T'abuses" / "Je suis pas branché trio"
   → Choc positif, elle répond par curiosité ou pour défendre

3. AFFIRMATION DIRECTE qui crée une émotion
   Exemples : "Tu m'hypnotises" / "T'as l'air d'être le problème que je cherche" / "Être aussi belle est un crime"
   → Court, percutant, elle ressent quelque chose

4. PUSH-PULL : Compliment + retrait immédiat
   → Crée de la tension et du désir

RÈGLES ABSOLUES :
- 1 phrase, 2 max. JAMAIS plus.
- Pas de "je voulais te dire que..." ni de formules de politesse
- Pas de référence aux vêtements de couleur précise
- Pas de "Ce [détail] me dit que..." (formulaique)
- Le mot "smooth" est BANNI
- Cash, direct, sans s'excuser

Ta mission : analyser l'accroche de l'user, expliquer pourquoi elle ne marche pas (ou pourrait mieux marcher), et générer une accroche INFINIMENT meilleure.`

    const userPrompt = `Analyse cette accroche envoyée à une fille${screenshot_url ? ' (réponse à sa story)' : ''} :

ACCROCHE DE L'USER : "${user_message}"
L'USER PENSAIT QUE : elle allait ${user_answer === 'oui' ? 'répondre' : 'ignorer'}

Génère une analyse structurée et une meilleure accroche.

Réponds UNIQUEMENT en JSON valide avec ce format exact :
{
  "verdict": "ne_marche_pas",
  "raisons_echec": [
    "Raison courte et percutante 1",
    "Raison courte et percutante 2", 
    "Raison courte et percutante 3"
  ],
  "accroche_optimisee": "L'accroche parfaite en 1-2 phrases max",
  "raisons_succes": [
    "Pourquoi ça marche 1",
    "Pourquoi ça marche 2",
    "Pourquoi ça marche 3"
  ]
}

Les raisons doivent être directes, sans bullshit, 5-10 mots chacune.
L'accroche optimisée doit utiliser une des techniques validées ci-dessus.`

    const messageContent: Anthropic.MessageParam['content'] = screenshot_url
      ? [
          {
            type: 'image',
            source: { type: 'url', url: screenshot_url },
          },
          { type: 'text', text: userPrompt },
        ]
      : userPrompt

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: 'user', content: messageContent }],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse JSON robuste
    let analysis: {
      verdict: string
      raisons_echec: string[]
      accroche_optimisee: string
      raisons_succes: string[]
    }

    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found')
      analysis = JSON.parse(jsonMatch[0])
    } catch {
      // Fallback en cas d'échec du parsing
      analysis = {
        verdict: 'ne_marche_pas',
        raisons_echec: [
          'Trop générique, elle a vu ça 100 fois',
          'Aucune tension ni surprise',
          'Elle peut ignorer sans effort',
        ],
        accroche_optimisee: 'Tu ronfles ?',
        raisons_succes: [
          'Présuppose une intimité future',
          'Elle doit répondre pour corriger',
          'Court, percutant, inattendu',
        ],
      }
    }

    // Tracker l'événement si session_id fourni
    if (session_id) {
      try {
        const supabase = createServiceRoleClient()
        await supabase
          .from('rizz_sessions')
          .update({ saw_blurred_result: true })
          .eq('id', session_id)
      } catch { /* non-bloquant */ }
    }

    // Tracker la création de session sinon
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

        return NextResponse.json({ ...analysis, session_id: data?.id })
      } catch { /* non-bloquant */ }
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('[analyze-rizz] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse' },
      { status: 500 }
    )
  }
}
