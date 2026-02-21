/**
 * Prompts pour la génération de bios Tinder/dating personnalisées
 * Utilise Claude API (Anthropic)
 */

export interface BioGenerationInput {
  firstName?: string
  job: string
  hobbies: string[]
  anecdotes: string[]
  personality: string
  tone?: 'direct' | 'intrigant' | 'humoristique' | 'aventurier'
}

/**
 * Construit le prompt pour générer une bio personnalisée
 */
export function buildBioPrompt(input: BioGenerationInput): string {
  const tone = input.tone || 'direct'
  
  const toneInstructions = {
    direct: 'Ton direct, sincère, sans fioritures. Phrase courte et percutante. Authentique et honnête.',
    intrigant: 'Ton mystérieux, qui pique la curiosité. Laisse des questions en suspens. Évoque sans tout révéler.',
    humoristique: 'Ton léger et drôle. Autodérision bienvenue. Jeux de mots subtils. Fait sourire.',
    aventurier: 'Ton dynamique et spontané. Évoque le mouvement, l\'action, les découvertes. Énergie palpable.',
  }

  return `Tu es un expert en création de bios Tinder/dating optimisées pour maximiser les matchs.

CONTEXTE UTILISATEUR:
${input.firstName ? `- Prénom: ${input.firstName}` : ''}
- Métier: ${input.job}
- Hobbies/Passions: ${input.hobbies.join(', ')}
- Anecdotes: ${input.anecdotes.join(' • ')}
- Personnalité: ${input.personality}

TON DEMANDÉ: ${tone}
${toneInstructions[tone]}

RÈGLES STRICTES:
1. Maximum 300 caractères (contrainte Tinder)
2. Aucun cliché ("J'aime voyager", "J'adore rire", etc.)
3. Pas de liste à puces
4. Pas d'emojis
5. Aucune mention de "swipe", "match", "bio", etc.
6. Pas de "cherche à", "recherche", "ici pour"
7. Éviter les phrases génériques
8. Créer une image mentale concrète et personnelle
9. Intégrer au moins 1 anecdote ou détail personnel
10. Terminer sur une note ouverte qui invite au dialogue

STRUCTURE:
- 1 phrase d'accroche (job OU personnalité intégrée naturellement)
- 2-3 phrases qui racontent une micro-histoire ou peignent une scène
- 1 phrase de fin qui ouvre la conversation

EXEMPLES DE BONNES BIOS (inspirations, pas à copier):
- "Architecte le jour, chef raté le soir. Ma spécialité ? Les pâtes trop cuites et les plans trop ambitieux. Question existentielle du moment : est-ce qu'on peut mettre du parmesan sur du poisson ?"
- "Je code entre deux sessions de surf. Mon dernier bug m'a coûté 3h de sommeil, ma dernière vague m'a coûté ma planche. Les deux en valaient la peine."
- "Consultant qui a troqué PowerPoint contre des cours de poterie. Mes bols sont moches mais ma grand-mère les trouve magnifiques. C'est l'intention qui compte, non ?"

Génère UNE SEULE bio optimisée pour cet utilisateur. Sois créatif, personnel et mémorable.`
}

/**
 * Génère plusieurs variations de bio avec différents tons
 */
export function buildMultiBioPrompt(input: BioGenerationInput): string {
  return `Tu es un expert en création de bios Tinder/dating optimisées pour maximiser les matchs.

CONTEXTE UTILISATEUR:
${input.firstName ? `- Prénom: ${input.firstName}` : ''}
- Métier: ${input.job}
- Hobbies/Passions: ${input.hobbies.join(', ')}
- Anecdotes: ${input.anecdotes.join(' • ')}
- Personnalité: ${input.personality}

RÈGLES STRICTES (TOUTES les bios):
1. Maximum 300 caractères chacune
2. Aucun cliché
3. Pas de liste à puces
4. Pas d'emojis
5. Pas de mention de "swipe", "match", "bio"
6. Intégrer des détails personnels concrets
7. Terminer sur une ouverture au dialogue

Génère 4 bios différentes, chacune avec un ton distinct:

1. **TON DIRECT**: Sincère, sans fioritures, phrase courte et percutante
2. **TON INTRIGANT**: Mystérieux, laisse des questions en suspens
3. **TON HUMORISTIQUE**: Léger et drôle, autodérision, fait sourire
4. **TON AVENTURIER**: Dynamique, spontané, évoque le mouvement et l'action

Format de réponse:
DIRECT: [bio 1]
INTRIGANT: [bio 2]
HUMORISTIQUE: [bio 3]
AVENTURIER: [bio 4]`
}
