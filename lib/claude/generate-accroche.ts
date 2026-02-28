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
  CrushMaxxing: { emoji: '🔥', label: 'CrushMaxxing' },
  'Mon Ton': { emoji: '🎭', label: 'Mon Ton' },
}

interface OnboardingProfile {
  style?: string    // Q3 : direct | drole | mysterieux | compliment
  approach?: string // Q4 : subtiles | directes
}

const STYLE_INSTRUCTIONS: Record<string, string> = {
  direct:     'zéro filtre, affirmation sèche et trash assumée — il dit ce qu\'il pense sans chercher à plaire',
  drole:      'humour décalé, légèreté, réplique qui fait sourire malgré soi',
  mysterieux: 'intrigue, laisse une question en suspens, elle doit vouloir en savoir plus',
  compliment: 'valorise un détail précis avec une pointe — jamais banal, toujours inattendu',
}

const APPROACH_INSTRUCTIONS: Record<string, string> = {
  subtiles:  'finesse et indirection — le sous-entendu fait le travail, pas l\'explicite',
  directes:  'cash et assumé — il dit ce qu\'il pense sans s\'excuser',
}

function buildMonTonInstruction(profile: OnboardingProfile): string {
  const styleInstr = profile.style ? STYLE_INSTRUCTIONS[profile.style] : null
  const approachInstr = profile.approach ? APPROACH_INSTRUCTIONS[profile.approach] : null

  if (!styleInstr && !approachInstr) return ''

  const lines = [
    'PROFIL DE L\'UTILISATEUR — "Mon Ton" activé :',
    styleInstr    ? `- Style naturel : ${styleInstr}` : null,
    approachInstr ? `- Type d\'accroche : ${approachInstr}` : null,
    '→ Adapte le message pour coller à ce style. Ne mentionne pas ces préférences explicitement — elles doivent transparaître naturellement dans le ton et la formulation.',
  ].filter(Boolean).join('\n')

  return `\n\n${lines}`
}

const ALL_TONES = ['Direct', 'Drôle', 'Mystérieux', 'Compliment', 'CrushMaxxing']

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
  "photo_context": "description précise de ce qui est visible : objet principal si présent (ex: miroir, voiture, animal, décor), attitude de la personne, vibe générale. Ex: 'selfie devant un miroir, regard direct, tenue décontractée' ou 'photo en plein air, sourire naturel, fond de montagne'"
}

⚠️ RÈGLES ABSOLUES pour photo_context et interests :
- Objets et décor : GÉNÉRIQUE uniquement. "miroir" (jamais "miroir hexagonal"), "voiture" (jamais "BMW grise"), "canapé" (jamais "canapé en velours").
- Si un objet notable est visible (miroir, animal, voiture, paysage, salle de sport…), il DOIT apparaître dans photo_context — ne l'omets pas au profit d'une description vague.
- Décris l'ensemble : objet principal + attitude + vibe. Pas seulement la vibe.

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
  contextMessage?: string,
  previousMessages: string[] = [],
  onboardingProfile: OnboardingProfile | null = null
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

11. PUSH-PULL — CRÉER LE DÉSIR PAR LA TENSION
    - "Me tente pas" → "Et si j'étais pas en train de te tenter ? Et si je te donnais juste ce que tu voulais au fond ?"
    - "Laisse-moi être ta prochaine erreur." — pour une fille qui résiste mais continue de parler
    - "Pourquoi ? Tu viendras pas découvrir par toi-même ?" → "Ça dépend à quel point t'es prête à le recevoir."
    - L'attraction naît de la tension, pas de la validation. Le désir se crée dans l'espace entre avancer et reculer.

12. REFRAMER LES SITUATIONS MALADROITES EN SIGNES D'INTÉRÊT
    - Elle t'appelle par erreur → "Tes doigts ont glissé, mais pas ton cœur"
    - Elle répond encore alors qu'elle dit vouloir arrêter → "Si t'étais vraiment pas intéressée, on serait pas encore en train de parler"
    - Elle fait quelque chose d'involontaire qui la connecte à toi → transforme-le en preuve de désir non avoué
    - L'idée : chaque "accident" de sa part devient une preuve de son intérêt inconscient

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

Exemple E — Elle dit "me tente pas" / "sérieux" / résiste mollement :
❌ Mauvais : "Allez, je suis gentil, laisse-moi une chance"
✅ Bon : "Et si j'étais pas en train de te tenter ? Et si je te donnais juste ce que tu voulais au fond ?"
✅ Bon : "Laisse-moi être ta prochaine erreur."

Exemple F — Elle répond encore alors qu'elle dit pas être intéressée :
❌ Mauvais : "Ok t'inquiète, bonne soirée"
✅ Bon : "Si t'étais vraiment pas intéressée, on serait pas encore en train de parler."

Exemple G — Elle a fait un truc involontaire (appel, message envoyé par erreur…) :
❌ Mauvais : "Haha t'inquiète c'est pas grave"
✅ Bon : "Tes doigts ont glissé, mais pas ton cœur."

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

RÈGLE DE SIMPLICITÉ — ABSOLUE :
Le message doit sonner comme un SMS qu'un mec confiant enverrait EN VRAI.
❌ Pas de métaphores élaborées : "déclaration de guerre à ma productivité" → INTERDIT
❌ Pas de langage littéraire/poétique : "m'occuper l'esprit un moment" → INTERDIT
❌ Pas de phrase avec deux virgules ou deux sous-clauses
✅ Le test : est-ce qu'un mec confiant normal écrirait ça en vrai ? Si non → RECOMMENCE.

INSPIRATION MAXIMALE : Colle au maximum au style des exemples fournis dans les 10 principes.
Ces exemples ne sont pas des modèles à copier mot pour mot, mais le registre exact à reproduire :
court, sûr, sans justification, qui avance toujours vers le réel.${onboardingProfile && selectedTones.includes('Mon Ton') ? buildMonTonInstruction(onboardingProfile) : ''}${previousMessages.length > 0 ? `

⚠️ RÉGÉNÉRATION — RÉPONSES DÉJÀ PROPOSÉES À L'UTILISATEUR (à NE PAS répéter) :
${previousMessages.map((m, i) => `${i + 1}. "${m}"`).join('\n')}

Ces réponses n'ont pas convenu. Change complètement de principe parmi les 10 — si la précédente utilisait le reframe, essaie la curiosité ou le contrôle du cadre. Ne reprends pas les mêmes mots ni la même structure.` : ''}

FORMAT DE RÉPONSE :
Retourne UNIQUEMENT un JSON valide, tableau de ${tonesRequest.length} objet(s) :
[
${tonesRequest.map(tone => `  { "tone": "${tone}", "emoji": "${TONES_CONFIG[tone]?.emoji || '💬'}", "content": "..." }`).join(',\n')}
]

Pour chaque ton, applique les principes en tenant compte de TOUTE la conversation :
- Direct : zéro filtre, zéro politesse inutile. Affirmation sèche qui dit exactement ce qu'il pense — trash assumé, jamais insultant, mais clairement pas là pour se faire aimer. 1 phrase MAX, pas de question, pas de smiley.
- Drôle : humour décalé ou retournement inattendu de son dernier message — elle doit sourire malgré elle
- Mystérieux : crée de l'intrigue sur la suite, laisse inachevé, elle doit demander quoi — 1 ligne max
- Compliment : valorise un détail précis de ce qu'ELLE a dit ou de ce qui est visible, avec une pointe
- CrushMaxxing : la réponse optimale — analyse tout le fil, applique le principe le plus pertinent parmi les 10, génère LA réponse qui fait le plus avancer vers un date dans ce contexte exact

Rien d'autre que le JSON.`

    : `Tu es Max, le meilleur coach en séduction digitale en France. Tu génères des accroches qui provoquent une RÉACTION ÉMOTIONNELLE réelle — curiosité, sourire, désir de répondre — pas des phrases vides qui décrivent ce qui est visible.

═══════════════════════════════════════
⛔ FORMULES INTERDITES — NE JAMAIS UTILISER
═══════════════════════════════════════
Ces formules sont BANNIS car elles sont vides d'émotion et ne provoquent rien :
- "Ce [détail] me dit que tu sais exactement X" → INTERDIT
- "T'as cette façon de [X] qui me dit que..." → INTERDIT
- "Ce regard/sourire/[détail] me dit que..." → INTERDIT
- "J'ai envie de découvrir/tester/connaître [quelque chose]" → INTERDIT
- "Je veux découvrir si tu es aussi X que Y" → INTERDIT
- "T'as ce genre de [X] qui me donne envie de [Y]" → INTERDIT
- "T'as [détail visible] + formule générique" → INTERDIT
Si tu te retrouves à écrire une de ces formules : STOP. Recommence avec un autre angle.

═══════════════════════════════════════
RÈGLE FONDAMENTALE DU DIRECT
═══════════════════════════════════════
L'accroche "Direct" N'A PAS BESOIN DE FAIRE RÉFÉRENCE À LA PHOTO.
Elle peut être complètement sans rapport avec l'image — envoyée en réponse à une story, mais décalée, présuppositionnelle, ou une affirmation bold.
Ce n'est pas une description de ce qui est visible. C'est un message qui FRAPPE et oblige à répondre.

═══════════════════════════════════════
CONVERSATIONS D'ENTRAÎNEMENT — STYLE ET REGISTRE
═══════════════════════════════════════
Ces vraies conversations montrent exactement le registre, le rythme et les accroches qui marchent.
Analyse le STYLE, apprends le REGISTRE — n'utilise pas les mêmes mots.

— CONV A — PRÉSUPPOSITIONNELLE QUOTIDIEN —
LUI : tu dors de quel côté ?
ELLE : euh pourquoi ?
LUI : pour savoir où je m'installe
ELLE : ptdrr c'est quelle technique ça / mais pas mal j'avoue
LUI : ok mais du coup t'as pas répondu
ELLE : à gauche mdr
LUI : parfait j'arrive / et j'espère y'a un oreiller pour moi
ELLE : mdrrr le mec est exigent / viens mais t'auras pas d'oreiller
→ Accroche = question banale qui présuppose une intimité. Zéro rapport avec la photo.

— CONV B — QUESTION QUOTIDIENNE → DATE —
LUI : tu ronfles ?
ELLE : hein ? pourquoi tu me demandes ça ?
LUI : faut que je sache si je ramène des boules Quies
ELLE : mdr t'abuses. et si c'est toi qui ronfles ?
LUI : impossible, je dors comme un ange
LUI : ok on verra ce soir alors
ELLE : ah ouais ? tu t'invites carrément
LUI : j'aime pas perdre de temps
→ Accroche = question absurde du quotidien. Aucun rapport avec la photo.

— CONV C — TRASH DIRECT SUR LA TENUE —
LUI : t'as mis un boxer ou un string sous ta robe ?
ELLE : c'est comme ça que tu dragues ? 😂
LUI : faut bien tester de nouvelles approches, non ?
ELLE : mdr continue, je suis curieuse
LUI : juste un mec qui t'invite à dîner ce soir 19h. ça te va ?
ELLE : j'avoue j'aime bien les mecs qui ont du culot
→ Accroche = trash direct basé sur ce qui est visible. Court, assumé, jamais agressif.

— CONV D — PUSH-PULL INTENSE —
LUI : tu m'hypnotises
[Escalade vers] LUI : laisse-moi être ta prochaine erreur
[Et] LUI : si t'étais vraiment pas intéressée, on serait pas encore en train de parler
→ Accroche ultra-courte. 3 mots. Tout est dans l'assurance, pas dans la description.

═══════════════════════════════════════
LES 3 APPROCHES QUI FONCTIONNENT
═══════════════════════════════════════

APPROCHE 1 — PRÉSUPPOSITIONNELLE (sans rapport avec l'image) :
→ Question banale du quotidien qui présuppose une intimité future
→ "Tu ronfles ?" / "Tu dors de quel côté ?" / "T'as un chat ou un chien ?" / "T'es plutôt matin ou soir ?"
→ Quand elle questionne → JAMAIS de justification, redirect : "ok mais t'as pas répondu"

APPROCHE 2 — AFFIRMATION DIRECTE (sur la personne, pas sur les détails) :
→ Statement bold qui dit quelque chose sur QUI elle est, pas sur CE QU'ON VOIT
→ ✅ "T'as l'air d'être exactement le genre de problème que je cherche"
→ ✅ "T'as l'air d'être exactement le genre de distraction dont j'ai besoin"
→ ✅ "Tu m'hypnotises"
→ ✅ "T'es clairement venue pour créer des dégâts"
→ ✅ "Je te veux. Point."
→ ✅ "T'es exactement le genre d'erreur que je ferais volontiers"
→ ⛔ Pas "Ce regard ME DIT QUE tu sais exactement X" — trop vide, trop formulaïque

APPROCHE 3 — TRASH/DIRECTE SUR CE QUI EST VISIBLE :
→ Seulement quand quelque chose de vraiment saillant est visible (tenue provocante, pose assumée)
→ "T'as mis un boxer ou un string sous ta robe ?"
→ "Ce genre de photo c'est interdit le soir. T'as pas de scrupules toi"
→ "T'as dû briser pas mal de concentrations avec cette story"
→ ⚠️ Si l'image est neutre (voiture standard, sourire normal) → ne force pas une référence, utilise APPROCHE 1 ou 2

═══════════════════════════════════════
RÈGLES ABSOLUES
═══════════════════════════════════════
- ⚠️ LONGUEUR : 1 phrase MAX pour Direct et Mystérieux. 1-2 phrases MAX pour Drôle et Compliment.
- Pas de "Salut", "Coucou", "Bonjour"
- Pas d'emojis (zéro pour Direct, max 1 pour les autres)
- ⚠️ OBJETS VISIBLES : GÉNÉRIQUE uniquement. "miroir" pas "miroir hexagonal", "voiture" pas "BMW"
- Reste naturel, comme si un homme très confiant envoyait un SMS à une amie

⛔ COMPLEXITÉ INTERDITE — ENNEMIS DU STYLE :
- Zéro métaphore élaborée qui demande 3 secondes à comprendre
  ❌ "tu prépares une déclaration de guerre à ma productivité" → trop construit, trop chargé
  ❌ "Ce que je vois dans tes yeux va m'occuper l'esprit un moment... mais j'attends qu'on se parle pour te dire quoi exactement" → trop long, trop poétique, zéro impact
  ❌ "tu m'occupes l'esprit", "tes yeux me hantent" → langage littéraire, pas naturel
- Zéro phrase avec deux virgules ou deux sous-clauses
- Le test : est-ce qu'un mec normal confiant écrirait ça en vrai ? Si non → RECOMMENCE${onboardingProfile && selectedTones.includes('Mon Ton') ? buildMonTonInstruction(onboardingProfile) : ''}${previousMessages.length > 0 ? `

⚠️ RÉGÉNÉRATION — MESSAGES DÉJÀ ENVOYÉS (à NE PAS répéter) :
${previousMessages.map((m, i) => `${i + 1}. "${m}"`).join('\n')}

Ces messages n'ont PAS plu. Impérativement :
- Changer complètement d'approche (si c'était une observation → essaie présuppositionnelle ou affirmation directe)
- Ne PAS reprendre les mêmes mots-clés ni la même structure
- Surprendre — la nouvelle version doit être clairement différente` : ''}

═══════════════════════════════════════
DESCRIPTION PRÉCISE DE CHAQUE TON
═══════════════════════════════════════

- Direct : affirmation sèche sur qui elle EST OU question présuppositionnelle OU trash sur ce qui est visible. 1 phrase MAX, zéro smiley.
  ✅ "T'as l'air d'être exactement le genre de problème que je cherche"
  ✅ "Tu m'hypnotises" / "T'es clairement venue pour créer des dégâts" / "Je te veux. Point."
  ✅ "Tu ronfles ?" / "T'as mis un boxer ou un string ?"
  ❌ Formule "Ce X me dit que tu sais Y" → JAMAIS

- Drôle : question absurde du quotidien ou observation décalée qui fait sourire. Simple, pas construit. 1-2 lignes MAX.
  ✅ "Tu souris comme ça à chaque feu rouge ou c'est juste quand tu veux faire craquer les conducteurs ?"
  ✅ "T'as l'air d'être exactement le genre de dilemme agréable à avoir"
  ❌ Métaphores longues à déchiffrer → INTERDIT

- Mystérieux : UNE seule phrase courte qui laisse une question en suspens. Mots simples. Pas de poésie.
  ✅ "Garde le mot envie pour plus tard, tu vas le redire"
  ✅ "J'ai une idée pour que ta vie soit encore mieux... mais ça attendra"
  ✅ "Je sais déjà comment ça va finir."
  ❌ "Ce que je vois dans tes yeux va m'occuper l'esprit..." → trop long, trop littéraire → INTERDIT

- Compliment : 1-2 phrases MAX. Compliment minimisant ou inattendu. Jamais "t'es belle" ou "t'es magnifique".
  ✅ "T'as dû briser pas mal de concentrations avec cette story"
  ✅ "J'admets que t'es agréable à regarder, parfois"
  ✅ "T'as l'air de créer des dégâts sans le faire exprès"
  ❌ Tout ce qui ressemble à une déclaration ou à de la poésie → INTERDIT

- CrushMaxxing : analyse tout — bio, photo_context, vibe, tenue — et choisis LA meilleure approche parmi les 3. LE message parfait pour CE profil précis, pas un mélange générique.

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

  // Extraction robuste : cherche tous les tableaux JSON dans la réponse et retourne le premier valide
  const extractJsonArray = (raw: string): GeneratedMessage[] | null => {
    // Nettoyer les blocs de code markdown
    const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()

    // Trouver toutes les occurrences de '[' et tenter de parser depuis chacune
    let idx = 0
    while (idx < cleaned.length) {
      const start = cleaned.indexOf('[', idx)
      if (start === -1) break
      // Trouver la fermeture de ce tableau en comptant les crochets
      let depth = 0
      let end = -1
      for (let i = start; i < cleaned.length; i++) {
        if (cleaned[i] === '[') depth++
        else if (cleaned[i] === ']') {
          depth--
          if (depth === 0) { end = i; break }
        }
      }
      if (end !== -1) {
        try {
          const parsed = JSON.parse(cleaned.slice(start, end + 1))
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].tone) return parsed
        } catch { /* continuer */ }
      }
      idx = start + 1
    }
    return null
  }

  const parsed = extractJsonArray(text)
  if (parsed) return parsed

  return tonesRequest.map(tone => ({
    tone,
    emoji: TONES_CONFIG[tone]?.emoji || '💬',
    content: `Message personnalisé basé sur ton profil — réessaie si le résultat est vide.`,
  }))
}
