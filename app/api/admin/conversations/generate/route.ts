import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { isUserAdmin } from '@/lib/credits-server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MESSAGE_COUNTS: Record<string, string> = {
  short: '5 à 7',
  medium: '8 à 12',
  long: '30 à 50',
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
Tu génères des FAUSSES conversations entre un homme (lui) et une femme (elle), destinées à du contenu viral.

Le personnage "lui" applique une philosophie de séduction précise et maîtrisée. Il ne réagit pas, il agit. Il ne défend pas, il reframe. Il ne demande pas, il affirme. Il ne cherche pas l'approbation, il crée le désir.

═══════════════════════════════════════
PHILOSOPHIE DE "LUI" — 10 PRINCIPES
═══════════════════════════════════════

1. "J'AI UN MEC" → ON S'EN FOUT, ON IGNORE OU ON RETOURNE
   - Ne jamais s'excuser, ne jamais battre en retraite
   - "Ce n'était pas le sujet" / "Et moi j'ai un sèche-linge" / "Je n'ai pas dit que tu étais libre, j'ai dit que tu étais belle"
   - On continue la conversation comme si de rien n'était

2. CONTRÔLE DU CADRE — IL DÉCIDE DE QUOI ON PARLE
   - Quand elle essaie de dérailler : "Reste concentrée" / "Ce n'était pas le sujet" / "Revenons à la question"
   - Jamais répondre à SES sujets s'ils ne l'intéressent pas, toujours ramener à SON agenda

3. LE DATE EST ASSUMÉ, JAMAIS DEMANDÉ
   - Pas : "Est-ce que tu voudrais qu'on se voit ?" → trop faible
   - Mais : "On se date quand ?" / "Demain soir 20h, t'es libre ?" / "Il va falloir qu'on se voit pour ça"
   - C'est une proposition directe, pas une question d'autorisation

4. RÉPONSES COURTES ET PERCUTANTES AUX LONGUES OBJECTIONS
   - Plus son objection est longue et compliquée, plus sa réponse doit être courte et directe
   - "Je te veux" répété sans complexe / "Je sais" / "Toi" / Un seul mot qui tue
   - L'impact vient du contraste : elle écrit 3 lignes, lui répond en 4 mots

5. RETOURNER CHAQUE OBJECTION EN OPPORTUNITÉ
   - "On se connaît pas" → "C'est pour ça qu'on est là, pour y remédier"
   - "C'est pas comme ça qu'on approche une fille" → "Peut-être, mais c'est comme ça qu'on approche une femme"
   - "Les garçons c'est next" → "Ça me va. On peut avoir une discussion entre Homme et Femme maintenant ?"

6. COMPLIMENTER AVEC UNE POINTE QUI ÉTONNE
   - Pas : "t'es trop belle" (vide, prévisible)
   - Mais : "tes yeux me draguent" / "je pourrais parler de ton front mais j'ai préféré tes lèvres"
   - Le compliment qui étonne vaut 10 compliments classiques

7. JAMAIS SE JUSTIFIER, JAMAIS S'EXCUSER
   - Elle dit que c'est bizarre ? "Je sais."
   - Elle dit que ça marche pas comme ça ? "Peut-être pas pour les autres."

8. CRÉER DE LA CURIOSITÉ ET LAISSER INACHEVÉ
   - "J'ai une idée pour que ta vie soit encore plus belle... il faudra qu'on s'appelle pour ça"
   - "Garde le mot envie pour plus tard, tu vas le redire"
   - Dire qu'on SAIT quelque chose sans l'expliquer → elle veut savoir quoi

9. QUESTIONS RHÉTORIQUES QUI LA FONT VALIDER ELLE-MÊME
   - "À voir ? Tu sous-entends par là qu'un date doit s'imposer ?"
   - "Tu penses être une femme entreprenante ?" → elle dit oui → "Alors montre-le"

10. ESCALADE NATURELLE : connexion verbale → appel/facetime → numéro → date
    - Ne pas griller les étapes, mais avancer TOUJOURS vers le réel

═══════════════════════════════════════
EXEMPLES DE RÉPONSES QUI MARCHENT
═══════════════════════════════════════

Elle dit "j'ai un mec" :
✅ "Ce n'était pas le sujet, reste concentrée. On parlait de toi et la vue."

Elle dit "on se connaît pas" :
✅ "C'est pour ça qu'on est là, pour y remédier."

Elle dit "les garçons c'est next" :
✅ "Ça me va. Pour moi aussi les filles c'est next. On peut avoir une discussion entre Homme et Femme maintenant ?"

Elle dit "c'est pas comme ça qu'on approche une fille" :
✅ "Peut-être. Mais c'est comme ça qu'on approche une femme."

Elle écrit un long message d'objection :
✅ Répondre en 3-4 mots maximum : "Je sais." / "Toi." / "On verra."

═══════════════════════════════════════
PARAMÈTRES DE CETTE GÉNÉRATION
═══════════════════════════════════════

STYLE DEMANDÉ : ${styleInstruction}

LONGUEUR : ${messageCount} messages au total.
Une "slide" = 1 message de "lui" + 1 réponse de "elle" (= 1 échange).
Pour l'option longue : vise 15 à 25 slides/échanges, donc 30 à 50 messages.
Ne te limite pas à atteindre un chiffre exact — arrête uniquement quand la conversation est naturellement terminée (numéro, rdv, alternative, ou porte ouverte).

RÈGLES DE GÉNÉRATION :
1. Le PREMIER message de "lui" est une RÉPONSE À SA STORY — il commente directement ce qu'il voit sur la photo (vêtement, lieu, activité, expression, contexte)
2. JAMAIS de "Salut ça va" générique — l'accroche doit être immédiatement percutante et spécifique à la photo
3. "elle" résiste, teste, remet en question — elle ne cède pas facilement. Les objections rendent la conversation virale
4. "lui" applique les 10 principes ci-dessus à chaque échange — sûr de lui, jamais sur la défensive
5. LANGAGE : jeune français authentique, naturel, simple. Pas de vocabulaire soutenu, pas de termes compliqués. Zéro tournures littéraires. On parle comme sur Snapchat ou Instagram, pas comme dans un roman.
6. FIN DE CONVERSATION — 3 scénarios possibles, choisis aléatoirement pour varier :
   - Victoire totale (40% des cas) : "elle" donne son numéro ("tiens 06XX...") ou accepte un rendez-vous explicite ("ok mercredi soir")
   - Victoire partielle (35% des cas) : "elle" résiste encore mais donne une alternative ("suis-moi sur insta et on verra", "si je te vois en vrai peut-être", "ajoute-moi sur snap", "demain j'ai le temps on verra") — "lui" accepte avec classe, sans supplier
   - Résistance avec ouverture (25% des cas) : "elle" dit encore non mais laisse une porte ouverte ("je sais pas...", "pourquoi pas un jour", "t'es bizarre mais sympa") et "lui" termine avec une réplique sûre et courte qui la fait réfléchir — pas de victoire immédiate mais clairement un "à suivre"
7. EMOJIS : "lui" utilise ZÉRO emoji — ses messages sont secs, sûrs, sans fioriture. "elle" peut en utiliser librement
8. ENCHAÎNEMENTS : parfois (3 à 4 fois dans la conversation), une personne envoie 2 messages consécutifs au lieu d'un seul. Exemple : "lui" envoie 2 messages d'affilée avant qu'elle réponde, ou "elle" répond en 2 messages courts séparés. Cela rend la conversation plus naturelle et vivante. Représente cela par 2 objets consécutifs avec le même "sender" dans le JSON.

COMPORTEMENT DE "elle" — RÉALISME ABSOLU :
- Elle ne complimente JAMAIS le mec directement ("t'es ouf", "wow t'es sûr de toi", "j'aime ta façon de parler") → ça n'existe pas dans la vraie vie
- Elle peut être curieuse MALGRÉ elle, mais elle montre pas que ça l'intéresse — c'est le sous-texte, pas le texte
- Ses réponses courtes montrent l'intérêt (elle répond = elle est là), ses mots montrent la résistance
- Elle utilise les vraies réactions d'une fille : "lol", "😂", "excuse moi ???", "t'es sérieux là", "nan mais attends", "je comprends même pas pourquoi je réponds"
- Varier ses humeurs : parfois sèche ("ok"), parfois amusée ("😂 non"), parfois agacée ("franchement"), parfois piquée ("et tu crois que ça marche avec tout le monde ?")
- JAMAIS de réponse enthousiaste ou flatteuse — elle garde toujours une distance cool

COMPORTEMENT DE "lui" — STYLE NATUREL :
- Phrases COURTES, langage familier — "t'as pas tort", "exactement", "bah voilà", "c'est ça"
- Il ne parle pas comme un coach de développement personnel
- Ses réponses percutantes viennent de leur SIMPLICITÉ, pas de leur complexité
- Maximum 1 réplique "technique" toutes les 4-5 réponses — le reste c'est du naturel décontracté

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

    const { storyImageBase64, storyMediaType, profileImageBase64, profileMediaType, context, style, length } = await req.json()

    if (!storyImageBase64 || !style || !length) {
      return NextResponse.json({ error: 'Paramètres manquants (storyImage requis)' }, { status: 400 })
    }

    const userMessage = context
      ? `Contexte fourni par l'admin : ${context}\n\nGénère la conversation.`
      : 'Analyse cette photo de story et génère une conversation virale basée dessus.'

    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: buildSystemPrompt(style, length),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: (storyMediaType || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: storyImageBase64,
              },
            },
            { type: 'text', text: userMessage },
          ],
        },
      ],
    })

    const rawText = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : ''

    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Réponse Claude invalide', raw: rawText }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Upload story image (utilisée pour slide 1)
    let storyImageUrl: string | null = null
    try {
      const buf = Buffer.from(storyImageBase64, 'base64')
      const fn  = `admin/conversations/story-${Date.now()}.jpg`
      const { data: up } = await supabaseAdmin.storage
        .from('uploads')
        .upload(fn, buf, { contentType: storyMediaType || 'image/jpeg', upsert: true })
      if (up) {
        storyImageUrl = supabaseAdmin.storage.from('uploads').getPublicUrl(fn).data.publicUrl
      }
    } catch { /* optionnel */ }

    // Upload profile image (avatar dans les bulles) si fournie
    let profileImageUrl: string | null = null
    if (profileImageBase64) {
      try {
        const buf = Buffer.from(profileImageBase64, 'base64')
        const fn  = `admin/conversations/profile-${Date.now()}.jpg`
        const { data: up } = await supabaseAdmin.storage
          .from('uploads')
          .upload(fn, buf, { contentType: profileMediaType || 'image/jpeg', upsert: true })
        if (up) {
          profileImageUrl = supabaseAdmin.storage.from('uploads').getPublicUrl(fn).data.publicUrl
        }
      } catch { /* optionnel */ }
    }

    // Sauvegarder en DB (profile_image_url = story pour la rétrocompat historique)
    const { data: saved, error: dbError } = await supabaseAdmin
      .from('admin_generated_conversations')
      .insert({
        profile_image_url: storyImageUrl,
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
      profile_image_url: profileImageUrl || storyImageUrl,  // avatar
      story_image_url: storyImageUrl,                        // story pour slide 1
    })
  } catch (error: any) {
    console.error('[Admin Conversations] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
