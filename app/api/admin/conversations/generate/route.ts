import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { isUserAdmin } from '@/lib/credits-server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MESSAGE_COUNTS: Record<string, string> = {
  short: '5 à 7',
  medium: '8 à 12',
  long: '12 à 20',
}

const STYLE_INSTRUCTIONS: Record<string, string> = {
  trash: 'TRASH / PROVOCANT : Accroche frontale, provocante, avec une pointe d\'audace assumée. Pas vulgaire mais clairement osé. Le mec est sûr de lui à l\'extrême.',
  drole: 'DRÔLE / ABSURDE : Humour décalé, répliques inattendues, situations absurdes. Fait sourire en lisant. Le mec utilise l\'humour comme arme de séduction.',
  direct: 'DIRECT / OSÉ : Droit au but, honnête sur ses intentions, sans détour. Efficace et court. Chaque message va à l\'essentiel.',
  mysterieux: 'MYSTÉRIEUX / INTRIGUANT : Messages qui laissent des questions en suspens. La fille doit se demander qui il est. Crée de l\'intrigue et de la tension.',
  flirt: 'FLIRT HEAVY : Flirt intense et constant, sous-entendus permanents, jeu de séduction élaboré. Chaque message est une invitation voilée.',
}

function buildSystemPrompt(style: string, length: string): string {
  const styleInstruction = STYLE_INSTRUCTIONS[style] || STYLE_INSTRUCTIONS.trash
  const messageCount = MESSAGE_COUNTS[length] || '8 à 12'

  return `Tu es un expert en création de conversations virales pour TikTok et Instagram.

Tu génères des FAUSSES conversations entre un homme (lui) et une femme (elle) destinées à du contenu viral.

STYLE DEMANDÉ : ${styleInstruction}

LONGUEUR : ${messageCount} messages au total (alternés lui/elle)

RÈGLES ABSOLUES :
1. Le PREMIER message de "lui" est une RÉPONSE À SA STORY — il commente directement ce qu'il voit sur la photo (vêtement, lieu, activité, expression, contexte). C'est le point de départ de la conv.
2. JAMAIS de "Salut ça va" générique — l'accroche doit être immédiatement différente et percutante
3. Les réponses de "elle" doivent être variées : parfois intriguée, parfois sur la défensive, parfois qui joue le jeu
4. Langage jeune français authentique (abréviations ok)
5. La conversation doit avoir une progression : tension → intérêt → pique → rebondissement
6. Plus trash/osé que les vraies accroches utilisateur — c'est pour du CONTENU VIRAL
7. Chaque message doit être crédible comme une vraie conversation
8. OBLIGATOIRE — La conversation doit TOUJOURS se terminer par une victoire : soit "elle" donne son numéro de téléphone (ex: "okay c'est le 06XX..." ou "tiens 06..."), soit elle propose/accepte un rendez-vous (ex: "ok on se voit quand ?", "mercredi t'es dispo ?"). Le dernier échange doit clairement montrer cette victoire.
9. EMOJIS : "lui" utilise ZÉRO emoji ou au maximum 1 seul par message uniquement si vraiment nécessaire. "elle" peut en utiliser librement. Les messages de "lui" doivent paraître sûrs d'eux et naturels, pas comme un fanboy.

FORMAT DE SORTIE — JSON UNIQUEMENT, rien d'autre :
{
  "conversation": [
    { "sender": "lui", "message": "...", "timestamp": "HH:MM" },
    { "sender": "elle", "message": "...", "timestamp": "HH:MM" }
  ],
  "hook_explanation": "Explication courte de pourquoi cette accroche fonctionne et pourrait devenir virale"
}

Les timestamps doivent être réalistes (décalage de 1-5 minutes entre chaque message).
Commence à une heure plausible comme 21:34 ou 14:08.`
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const admin = await isUserAdmin(user.id)
    if (!admin) return NextResponse.json({ error: 'Accès refusé — Admin uniquement' }, { status: 403 })

    const { imageBase64, mediaType, context, style, length } = await req.json()

    if (!imageBase64 || !style || !length) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const userMessage = context
      ? `Contexte fourni par l'admin : ${context}\n\nGénère la conversation.`
      : 'Analyse cette photo et génère une conversation virale basée dessus.'

    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: buildSystemPrompt(style, length),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: (mediaType || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64,
              },
            },
            { type: 'text', text: userMessage },
          ],
        },
      ],
    })

    const rawText = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : ''

    // Extraire le JSON même s'il est entouré de markdown ```json```
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Réponse Claude invalide', raw: rawText }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Upload de l'image de profil dans Supabase Storage
    let profileImageUrl: string | null = null
    try {
      const imageBuffer = Buffer.from(imageBase64, 'base64')
      const fileName = `admin/conversations/${Date.now()}.jpg`
      const { data: uploadData } = await supabaseAdmin.storage
        .from('uploads')
        .upload(fileName, imageBuffer, { contentType: mediaType || 'image/jpeg', upsert: true })

      if (uploadData) {
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('uploads')
          .getPublicUrl(fileName)
        profileImageUrl = publicUrl
      }
    } catch {
      // Upload optionnel — on continue sans
    }

    // Sauvegarder en DB
    const { data: saved, error: dbError } = await supabaseAdmin
      .from('admin_generated_conversations')
      .insert({
        profile_image_url: profileImageUrl,
        context: context || null,
        style,
        length,
        conversation: parsed.conversation,
        hook_explanation: parsed.hook_explanation || null,
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('[Admin Conversations] DB error:', dbError)
    }

    return NextResponse.json({
      id: saved?.id,
      conversation: parsed.conversation,
      hook_explanation: parsed.hook_explanation,
      profile_image_url: profileImageUrl,
    })
  } catch (error: any) {
    console.error('[Admin Conversations] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
