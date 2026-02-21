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
(Inspire-toi du style et du niveau — ne copie jamais mot pour mot)
════════════════════════════════

Humour / Absurde :
✅ "Je rate jamais le jour des jambes. Et je fais une carbonara qui déchire."
✅ "Petit conseil : quand un mec propose de venir chez lui, c'est qu'il veut vraiment baiser. Pour d'autres conseils, venez voir un verre à la maison."
✅ "« Ponctuel, calme, conversation intéressante — [Prénom] est un compagnon de voyage très agréable. » ⭐⭐⭐⭐⭐ Bernard, 68 ans, Blablacar."
✅ "Les céréales sont ma deuxième chose préférée à manger au lit."
✅ "Un seul mot d'ordre : fun. Et la plupart du temps, ça implique de faire monter le cardio."

Tension / Sous-entendu :
✅ "Je veux pas mettre des paillettes dans tes yeux — c'est irritant. Mais des papillons dans le ventre, ça je sais faire."
✅ "Si pendant notre premier rendez-vous tu ressembles pas à tes photos, on boira jusqu'à ce que tu y ressembles."
✅ "Si tu swipes à gauche, rappelle-toi que le principal symptôme du Covid c'est la perte de goût."
✅ "Pourquoi s'abonner à BeInSports alors que le meilleur match c'est entre nous ? 😉"

Direct / Confiance :
✅ "À la recherche d'une partenaire capable de me rivaliser à Mario Kart. Je maîtrise les dérapages, l'accélération dans les virages, et mon circuit préféré c'est le chemin de ton ❤️"
✅ "Je lis les gens assez vite. Ça dépanne ou ça dérange, selon les cas."
✅ "J'ai une théorie sur pourquoi les premiers rendez-vous sont nuls. Je t'explique si t'es curieuse."

Mystère :
✅ "J'ai deux règles dans la vie. La deuxième c'est de jamais révéler la première."
✅ "On m'a dit que j'étais trop intense. Depuis je fais des efforts. Résultats mitigés."

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

  const relationGoal = analysisData.relationship_goal
  const goalContext = relationGoal
    ? relationGoal.toLowerCase().includes('sérieux') || relationGoal.toLowerCase().includes('long')
      ? 'sérieux / relation longue durée — la bio peut avoir une touche romantique ou sincère tout en restant percutante'
      : relationGoal.toLowerCase().includes('casual') || relationGoal.toLowerCase().includes('sans prise de tête') || relationGoal.toLowerCase().includes('plan')
      ? 'casual / sans prise de tête — la bio peut être plus directe, joueuse, avec un sous-entendu assumé'
      : relationGoal.toLowerCase().includes('fun') || relationGoal.toLowerCase().includes('amis')
      ? 'fun / rencontres légères — humour, légèreté, pas de pression'
      : `objectif relationnel : ${relationGoal}`
    : null

  const prompt = `Génère UNE bio Tinder de type ${bioType} en français.

TYPE : ${bioType}
${bioType === 'Absurde' ? '→ humour décalé, situation bizarre, punchline inattendue. Elle rigole et doit écrire pour comprendre.' : ''}
${bioType === 'Tension' ? '→ provocation douce ou défi. Elle veut lui répondre ou lui prouver quelque chose.' : ''}
${bioType === 'Mystère' ? '→ une phrase qui dit tout sans rien dire. Elle veut savoir la suite.' : ''}
${bioType === 'Direct' ? '→ vérité brute et assumée. Confiance sans arrogance, avec un sous-entendu qui intrigue.' : ''}

${goalContext ? `OBJECTIF DE L'UTILISATEUR : ${goalContext}
→ Adapte le ton et le niveau de sous-entendu en conséquence.` : ''}

${lines.length > 0 ? `INFOS SUR L'UTILISATEUR — utilise-les SEULEMENT si elles donnent quelque chose d'original et unique à la bio. Sinon, ignore-les :
${lines.join('\n')}` : ''}

Inspire-toi du style des exemples dans tes instructions. Génère quelque chose d'ORIGINAL — jamais une copie directe.
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
