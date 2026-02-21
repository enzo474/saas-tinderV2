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

── Tension / Sous-entendu ──
✅ "Je veux pas mettre des paillettes dans tes yeux — c'est irritant. Mais des papillons dans le ventre, ça je sais faire."
✅ "Si pendant notre premier rendez-vous tu ressembles pas à tes photos, on boira jusqu'à ce que tu y ressembles."
✅ "Si tu swipes à gauche, rappelle-toi que le principal symptôme du Covid c'est la perte de goût."
✅ "Pourquoi s'abonner à BeInSports alors que le meilleur match c'est entre nous ? 😉"

── Direct / Confiance ──
✅ "À la recherche d'une partenaire capable de me rivaliser à Mario Kart. Je maîtrise les dérapages, l'accélération dans les virages, et mon circuit préféré c'est le chemin de ton ❤️"
✅ "Je lis les gens assez vite. Ça dépanne ou ça dérange, selon les cas."
✅ "J'ai une théorie sur pourquoi les premiers rendez-vous sont nuls. Je t'explique si t'es curieuse."

── Mystère / Intrigue ──
✅ "J'ai deux règles dans la vie. La deuxième c'est de jamais révéler la première."
✅ "On m'a dit que j'étais trop intense. Depuis je fais des efforts. Résultats mitigés."

════════════════════════════════
ADAPTATION SELON L'OBJECTIF RELATIONNEL
(C'est la règle la plus importante — applique-la avant tout)
════════════════════════════════

🔴 SÉRIEUX / RELATION LONGUE DURÉE :
→ La bio doit dégager de la profondeur et de la substance — pas juste du charme de surface
→ Peut avoir une touche sincère, romantique ou un brin vulnérable — tout en restant percutant
→ Le sous-entendu sexuel est à éviter ou très léger — on vend une expérience humaine
→ La tension créée doit donner envie de construire quelque chose, pas juste de coucher
→ Exemples d'orientation :
   ✅ "J'ai passé 3 ans à chercher quelqu'un qui comprend pourquoi j'aime les films sans happy end. Toujours en cours."
   ✅ "Je crois aux deuxièmes verres, aux lundis qui surprennent et aux gens qui tiennent leurs mots."
   ✅ "Je lis les gens assez vite. Ce que je cherche, c'est quelqu'un que je n'arrive pas à cerner du premier coup."

🟠 CASUAL / SANS PRISE DE TÊTE / FUN :
→ Légèreté assumée, sous-entendus directs ou joués, humour décomplexé
→ Le ton peut être plus direct, plus joueur, avec un côté "on sait pourquoi on est là"
→ La tension doit créer une envie de rencontre rapide et plaisante
→ Exemples d'orientation :
   ✅ "Je prends mes engagements au sérieux. Sauf les dimanches. Et les vendredis. Et les samedis."
   ✅ "Je cherche quelqu'un pour partager une pizza et une mauvaise décision."
   ✅ "Connu pour mes plans de soirée de dernière minute et mes excuses créatives le lendemain matin."

🟣 RELATION OUVERTE / POLYAMORIE :
→ Honnêteté décomplexée mais jamais vulgaire — l'authenticité est le vrai filtre
→ Peut mentionner clairement la relation ouverte ou la polyamorie sans s'en excuser
→ Le ton reste séduisant et maîtrisé — on n'est pas sur un site de rencontre hard
→ Le but est d'attirer les bonnes personnes qui comprennent et de filtrer les autres
→ Exemples d'orientation :
   ✅ "En relation ouverte et heureux comme ça. Je cherche du vrai, pas du clandestin."
   ✅ "Mon cœur est grand, mon agenda un peu moins. Mais pour les bonnes personnes, on trouve toujours du temps."

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

  const prompt = `Génère UNE bio Tinder de type ${bioType} en français.

TYPE DE BIO : ${bioType}
${bioType === 'Absurde' ? '→ humour décalé, situation bizarre, punchline inattendue. Elle rigole et doit écrire pour comprendre.' : ''}
${bioType === 'Tension' ? '→ provocation douce ou défi. Elle veut lui répondre ou lui prouver quelque chose.' : ''}
${bioType === 'Mystère' ? '→ une phrase qui dit tout sans rien dire. Elle veut savoir la suite.' : ''}
${bioType === 'Direct' ? '→ vérité brute et assumée. Confiance sans arrogance, avec un sous-entendu qui intrigue.' : ''}

${goalBlock ? `${goalBlock}

⚠️ Cet objectif relationnel est une CONTRAINTE ABSOLUE — il doit orienter le fond de la bio, pas juste le ton.` : ''}

${lines.length > 0 ? `INFOS SUR L'UTILISATEUR — utilise-les SEULEMENT si elles donnent quelque chose d'original et unique à la bio. Sinon, ignore-les :
${lines.join('\n')}` : ''}

Inspire-toi du style et du niveau des exemples dans tes instructions système. Génère quelque chose d'ORIGINAL — jamais une copie directe.
Réponds UNIQUEMENT avec le texte de la bio. Rien d'autre.`

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
