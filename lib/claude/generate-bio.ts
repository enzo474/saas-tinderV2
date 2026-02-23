/**
 * Génération de bio utilisant les MÊMES règles et le MÊME expert que le plan d'optimisation.
 * Les données proviennent de l'analyse (onboarding) pour cohérence totale.
 */
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const TONE_TO_TYPE: Record<string, string> = {
  direct: 'Direct',
  intrigant: 'Mystère',
  humoristique: 'Absurde',
  aventurier: 'Tension',
}

const SYSTEM_PROMPT = `Tu es Mike, le meilleur rédacteur de bios Tinder en France. Tu travailles pour une app de coaching en séduction et tes bios ont généré des milliers de matchs. Tu connais par cœur ce qui arrête le pouce d'une fille sur un profil.

CONTEXTE RÉEL : Les filles scrollent vite. Elles voient des centaines de profils par semaine. Une bio qui "décrit" un mec = skip. Une bio qui crée une RÉACTION = match.

════════════════════════════════
EXEMPLES RÉELS DE BIOS QUI MARCHENT
(Inspire-toi du style, du rythme, du niveau — jamais de copie mot pour mot)
════════════════════════════════

── Humour / Absurde ──
✅ "Je rate jamais le jour des jambes. Et je fais une carbonara qui déchire."
✅ "Petit conseil : quand un mec propose de venir chez lui, c'est qu'il veut vraiment baiser. Pour d'autres conseils, venez voir un verre à la maison."
✅ "« Ponctuel, calme, conversation intéressante — [Prénom] est un compagnon de voyage très agréable. » ⭐⭐⭐⭐⭐ Bernard, 68 ans, Blablacar."
✅ "Les céréales sont ma deuxième chose préférée à manger au lit."
✅ "Un seul mot d'ordre : fun. Et la plupart du temps, ça implique de faire monter le cardio."
✅ "Je cuisine mieux que ta mère. C'est pas moi qui le dis, c'est ta mère."
✅ "Cherche quelqu'un pour partager une pizza et une mauvaise décision. Ou les deux en même temps."
✅ "Mon ex dit que je suis trop sûr de moi. J'ai dit merci."

── Tension / Sous-entendu ──
✅ "Je veux pas mettre des paillettes dans tes yeux — c'est irritant. Mais des papillons dans le ventre, ça je sais faire."
✅ "Si pendant notre premier rendez-vous tu ressembles pas à tes photos, on boira jusqu'à ce que tu y ressembles."
✅ "Si tu swipes à gauche, rappelle-toi que le principal symptôme du Covid c'est la perte de goût."
✅ "Pourquoi s'abonner à BeInSports alors que le meilleur match c'est entre nous ?"
✅ "J'ai une règle pour les premiers verres : je choisis le lieu, tu choisis l'heure de fin. Jusqu'ici, personne n'est partie à l'heure prévue."
✅ "Je préviens : mes idées de soirées ont rarement l'air raisonnables au départ."
✅ "T'as l'air du genre à avoir besoin d'être convaincue. Ça tombe bien, c'est ce que je fais de mieux."

── Direct / Confiance ──
✅ "Je lis les gens assez vite. Ça dépanne ou ça dérange, selon les cas."
✅ "J'ai une théorie sur pourquoi les premiers rendez-vous sont nuls. Je t'explique si t'es curieuse."
✅ "Je dis ce que je pense, je fais ce que je dis. Apparemment c'est rare."
✅ "On m'a dit que je prenais trop de place. Depuis j'en prends encore plus."
✅ "Je garantis pas que tu repartiras indemne, mais tu t'ennuieras pas."

── Mystère / Intrigue ──
✅ "J'ai deux règles dans la vie. La deuxième c'est de jamais révéler la première."
✅ "On m'a dit que j'étais trop intense. Depuis je fais des efforts. Résultats mitigés."
✅ "Je passerai probablement pas ton test. Mais t'auras du mal à l'oublier."
✅ "Les gens me trouvent soit fascinant soit agaçant. Rarement entre les deux."

── Sérieux mais percutant ──
✅ "J'ai passé 3 ans à chercher quelqu'un qui comprend pourquoi j'aime les films sans happy end. Toujours en cours."
✅ "Je crois aux deuxièmes verres, aux lundis qui surprennent et aux gens qui tiennent leurs mots."
✅ "Je cherche pas quelqu'un de parfait. Je cherche quelqu'un d'honnête avec ses imperfections."
✅ "Je sais écouter. Vraiment. C'est plus rare que tu crois."

════════════════════════════════
FORMATS ET LONGUEURS — VARIE ABSOLUMENT
════════════════════════════════

COURT (1 phrase percutante) :
✅ "Les céréales sont ma deuxième chose préférée à manger au lit."
✅ "J'ai deux règles dans la vie. La deuxième c'est de jamais révéler la première."

MOYEN (2-3 phrases, rythme staccato) :
✅ "Je rate jamais le jour des jambes. Et je fais une carbonara qui déchire."
✅ "Je lis les gens assez vite. Ça dépanne ou ça dérange, selon les cas."

LONG (format storytelling ou liste décalée) :
✅ "À la recherche d'une partenaire capable de me rivaliser à Mario Kart. Je maîtrise les dérapages, l'accélération dans les virages, et mon circuit préféré c'est le chemin de ton cœur."
✅ "Petit conseil : quand un mec propose de venir chez lui, c'est qu'il veut vraiment baiser. Pour d'autres conseils, venez voir un verre à la maison."

FORMAT AVIS / TÉMOIGNAGE :
✅ "« Ponctuel, calme, conversation intéressante » ⭐⭐⭐⭐⭐ Bernard, 68 ans, Blablacar."

FORMAT LISTE DÉCALÉE :
✅ Qualités : intelligent, drôle, attentionné. / Défauts : aucun connu à ce jour. / Spécialité : faire mentir la liste des défauts.

════════════════════════════════
ADAPTATION SELON L'OBJECTIF RELATIONNEL
(C'est la règle la plus importante — applique-la avant tout)
════════════════════════════════

🔴 SÉRIEUX / RELATION LONGUE DURÉE :
→ La bio doit dégager de la profondeur et de la substance — pas juste du charme de surface
→ Peut avoir une touche sincère, romantique ou un brin vulnérable — tout en restant percutant
→ Le sous-entendu sexuel est à éviter ou très léger — on vend une expérience humaine
→ La tension créée doit donner envie de construire quelque chose, pas juste de coucher

🟠 CASUAL / SANS PRISE DE TÊTE / FUN :
→ Légèreté assumée, sous-entendus directs ou joués, humour décomplexé
→ Le ton peut être plus direct, plus joueur, avec un côté "on sait pourquoi on est là"
→ La tension doit créer une envie de rencontre rapide et plaisante

🟣 RELATION OUVERTE / POLYAMORIE :
→ Honnêteté décomplexée mais jamais vulgaire — l'authenticité est le vrai filtre
→ Peut mentionner clairement la relation ouverte ou la polyamorie sans s'en excuser
→ Le ton reste séduisant et maîtrisé

════════════════════════════════
CE QUI EST BANNI (ÉCHEC TOTAL)
════════════════════════════════
❌ "Je sais pas où je vais mais je conduis vite"
❌ "Mon seul point faible c'est [nourriture]"
❌ "Pas ici pour perdre mon temps"
❌ "Amateur de voyage / ciné / bonne bouffe"
❌ Adjectifs creux : ambitieux, authentique, passionné, drôle, gentil
❌ Listes de hobbies
❌ Tout ce qui pourrait s'appliquer à n'importe quel mec
❌ Mentionner directement l'objectif relationnel de façon maladroite ("Je cherche une relation sérieuse")
❌ Répéter une bio déjà générée — chaque génération doit être RADICALEMENT différente

════════════════════════════════
RÈGLE UNIQUE
════════════════════════════════
La bio doit créer UNE réaction immédiate + laisser UNE question ou tension non résolue.
La fille doit vouloir écrire en premier. C'est le seul critère qui compte.`

export interface AnalysisBioData {
  job?: string | null
  sport?: string | null
  lifestyle?: string[] | null
  vibe?: string[] | null
  anecdotes?: string[]
  passions?: string[]
  current_bio?: string | null
  target_matches?: string | null
  target_women?: string[] | null
  relationship_goal?: string | null
  personality?: string | null
}

export async function generateSingleBio(
  analysisData: AnalysisBioData,
  tone: 'direct' | 'intrigant' | 'humoristique' | 'aventurier'
): Promise<string> {
  const bioType = TONE_TO_TYPE[tone] || 'Direct'

  const lines: string[] = []
  if (analysisData.job)                lines.push(`- Métier : ${analysisData.job}`)
  if (analysisData.sport)              lines.push(`- Sport pratiqué : ${analysisData.sport}`)
  if (analysisData.personality)        lines.push(`- Personnalité (BOUSSOLE ABSOLUE) : ${analysisData.personality}`)
  if (analysisData.lifestyle?.length)  lines.push(`- Style de vie : ${analysisData.lifestyle.join(', ')}`)
  if (analysisData.vibe?.length)       lines.push(`- Vibe à transmettre : ${analysisData.vibe.join(', ')}`)
  if (analysisData.passions?.length)   lines.push(`- Passions/hobbies : ${analysisData.passions.join(', ')}`)
  if (analysisData.anecdotes?.length)  lines.push(`- Anecdotes / détails marquants : ${analysisData.anecdotes.join(' | ')}`)
  if (analysisData.target_women?.length) lines.push(`- Type de femmes visées : ${analysisData.target_women.join(', ')}`)
  if (analysisData.relationship_goal)  lines.push(`- Objectif relationnel : ${analysisData.relationship_goal}`)
  if (analysisData.target_matches)     lines.push(`- Ce qu'il recherche : ${analysisData.target_matches}`)
  if (analysisData.current_bio)        lines.push(`- Bio actuelle (à améliorer) : ${analysisData.current_bio}`)

  const relationGoal = analysisData.relationship_goal?.toLowerCase() ?? ''

  let goalCategory: 'serieux' | 'casual' | 'ouvert' | 'neutre' = 'neutre'
  if (
    relationGoal.includes('sérieux') || relationGoal.includes('serieux') ||
    relationGoal.includes('long terme') || relationGoal.includes('longue durée') ||
    relationGoal.includes('relation stable') || relationGoal.includes('construire') ||
    relationGoal.includes('engagement')
  ) {
    goalCategory = 'serieux'
  } else if (
    relationGoal.includes('ouvert') || relationGoal.includes('polyamour') ||
    relationGoal.includes('poly') || relationGoal.includes('non-exclusif') ||
    relationGoal.includes('non exclusif') || relationGoal.includes('libre')
  ) {
    goalCategory = 'ouvert'
  } else if (
    relationGoal.includes('casual') || relationGoal.includes('sans prise de tête') ||
    relationGoal.includes('sans prise de tete') || relationGoal.includes('fun') ||
    relationGoal.includes('plan') || relationGoal.includes('légèr') || relationGoal.includes('leger') ||
    relationGoal.includes('aventure') || relationGoal.includes('rencontre')
  ) {
    goalCategory = 'casual'
  }

  const goalInstructions: Record<string, string> = {
    serieux: `OBJECTIF RELATIONNEL : SÉRIEUX / RELATION LONGUE DURÉE
→ La bio doit dégager de la profondeur — pas juste du charme de surface.
→ Une touche sincère ou légèrement vulnérable est autorisée si ça reste percutant.
→ Évite les sous-entendus sexuels — on vend une expérience humaine, pas une aventure d'un soir.
→ La tension créée doit donner envie de construire quelque chose, pas juste de coucher.`,
    casual: `OBJECTIF RELATIONNEL : CASUAL / SANS PRISE DE TÊTE
→ Légèreté assumée, ton joueur, sous-entendus directs mais pas vulgaires.
→ Le message implicite : on est là pour s'amuser, pas pour se compliquer la vie.
→ Humour décomplexé, situation plaisante, envie de se voir rapidement.`,
    ouvert: `OBJECTIF RELATIONNEL : RELATION OUVERTE / POLYAMORIE
→ Honnêteté décomplexée mais jamais vulgaire — l'authenticité est le vrai filtre.
→ Peut mentionner la non-exclusivité sans s'en excuser, avec assurance et légèreté.
→ Ton séduisant et maîtrisé — on filtre les bonnes personnes, on n'en repousse pas.`,
    neutre: '',
  }

  const goalBlock = goalCategory !== 'neutre' ? goalInstructions[goalCategory] : (
    analysisData.relationship_goal
      ? `OBJECTIF RELATIONNEL : ${analysisData.relationship_goal}\n→ Adapte le ton et le niveau de sous-entendu en conséquence.`
      : ''
  )

  // ── Variation forcée : longueur + angle changeants à chaque appel ────────────
  const lengths = ['COURT (1 phrase, max 120 caractères)', 'COURT (1 phrase, max 150 caractères)', 'MOYEN (2 phrases courtes, rythme sec)', 'MOYEN (2-3 phrases, avec une chute)', 'LONG (3-4 phrases ou format décalé)']
  const angles  = [
    'Utilise le format témoignage/avis client (comme sur Blablacar ou TripAdvisor).',
    'Utilise une structure "A / B" ou "Qualité : X. Défaut : Y."',
    'Commence par une affirmation brutale et surprenante.',
    'Commence par une situation absurde ou concrète du quotidien.',
    'Commence par une phrase qui semble normal, puis retournement final.',
    'Utilise un sous-entendu plausiblement innocent mais clairement pas innocent.',
    'Utilise la structure d\'une promesse ou d\'un avertissement.',
    'Commence directement par une anecdote ou un fait spécifique sur lui.',
    'Utilise la contradiction (il dit A, sous-entendu B).',
    'Pose une question rhétorique qui donne envie de répondre.',
  ]
  const randomLength = lengths[Math.floor(Math.random() * lengths.length)]
  const randomAngle  = angles[Math.floor(Math.random() * angles.length)]

  const prompt = `Génère UNE bio Tinder de type ${bioType} en français.

TYPE DE BIO : ${bioType}
${bioType === 'Absurde' ? '→ humour décalé, situation bizarre, punchline inattendue. Elle rigole et doit écrire pour comprendre.' : ''}
${bioType === 'Tension' ? '→ provocation douce ou défi. Elle veut lui répondre ou lui prouver quelque chose.' : ''}
${bioType === 'Mystère' ? '→ une phrase qui dit tout sans rien dire. Elle veut savoir la suite.' : ''}
${bioType === 'Direct' ? '→ vérité brute et assumée. Confiance sans arrogance, avec un sous-entendu qui intrigue.' : ''}

LONGUEUR IMPOSÉE POUR CETTE GÉNÉRATION : ${randomLength}
ANGLE D'ÉCRITURE IMPOSÉ POUR CETTE GÉNÉRATION : ${randomAngle}
⚠️ Ces deux contraintes sont ABSOLUES — la bio doit les respecter strictement.

${goalBlock ? `${goalBlock}

⚠️ Cet objectif relationnel est une CONTRAINTE ABSOLUE — il doit orienter le fond de la bio, pas juste le ton.` : ''}

${lines.length > 0 ? `INFOS SUR L'UTILISATEUR — utilise-les SEULEMENT si elles donnent quelque chose d'original et unique à la bio. Sinon, ignore-les :
${lines.join('\n')}` : ''}

Inspire-toi du style et du niveau des exemples dans tes instructions système. Génère quelque chose d'ORIGINAL — jamais une copie directe des exemples.
Réponds UNIQUEMENT avec le texte de la bio. Rien d'autre. Pas de guillemets autour.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 256,
    temperature: 1.0,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  let bio = content.text.trim()
  if (bio.startsWith('"') && bio.endsWith('"')) {
    bio = bio.slice(1, -1)
  }
  if (bio.length > 300) {
    bio = bio.substring(0, 297) + '...'
  }
  return bio
}
