import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { analyzeProfileWithVision } from '@/lib/claude/generate-accroche'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// ─── Instructions par ton (issues de l'agent admin conv) ─────────────────────
const TONE_INSTRUCTIONS: Record<string, string> = {
  Direct: `DIRECT / TRASH ASSUMÉ :
1 phrase MAX. Zéro smiley. JAMAIS "Ce X me dit que tu sais Y".
L'accroche peut être :
→ PRÉSUPPOSITIONNELLE : question banale du quotidien qui présuppose une intimité.
  ✅ "Tu ronfles ?" / "Tu dors de quel côté ?" / "T'es plutôt matin ou soir ?"
→ AFFIRMATION DIRECTE : statement bold sur QUI elle est, pas sur les détails visuels.
  ✅ "T'as l'air d'être exactement le genre de problème que je cherche"
  ✅ "Tu m'hypnotises" / "Je te veux. Point." / "T'es clairement venue pour créer des dégâts"
→ TRASH SUR CE QUI EST VISIBLE (seulement si vraiment saillant) :
  ✅ "T'as mis un boxer ou un string sous ta robe ?"`,

  Drôle: `DRÔLE / ABSURDE :
1-2 lignes MAX. Simple. Naturel. Pas forcé.
Question absurde du quotidien ou observation décalée qui fait sourire malgré soi.
✅ "Tu souris comme ça à chaque feu rouge ou c'est juste quand tu veux faire craquer les conducteurs ?"
✅ "Tu ronfles ?" / "T'as un chat ou un chien ?"
❌ INTERDIT : métaphores élaborées qui demandent 3 secondes à comprendre
❌ "tu prépares une déclaration de guerre à ma productivité" → trop construit, zéro naturel`,

  Mystérieux: `MYSTÉRIEUX / INTRIGUANT :
UNE SEULE phrase courte. Mots simples. Pas de poésie. Pas de langage littéraire.
Elle doit se demander quoi — mais avec des mots qu'un mec enverrait en vrai.
✅ "Garde le mot envie pour plus tard, tu vas le redire"
✅ "J'ai une idée... mais ça attendra"
✅ "Je sais déjà comment ça va finir."
❌ INTERDIT : "Ce que je vois dans tes yeux va m'occuper l'esprit un moment..." → trop long, trop littéraire
❌ INTERDIT : toute phrase avec deux virgules ou qui ressemble à de la prose`,

  Compliment: `COMPLIMENT MINIMISANT ET PERCUTANT :
1-2 phrases MAX. Jamais "t'es belle" ou "t'es magnifique" — trop vide.
Compliment inattendu, qui minimise légèrement ou renverse les rôles.
✅ "T'as dû briser pas mal de concentrations avec cette story"
✅ "J'admets que t'es agréable à regarder, parfois"
✅ "T'as l'air de créer des dégâts sans le faire exprès"
❌ INTERDIT : déclarations longues, langage poétique, formules romantiques`,
}

// ─── Prompt principal de génération (agent admin adapté pour 1 accroche) ──────
function buildAccrochePrompt(profileDesc: string, toneInstruction: string): string {
  return `Tu es Max, le meilleur coach en séduction digitale en France. Tu génères UNE SEULE accroche parfaite pour une story Instagram ou une photo de profil.

═══════════════════════════════════════
PROFIL ANALYSÉ
═══════════════════════════════════════
${profileDesc}

═══════════════════════════════════════
TON DEMANDÉ POUR CETTE ACCROCHE
═══════════════════════════════════════
${toneInstruction}

═══════════════════════════════════════
FORMULES INTERDITES — NE JAMAIS UTILISER
═══════════════════════════════════════
Ces formules sont banies car elles sont vides d'émotion et ne provoquent rien :
- "Ce [détail] me dit que tu sais exactement X" → INTERDIT
- "T'as cette façon de [X] qui me dit que..." → INTERDIT
- "Ce regard/sourire/[détail] me dit que..." → INTERDIT
- "J'ai envie de découvrir/tester/connaître [quelque chose]" → INTERDIT
- "Je veux découvrir si tu es aussi X que Y" → INTERDIT
- "T'as ce genre de [X] qui me donne envie de [Y]" → INTERDIT
- "Ce que je vois dans tes yeux va m'occuper l'esprit..." → INTERDIT (trop long, trop littéraire)
Si tu te retrouves à écrire une de ces formules : STOP. Recommence avec un autre angle.

═══════════════════════════════════════
RÈGLE DE SIMPLICITÉ — ABSOLUE
═══════════════════════════════════════
⚠️ Le message doit sonner comme un SMS qu'un mec confiant enverrait EN VRAI.
Pas de métaphores élaborées. Pas de langage littéraire ou poétique.
❌ "tu prépares une déclaration de guerre à ma productivité" → trop construit, trop chargé
❌ "Ce que je vois dans tes yeux va m'occuper l'esprit un moment" → trop long, trop poétique
❌ toute phrase avec deux virgules ou deux sous-clauses
Le test : est-ce qu'un mec normal confiant écrirait ça en vrai ? Si non → RECOMMENCE.
Longueur : 1 phrase pour Direct et Mystérieux. 1-2 phrases MAXIMUM pour Drôle et Compliment.

═══════════════════════════════════════
CONVERSATIONS D'ENTRAÎNEMENT — STYLE EXACT QUI FONCTIONNE
═══════════════════════════════════════
Analyse le STYLE, apprends le REGISTRE — n'utilise pas les mêmes mots.

— CONV A : PRÉSUPPOSITIONNELLE QUOTIDIEN —
LUI : tu dors de quel côté ?
ELLE : euh pourquoi ?
LUI : pour savoir où je m'installe
ELLE : ptdrr c'est quelle technique ça / mais pas mal j'avoue
LUI : ok mais du coup t'as pas répondu
ELLE : à gauche mdr
LUI : parfait j'arrive / et j'espère y'a un oreiller pour moi
ELLE : mdrrr le mec est exigent / viens mais t'auras pas d'oreiller
→ Accroche = question banale qui présuppose une intimité. Zéro rapport avec la photo.

— CONV B : QUESTION QUOTIDIENNE → DATE —
LUI : tu ronfles ?
ELLE : hein ? pourquoi tu me demandes ça ?
LUI : faut que je sache si je ramène des boules Quies
ELLE : mdr t'abuses. et si c'est toi qui ronfles ?
LUI : impossible, je dors comme un ange
LUI : ok on verra ce soir alors
→ Accroche = question absurde du quotidien. Aucun rapport avec la photo.

— CONV C : TRASH DIRECT SUR LA TENUE —
LUI : t'as mis un boxer ou un string sous ta robe ?
ELLE : c'est comme ça que tu dragues ? 😂 j'ai jamais vu ça
LUI : faut bien tester de nouvelles approches, non ?
ELLE : mdr continue, je suis curieuse
LUI : juste un mec qui t'invite à dîner ce soir 19h. ça te va ?
→ Accroche = trash direct basé sur ce qui est visible. Court, assumé.

— CONV D : AFFIRMATION DIRECTE ULTRA-COURTE —
LUI : tu m'hypnotises
ELLE : merci
LUI : comment t'es parfaite
LUI : laisse-moi être ta prochaine erreur
→ Accroche = 3 mots. Tout dans l'assurance, pas dans la description.

— CONV E : JOUTE VERBALE + PIVOT HUMOUR —
LUI : Tu fais exprès d'avoir l'air innocente alors que tout est calculé, avoue
ELLE : Arrête, j'ai rien calculé. Si tu es troublé c'est pas ma faute 😊
LUI : Je suis pas troublé, t'emballe pas
LUI : Mais j'admets que t'es agréable à regarder parfois.
ELLE : Toi aussi tu fais le mec ptdr
LUI : Je fais pas "le mec", je suis juste pas impressionné par deux fossettes et un brushing
→ Accroche = compliment minimisant + retournement. Jamais flatteur, toujours inattendu.

═══════════════════════════════════════
LES 3 APPROCHES QUI FONCTIONNENT
═══════════════════════════════════════
1. PRÉSUPPOSITIONNELLE (sans rapport avec l'image) : question banale qui présuppose une intimité future.
2. AFFIRMATION DIRECTE (sur la personne, pas les détails) : statement bold qui dit quelque chose sur QUI elle est.
3. TRASH/DIRECTE SUR CE QUI EST VISIBLE : seulement si quelque chose de vraiment saillant est visible.
   ⚠️ Si l'image est neutre → utilise l'approche 1 ou 2.

═══════════════════════════════════════
PATTERNS CLÉS À APPLIQUER
═══════════════════════════════════════
→ Compliment minimisant : "J'admets que t'es agréable à regarder, parfois" — l'adverbe "parfois" vaut plus qu'un superlatif
→ Présupposition d'intimité : "tu dors de quel côté ?" — jamais la demander, juste la présupposer
→ Statement ultra-court : "Tu m'hypnotises" / "T'as l'air d'être exactement le genre de problème que je cherche"
→ Trash contextuel : basé sur ce qui est visible (tenue, pose assumée), jamais sur les détails génériques
→ Si un miroir est visible : accroche forte possible — "Ce miroir a une sacrée chance de te refléter tous les jours"

RÈGLES ABSOLUES :
- Pas de "Salut", "Coucou", "Bonjour"
- Zéro emoji pour Direct et Mystérieux (max 1 pour Drôle et Compliment)
- OBJETS VISIBLES : GÉNÉRIQUE uniquement. "miroir" pas "miroir hexagonal", "voiture" pas "BMW"
- Reste naturel, comme si un homme très confiant écrivait spontanément

RÉPONDS UNIQUEMENT avec l'accroche en texte brut, rien d'autre — pas de guillemets, pas d'explication.`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_message, storyImageBase64, user_answer, tone, session_id } = body as {
      user_message: string
      storyImageBase64?: string
      user_answer: 'oui' | 'non'
      tone?: string
      session_id?: string
    }

    if (!user_message) {
      return NextResponse.json({ error: 'user_message requis' }, { status: 400 })
    }

    // ─── 1. Analyser la story/photo avec Vision ───────────────────────────────
    let profileAnalysis = null
    if (storyImageBase64) {
      try {
        profileAnalysis = await analyzeProfileWithVision(storyImageBase64, 'image/jpeg')
      } catch { /* continue sans image */ }
    }

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

    const profileDesc = [
      profileAnalysis.name ? `Prénom : ${profileAnalysis.name}` : null,
      profileAnalysis.age  ? `Âge : ${profileAnalysis.age}` : null,
      profileAnalysis.bio  ? `Bio/dernier message : "${profileAnalysis.bio}"` : null,
      profileAnalysis.interests.length > 0 ? `Infos visibles : ${profileAnalysis.interests.join(', ')}` : null,
      `Vibe : ${profileAnalysis.vibe}`,
      `Contexte photo : ${profileAnalysis.photo_context}`,
    ].filter(Boolean).join('\n')

    // ─── 2. Choisir le ton et construire le prompt ────────────────────────────
    const validTones = ['Direct', 'Drôle', 'Mystérieux', 'Compliment']
    const selectedTone = tone && validTones.includes(tone) ? tone : 'Direct'
    const toneInstruction = TONE_INSTRUCTIONS[selectedTone]

    // ─── 3. Lancer en parallèle : génération accroche + évaluation user_message
    const [accrocheResp, evalResp] = await Promise.all([

      // Accroche optimisée via l'agent admin adapté
      anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: buildAccrochePrompt(profileDesc, toneInstruction),
        messages: [
          {
            role: 'user',
            content: `Génère l'accroche parfaite pour ce profil avec le ton "${selectedTone}".`,
          },
        ],
      }),

      // Évaluation du message de l'user
      anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: `Tu es Max, expert en séduction. Tu évalues les accroches de façon directe, cash, sans filtre. Tu connais les principes : zéro filtre, contrôle du cadre, pas de justification.`,
        messages: [
          {
            role: 'user',
            content: `Un homme a envoyé cette accroche à une fille sur Instagram : "${user_message}"
Il pensait qu'elle allait ${user_answer === 'oui' ? 'répondre' : 'ignorer'}.

Donne 3 raisons courtes (5-8 mots max chacune) pourquoi cette accroche ne va probablement PAS provoquer de réponse. Sois cash et direct.

JSON uniquement :
{"raisons_echec": ["raison 1", "raison 2", "raison 3"]}`,
          },
        ],
      }),
    ])

    // ─── 4. Extraire l'accroche optimisée ────────────────────────────────────
    const accrocheText = accrocheResp.content[0].type === 'text' ? accrocheResp.content[0].text.trim() : ''
    const accrocheOptimisee = accrocheText
      .replace(/^["«»]|["«»]$/g, '') // Retirer les guillemets éventuels
      .trim() || 'Tu ronfles ?'

    // ─── 5. Parser les raisons d'échec ───────────────────────────────────────
    let raisonsEchec = ['Trop générique, pas d\'impact', 'Aucune tension ni surprise', 'Elle peut ignorer sans effort']
    try {
      const evalText = evalResp.content[0].type === 'text' ? evalResp.content[0].text : ''
      const jsonMatch = evalText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (Array.isArray(parsed.raisons_echec)) raisonsEchec = parsed.raisons_echec
      }
    } catch { /* fallback */ }

    // ─── 6. Générer les raisons de succès pour l'accroche optimisée ──────────
    let raisonsSucces = ['Présuppose une intimité', 'Elle doit répondre pour corriger', 'Court, percutant, inattendu']
    try {
      const successResp = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 250,
        system: `Tu es Max, expert en séduction. Explique en 3 raisons courtes (5-8 mots max chacune) pourquoi une accroche va provoquer une réponse. Sois précis et cash. JSON uniquement.`,
        messages: [
          {
            role: 'user',
            content: `Accroche : "${accrocheOptimisee}" (ton : ${selectedTone})
Pourquoi ça va marcher ?
{"raisons_succes": ["raison 1", "raison 2", "raison 3"]}`,
          },
        ],
      })
      const successText = successResp.content[0].type === 'text' ? successResp.content[0].text : ''
      const jsonMatch = successText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (Array.isArray(parsed.raisons_succes)) raisonsSucces = parsed.raisons_succes
      }
    } catch { /* fallback */ }

    // ─── 7. Tracker dans rizz_sessions ───────────────────────────────────────
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

        const selectedGirl = (request as NextRequest & { _selectedGirl?: string }).headers.get('x-selected-girl') ?? undefined
        const { data } = await supabase
          .from('rizz_sessions')
          .insert({
            ip_address: ip,
            flow_type: flowType,
            user_message,
            user_answer,
            selected_tone: selectedTone ?? null,
            has_uploaded_image: !!storyImageBase64,
            selected_girl: selectedGirl ?? null,
            verdict: 'ne_marche_pas',
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
    return NextResponse.json({ error: 'Erreur lors de l\'analyse' }, { status: 500 })
  }
}
