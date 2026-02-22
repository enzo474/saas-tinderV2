import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface ProfileAnalysis {
  name: string | null
  age: string | null
  bio: string | null
  interests: string[]
  vibe: string
  photo_context: string
}

export interface GeneratedMessage {
  tone: string
  emoji: string
  content: string
}

const TONES_CONFIG: Record<string, { emoji: string; label: string }> = {
  Direct: { emoji: '🎯', label: 'Direct' },
  Drôle: { emoji: '😂', label: 'Drôle' },
  Mystérieux: { emoji: '🌙', label: 'Mystérieux' },
  Compliment: { emoji: '⚡', label: 'Compliment' },
}

const ALL_TONES = ['Direct', 'Drôle', 'Mystérieux', 'Compliment']

/**
 * Étape 1 : analyse le screenshot du profil avec Claude Vision
 */
export async function analyzeProfileWithVision(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' = 'image/jpeg'
): Promise<ProfileAnalysis> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: `Analyse ce screenshot de profil d'une app de dating (Tinder, Bumble, Hinge, Fruitz, etc.) et extrais les informations clés.

Retourne UNIQUEMENT un JSON valide avec cette structure exacte :
{
  "name": "prénom visible ou null",
  "age": "âge visible ou null",
  "bio": "texte de la bio visible ou null",
  "interests": ["centre d'intérêt 1", "centre d'intérêt 2"],
  "vibe": "impression générale en 3-5 mots (ex: sportif aventurier, créatif artiste, businessman ambitieux)",
  "photo_context": "description de ce qui est visible sur les photos (ex: profil d'un homme souriant en randonnée, photo de café)"
}

Si une info n'est pas visible, mets null ou un tableau vide. Retourne uniquement le JSON, rien d'autre.`,
          },
        ],
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    return JSON.parse(jsonMatch[0]) as ProfileAnalysis
  } catch {
    return {
      name: null,
      age: null,
      bio: null,
      interests: [],
      vibe: 'profil intéressant',
      photo_context: 'profil visible',
    }
  }
}

/**
 * Étape 2 : génère 4 messages personnalisés selon l'analyse du profil
 */
export async function generateMessages(
  profileAnalysis: ProfileAnalysis,
  messageType: 'accroche' | 'reponse',
  selectedTones: string[],
  contextMessage?: string
): Promise<GeneratedMessage[]> {
  const tonesRequest = selectedTones.length > 0 ? selectedTones : ALL_TONES

  const profileDesc = [
    profileAnalysis.name ? `Prénom : ${profileAnalysis.name}` : null,
    profileAnalysis.age ? `Âge : ${profileAnalysis.age}` : null,
    profileAnalysis.bio ? `Bio : "${profileAnalysis.bio}"` : null,
    profileAnalysis.interests.length > 0 ? `Centres d'intérêt : ${profileAnalysis.interests.join(', ')}` : null,
    `Vibe général : ${profileAnalysis.vibe}`,
    `Contexte photos : ${profileAnalysis.photo_context}`,
  ]
    .filter(Boolean)
    .join('\n')

  const systemPrompt = `Tu es Max, le meilleur coach en séduction digitale en France. Tu crées des messages d'accroche qui font VRAIMENT matcher. Tu connais par cœur ce qui fait qu'un message se démarque des "Salut" et "T'as passé une bonne journée ?".

RÈGLES ABSOLUES :
- Chaque message doit être unique et personnalisé au profil analysé
- Utilise des détails spécifiques de la bio ou des photos (jamais un message générique)
- Longueur : 1 à 3 phrases max (les messages courts marchent mieux)
- Pas de "Salut", pas de "Coucou", pas de "Bonjour"
- Pas d'emojis en excès (max 1 par message)
- Reste naturel et authentique, comme si tu écrivais toi-même

CONTEXTE DU MESSAGE :
Type : ${messageType === 'accroche' ? "Premier message d'ouverture (accroche)" : 'Réponse pour relancer ou continuer la conversation'}
${contextMessage ? `Message reçu (auquel répondre) : "${contextMessage}"` : ''}

FORMAT DE RÉPONSE :
Retourne UNIQUEMENT un JSON valide, tableau de ${tonesRequest.length} objet(s) :
[
${tonesRequest.map(tone => `  { "tone": "${tone}", "emoji": "${TONES_CONFIG[tone]?.emoji || '💬'}", "content": "..." }`).join(',\n')}
]

Rien d'autre que le JSON.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Profil à analyser :\n${profileDesc}\n\nGénère maintenant ${tonesRequest.length} message(s) personnalisé(s) : ${tonesRequest.join(', ')}.`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '[]'

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON array found')
    return JSON.parse(jsonMatch[0]) as GeneratedMessage[]
  } catch {
    return tonesRequest.map(tone => ({
      tone,
      emoji: TONES_CONFIG[tone]?.emoji || '💬',
      content: `Message personnalisé basé sur ton profil — réessaie si le résultat est vide.`,
    }))
  }
}
