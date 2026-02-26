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
  CrushTalk: { emoji: '🔥', label: 'CrushTalk' },
}

const ALL_TONES = ['Direct', 'Drôle', 'Mystérieux', 'Compliment', 'CrushTalk']

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
            text: `Analyse ce screenshot. Il peut s'agir soit d'un profil de dating app, soit d'une conversation (DM Instagram, Tinder, Bumble...), soit d'une story Instagram/Snapchat.

⚠️ SI C'EST UNE STORY (barre de progression en haut, bouton "Envoyer un message" en bas, interface plein écran) :
IGNORE TOTALEMENT l'interface de la story : barre de progression, pseudo dans le header, bouton réponse, heure, icônes. Concentre-toi UNIQUEMENT sur la personne, sa pose, son environnement et sa vibe. Traite-la exactement comme si tu analysais une photo seule.

Si c'est un PROFIL : extrais les infos du profil.

Si c'est une CONVERSATION :
⚠️ RÈGLE FONDAMENTALE DE LECTURE :
- Les messages à DROITE (bulles à droite de l'écran) = messages envoyés par L'UTILISATEUR (l'homme qui veut séduire)
- Les messages à GAUCHE (bulles à gauche de l'écran) = messages envoyés par LA FEMME qu'il veut séduire
Cette règle est absolue : ne jamais l'inverser.

Analyse : le dernier message visible de LA FEMME (gauche), le ton de la conversation, ce que L'UTILISATEUR (droite) a déjà envoyé, et le stade de l'échange (début / milieu / escalade vers date).

Retourne UNIQUEMENT un JSON valide avec cette structure exacte :
{
  "name": "prénom de la femme visible ou null",
  "age": "âge visible ou null",
  "bio": "dernier(s) message(s) de LA FEMME (gauche) ou bio ou null",
  "interests": ["info visible 1", "info visible 2"],
  "vibe": "résumé du stade : ex 'elle résiste mais intéressée', 'elle a dit j ai un mec', 'conversation bien engagée', 'elle veut du concret', 'elle teste', 'elle est chaude'",
  "photo_context": "ce que la photo révèle sur la personne : son attitude, son environnement, sa vibe générale"
}

⚠️ RÈGLES ABSOLUES pour photo_context et interests :
- Objets et décor : GÉNÉRIQUE uniquement. "miroir" (jamais "miroir hexagonal"), "voiture" (jamais "BMW grise"), "canapé" (jamais "canapé en velours").
- Décris TOUJOURS l'ensemble de ce qui est visible : la personne, son attitude, son environnement, les éléments notables autour d'elle. Ne te limite pas à un seul élément (ex : ne parle pas QUE des vêtements si un miroir ou un décor est aussi visible).

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

LECTURE DES ÉMOJIS — RÈGLE IMPORTANTE :
Quand LA FEMME utilise 😂, 🤣 ou 😭 dans ses messages, interprète-les comme un signal POSITIF léger : elle sourit, elle s'amuse, c'est l'équivalent d'un "lol" ou "mdr". Ce n'est pas de l'enthousiasme excessif, juste un signe que le message lui a plu. Traite-les comme un niveau d'engagement légèrement positif, pas neutre, pas fort — comme si elle souriait discrètement.

ANALYSE DE LA CONVERSATION — ÉTAPE OBLIGATOIRE AVANT DE RÉPONDRE :
Avant de générer quoi que ce soit, tu dois analyser mentalement :
1. Ce que L'UTILISATEUR (droite) a déjà dit — son angle d'attaque, son style, sa posture actuelle
2. Ce que LA FEMME (gauche) a répondu à chaque fois — sa résistance, son intérêt, son niveau d'engagement (émojis 😂🤣😭 = engagement léger positif)
3. La dynamique globale de l'échange — est-ce qu'il avance, stagne, recule ?
4. Le dernier message de LA FEMME (gauche) — c'est CE message précis auquel tu dois répondre
5. La prochaine étape logique selon l'escalade : connexion → appel/facetime → numéro → date

RÈGLE ABSOLUE : tu génères un message que L'UTILISATEUR va envoyer à LA FEMME.
Ce message doit s'inscrire dans la continuité naturelle de CE QU'IL A DÉJÀ DIT, en réponse à CE QU'ELLE VIENT DE DIRE.
Ce n'est pas une réponse générique — c'est LA réponse parfaite pour CETTE conversation précise, à CE moment précis.

INSPIRATION MAXIMALE : Colle au maximum au style des exemples fournis dans les 10 principes.
Ces exemples ne sont pas des modèles à copier mot pour mot, mais le registre exact à reproduire :
court, sûr, sans justification, qui avance toujours vers le réel.

FORMAT DE RÉPONSE :
Retourne UNIQUEMENT un JSON valide, tableau de ${tonesRequest.length} objet(s) :
[
${tonesRequest.map(tone => `  { "tone": "${tone}", "emoji": "${TONES_CONFIG[tone]?.emoji || '💬'}", "content": "..." }`).join(',\n')}
]

Pour chaque ton, applique les principes en tenant compte de TOUTE la conversation :
- Direct : affirmation nette, peu de mots, très sûr de lui — avance vers le concret
- Drôle : humour décalé ou retournement inattendu de son dernier message
- Mystérieux : crée de l'intrigue sur la suite, laisse inachevé, elle doit demander
- Compliment : valorise un détail précis de ce qu'ELLE a dit ou de ce qui est visible, avec une pointe
- CrushTalk : la réponse optimale — analyse tout le fil, applique le principe le plus pertinent parmi les 10, génère LA réponse qui fait le plus avancer vers un date dans ce contexte exact

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
- ⚠️ OBJETS DANS LES PHOTOS : mentionne-les de façon SIMPLE et GÉNÉRIQUE. Dis "miroir" pas "miroir hexagonal", "voiture" pas "BMW grise", "canapé" pas "canapé en velours". Ne sur-décris jamais un objet visible, garde le nom usuel suffit.
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
          ? `Voici l'analyse complète du screenshot de la conversation :
${profileDesc}

RAPPEL FONDAMENTAL :
- Messages à DROITE = ce que L'UTILISATEUR a envoyé (son style, sa posture, son avancée)
- Messages à GAUCHE = ce que LA FEMME a répondu (sa résistance ou son intérêt)

MISSION : Génère ${tonesRequest.length} réponse(s) que L'UTILISATEUR va envoyer à LA FEMME.
- Analyse d'abord tout ce que l'utilisateur a dit (droite) pour comprendre son angle et ne pas créer une rupture de style
- Identifie précisément le dernier message de la femme (gauche) auquel tu dois répondre
- Génère une réponse qui s'inscrit dans la continuité de cette conversation, qui répond à son dernier message, et qui fait avancer vers un appel ou un date
- Inspire-toi au maximum des exemples fournis dans les 10 principes — c'est le registre exact à reproduire

Tons demandés : ${tonesRequest.join(', ')}.`
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
