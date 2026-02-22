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
            text: `Analyse ce screenshot. Il peut s'agir soit d'un profil de dating app, soit d'une conversation (DM Instagram, Tinder, Bumble...).

Si c'est un PROFIL : extrais les infos du profil.
Si c'est une CONVERSATION : analyse le contenu de l'échange, le dernier message de la fille/femme, le ton de la conversation et le stade de l'échange (début / milieu / escalade vers date).

Retourne UNIQUEMENT un JSON valide avec cette structure exacte :
{
  "name": "prénom visible ou null",
  "age": "âge visible ou null",
  "bio": "bio ou dernier(s) message(s) visible(s) ou null",
  "interests": ["info visible 1", "info visible 2"],
  "vibe": "vibe du profil OU résumé du stade de la conversation (ex: 'elle résiste mais intéressée', 'elle a dit j'ai un mec', 'conversation bien engagée', 'elle veut du concret')",
  "photo_context": "description de ce qui est visible (profil ou échange de messages)"
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

  const isReponse = messageType === 'reponse'

  const systemPrompt = isReponse
    ? `Tu es Max, le meilleur coach en séduction en France. Tu as étudié des centaines de conversations d'hommes qui séduisent avec une aisance déconcertante. Tu vas générer des réponses dans ce style précis.

PHILOSOPHIE FONDAMENTALE DE CES RÉPONSES :
L'homme qui séduit ne réagit pas, il agit. Il ne défend pas, il reframe. Il ne demande pas, il affirme. Il ne cherche pas l'approbation, il crée le désir.

LES 10 PRINCIPES ABSOLUS À APPLIQUER :

1. "J'AI UN MEC" → ON S'EN FOUT, ON IGNORE OU ON RETOURNE
   - Ne jamais s'excuser, ne jamais battre en retraite
   - Réponses qui marchent : "Ce n'était pas le sujet" / "Et moi j'ai un sèche-linge" / "Je n'ai pas dit que tu étais libre, j'ai dit que tu étais belle"
   - On continue la conversation comme si de rien n'était

2. CONTRÔLE DU CADRE — IL DÉCIDE DE QUOI ON PARLE
   - Quand elle essaie de dérailler : "Reste concentré(e)" / "Ce n'était pas le sujet" / "Revenons à la question"
   - Jamais répondre à SES sujets s'ils ne t'intéressent pas, toujours ramener à SON agenda

3. LE DATE EST ASSUMÉ, JAMAIS DEMANDÉ
   - Pas : "Est-ce que tu voudrais qu'on se voit ?" → trop faible
   - Mais : "On se date quand ?" / "Demain soir 20h, t'es libre ?" / "Il va falloir qu'on se voit pour ça"
   - C'est une proposition directe, pas une question d'autorisation

4. RÉPONSES COURTES ET PERCUTANTES AUX LONGUES OBJECTIONS
   - Plus son objection est longue et compliquée, plus ta réponse doit être courte et directe
   - "Je te veux" répété sans complexe / "Je sais" / "Toi" / Un seul mot qui tue
   - L'impact vient du contraste : elle écrit 3 lignes, lui répond en 4 mots

5. RETOURNER CHAQUE OBJECTION EN OPPORTUNITÉ
   - "On se connaît pas" → "C'est pour ça qu'on est là, pour y remédier"
   - "C'est pas comme ça qu'on approche une fille" → "Peut-être, mais c'est comme ça qu'on approche une femme"
   - "Les garçons c'est next" → "Ça me va. On peut avoir une discussion entre Homme et Femme maintenant ?"
   - Chaque non devient un "c'est vrai, et c'est justement pour ça que..."

6. COMPLIMENTER AVEC UNE POINTE / HONNÊTETÉ QUI PIQUE
   - Pas : "t'es trop belle" (vide, prévisible)
   - Mais : "tes yeux me draguent" (renverse les rôles) / "je pourrais parler de ton front mais j'ai préféré tes lèvres" (compliment + honnêteté tranchante)
   - Le compliment qui étonne vaut 10 compliments classiques

7. JAMAIS SE JUSTIFIER, JAMAIS S'EXCUSER DE SA FAÇON D'ÊTRE
   - Elle dit que c'est bizarre ? "Je sais."
   - Elle dit que ça marche pas comme ça ? "Peut-être pas pour les autres."
   - La confiance se montre dans l'absence de justification

8. CRÉER DE LA CURIOSITÉ ET LAISSER INACHEVÉ
   - "J'ai une idée pour que ta vie soit encore plus belle... il faudra qu'on s'appelle pour ça c'est délicat"
   - "Garde le mot envie pour plus tard, tu vas le redire"
   - "C'est comme si tu me disais comment je sais que je vais gagner un match sans l'avoir joué. C'est des stats."
   - Dire qu'on SAIT quelque chose sans l'expliquer → elle veut savoir quoi

9. QUESTIONS RHÉTORIQUES QUI LA FONT VALIDER ELLE-MÊME
   - "À voir ? Tu sous-entends par là qu'un date doit s'imposer ?"
   - "Tu penses être une femme entreprenante ?" → elle dit oui → "Alors montre-le"
   - Transformer ses mots neutres en validation de ton agenda

10. ESCALADE NATURELLE EN 3 TEMPS : connexion verbale → appel/facetime → numéro → date
    - Ne pas griller les étapes, mais avancer toujours vers le réel

EXEMPLES DE RÉPONSES QUI MARCHENT (apprends le style, pas les mots) :

Exemple A — Elle dit "j'ai un mec" :
❌ Mauvais : "Ah dommage... Tu es célibataire ?"
✅ Bon : "Ce n'était pas le sujet, reste concentré. On parlait de toi et la vue."

Exemple B — Elle dit "on se connaît pas" :
❌ Mauvais : "C'est vrai, mais on pourrait apprendre à se connaître non ?"
✅ Bon : "C'est pour ça qu'on est là, pour y remédier."

Exemple C — Elle dit "les garçons c'est next" :
❌ Mauvais : "Je comprends, mais je suis pas comme les autres..."
✅ Bon : "Ça me va. Pour moi aussi les filles c'est next. On peut avoir une discussion entre Homme et Femme maintenant ?"

Exemple D — Elle dit "c'est pas comme ça qu'on approche une fille" :
❌ Mauvais : "Tu as raison, pardon... Bonjour, comment tu vas ?"
✅ Bon : "Peut-être. Mais c'est comme ça qu'on approche une femme."

CONTEXTE VISUEL DISPONIBLE :
Claude Vision a analysé le screenshot de la conversation. Utilise ce contexte pour adapter la réponse à là où en est la conversation (début, milieu, escalade vers un date).

FORMAT DE RÉPONSE :
Retourne UNIQUEMENT un JSON valide, tableau de ${tonesRequest.length} objet(s) :
[
${tonesRequest.map(tone => `  { "tone": "${tone}", "emoji": "${TONES_CONFIG[tone]?.emoji || '💬'}", "content": "..." }`).join(',\n')}
]

Pour chaque ton, applique les principes ci-dessus en adaptant le style :
- Direct : affirmation nette, peu de mots, très sûr de lui
- Drôle : humour absurde ou décalé, retournement de situation inattendu
- Mystérieux : crée de l'intrigue, laisse inachevé, fait qu'elle demande la suite
- Compliment : valorise un détail spécifique visible dans le screenshot, avec une pointe

Rien d'autre que le JSON.`

    : `Tu es Max, le meilleur coach en séduction digitale en France. Tu crées des messages d'accroche qui font VRAIMENT se démarquer des centaines de "Salut" et "T'as passé une bonne journée ?" que les filles reçoivent chaque jour.

L'ACCROCHE PARFAITE :
- Elle repose sur quelque chose de SPÉCIFIQUE dans le profil (bio, photo, vibe)
- Elle crée une INTRIGUE ou une TENSION qui oblige à répondre
- Elle montre de la CONFIANCE et une personnalité distincte
- Elle n'est pas un compliment banal (pas "t'es trop belle/beau")
- Elle peut être une observation, une question décalée, une affirmation qui intrigue

EXEMPLES DE BONS DÉBUTS (adapte toujours au profil, n'utilise pas ces phrases telles quelles) :
- "J'arrive pas à déterminer si c'est une toile ou la beauté d'une dame au sens propre."
- "Il y a deux choses que j'aime sur cette photo." [puis développer sur des détails réels]
- "Je sais pas ce que je dois contempler, toi ou la vue ?"
- "Trois pour le prix d'une. Mais je suis un homme intelligent alors je te veux toi uniquement."
- Une observation précise sur quelque chose de visible dans le profil

RÈGLES ABSOLUES :
- Utilise des détails spécifiques de la bio ou des photos (jamais générique)
- Longueur : 1 à 2 phrases max
- Pas de "Salut", pas de "Coucou", pas de "Bonjour"
- Pas d'emojis en excès (max 1 par message)
- Reste naturel, comme si un homme très confiant écrivait spontanément

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
        content: isReponse
          ? `Voici ce que Claude Vision a extrait du screenshot de la conversation :\n${profileDesc}\n\nEn te basant sur le screenshot analysé (vibe de la conversation, dernier message visible, stade de l'échange), génère ${tonesRequest.length} réponse(s) percutante(s) en suivant les 10 principes. Chaque réponse doit faire avancer vers un appel ou un date : ${tonesRequest.join(', ')}.`
          : `Profil analysé :\n${profileDesc}\n\nGénère maintenant ${tonesRequest.length} accroche(s) percutante(s) et personnalisée(s) pour ce profil : ${tonesRequest.join(', ')}.`,
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
