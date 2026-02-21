import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function generateFullPlan(analysisData: any) {
  const prompt = `════════════════════════════════════════════════════════════════
SECTION 1 : RÈGLES D'OR POUR CAPTIVER EN <1 SECONDE
════════════════════════════════════════════════════════════════

PREMIÈRE PHOTO (la plus importante de toutes) :
• Lumière naturelle éclatante (golden hour, éclairage indirect lumineux)
• Couleur de vêtement qui attire l'œil : rouge, bleu électrique, vert émeraude, orange vif
• Vêtement qui contraste avec le fond (PAS noir/gris/blanc basique)
• Regard masculin : sérieux ou détourné > sourire permanent (mystère > accessibilité)
• Contact visuel direct OU regard détourné (JAMAIS de lunettes de soleil)
• Background propre et intéressant (pas de mur blanc ennuyeux)
• Photo nette, haute résolution, bien cadrée

════════════════════════════════════════════════════════════════
SECTION 2 : STRATÉGIES PHOTOS AVANCÉES (TINDER 2026)
════════════════════════════════════════════════════════════════

RÈGLES ALGORITHME TINDER 2026 :
• Être sélectif = être valorisé (swiper maximum 30% des profils)
• L'algorithme détecte le "swipe tout" et réduit drastiquement ta visibilité
• Être actif quotidiennement = boost de visibilité automatique
• Pic absolu d'activité féminine : dimanche 21h-23h (moment idéal pour utiliser un boost)
• Répondre aux messages rapidement = favorisé par l'algorithme

STRUCTURE OBLIGATOIRE DES 5 PHOTOS :
1. Portrait haute qualité (lumière + couleur vive + regard) - C'EST LA CLÉ ABSOLUE
2. Photo en pied (montre ta silhouette + ton style vestimentaire complet)
3. Passion en action (hobby concret : guitare, sport précis, activité manuelle)
4. Preuve sociale (avec amis, MAIS toi clairement identifiable au centre)
5. Photo conversation starter (voyage unique, animal, moment drôle/intrigant)

STATISTIQUES PROUVÉES (données 2026) :
• Photos en extérieur : +19% de réactions vs photos intérieur
• Selfies : -8% de réactions (donc à ÉVITER autant que possible)
• Photo de groupe en 1ère position : rejet à 96% (ERREUR FATALE)
• Photos haute qualité + lumière naturelle : +150% de matchs
• Profils avec photo en pied : +25% de matchs

ERREURS MORTELLES À ÉVITER (ça tue ton profil) :
• 1ère photo de groupe (personne ne veut jouer à "Où est Charlie")
• Photos floues, sombres, pixelisées (signale "je m'en fous")
• Lunettes de soleil sur la photo principale (cache tes yeux = cache ton âme)
• Trop de selfies (maximum 1 sur 5 photos, idéalement zéro)
• Photos trop retouchées ou filtres Instagram évidents
• Sourire forcé ou permanent sur toutes les photos (pas naturel)
• Photos en intérieur sombre ou fond blanc moche

OPTIMISATIONS TECHNIQUES TINDER :
• Active "Smart Photos" dans les réglages (Tinder teste automatiquement tes photos)
• Vérifie ton profil avec le selfie vidéo (+10% de confiance des matchs)
• Connecte Spotify/Instagram SEULEMENT si cohérent avec ton univers
• Remplis tes 5 "Passions" (l'algorithme match sur centres d'intérêts communs)
• Distance de recherche : 30-50 km optimal (pas trop large)

════════════════════════════════════════════════════════════════
SECTION 3 : BIO ULTRA-COURTE QUI CAPTE EN 2 SECONDES
════════════════════════════════════════════════════════════════

RÈGLE ABSOLUE : MAX 2 LIGNES (15-25 mots)

OBJECTIF : Créer une RÉACTION IMMÉDIATE
• Soit elle rit (humour absurde, punchline)
• Soit elle est intriguée (mystère, paradoxe)
• Soit elle est piquée (tension légère, taquinerie)

INTERDITS MORTELS :
❌ Parler de voyages, sport, restos (clichés tue-profil)
❌ Lister ses passions (ennuyeux, générique)
❌ Se décrire avec des adjectifs ("gentil, drôle, loyal")
❌ Faire long (si tu dépasses 25 mots = ÉCHEC)

TYPES DE BIOS QUI CARTONNENT :

TYPE ABSURDE (humour décalé)
• "Je cuisine comme un chef. Un chef de chantier"
• "Certifié dresseur de poissons rouges"
• "Mon CV dit consultant. Ma mère dit chômeur"
• "Horoscope : Croissant ascendant Pistache"
• "Champion du monde de procrastination officiel"

TYPE TENSION (taquinerie légère)
• "Je ne suis pas pour toi si tu détestes le café noir"
• "Swipe right si tu assumes tes goûts musicaux douteux"
• "Défi : fais-moi rire en 5 mots"
• "Je ne suis pas pour toi si Friends c'est pas ta came"

TYPE MYSTÈRE (intrigue immédiate)
• "3 secrets : un vrai, deux faux. À toi de deviner"
• "J'ai survécu à un date Tinder en 2019. AMA"
• "Mon record ? 47 secondes. Tu sauras si tu demandes"
• "Ma grand-mère a un secret. Je te le dirai au 2e verre"

TYPE DIRECT (confiance assumée)
• "Clause n°1 : tu devras tolérer mes blagues nulles"
• "Mode d'emploi : 1 café, 2 rires, 0 prise de tête"
• "Casting ouvert. Exigences : rire facile, esprit joueur"
• "3h pour prouver que ton café vaut le détour"

STRUCTURE ULTRA-SIMPLE :
1. UNE PHRASE qui crée la réaction (humour/tension/mystère)
2. [OPTIONNEL] UNE DEUXIÈME PHRASE qui amplifie ou retourne

EXEMPLES CONCRETS D'EXCELLENCE :

✅ "Champion du monde de procrastination. Je te répondrai… probablement"
✅ "Mon pire défaut : brûler l'eau. Mon meilleur : t'en faire rire"
✅ "Horoscope : Croissant ascendant Pistache"
✅ "Je ne suis pas pour toi si Friends c'est pas ta came"
✅ "3h pour prouver que ton café vaut le détour. Sinon je gagne"
✅ "Mon CV dit développeur. Ma mère dit geek"
✅ "Cuisinier hors pair, capable de brûler même de l'eau"
✅ "Je suis venu pour voler ton cœur et tes sweats à capuche"

MAUVAIS EXEMPLES (à ne JAMAIS faire) :

❌ "J'aime voyager, faire du sport, sortir entre amis et profiter de la vie" (trop long, clichés, zéro personnalité)
❌ "Je suis quelqu'un de gentil, drôle et loyal qui cherche une relation sérieuse" (adjectifs vides, ennuyeux)
❌ "Passionné de moto, fan de séries, j'adore les bons restos et les soirées détente" (liste de passions = profil mort)
❌ "Hey ! Je m'appelle Marc, j'ai 28 ans, je travaille dans la finance. J'aime sortir le week-end avec mes potes" (trop long, CV ennuyeux)

CONSIGNES POUR LA GÉNÉRATION :

• Utilise la DESCRIPTION PERSONNALITÉ fournie (texte complet de l'utilisateur) comme boussole absolue
• Analyse son caractère, son humour, ses traits de personnalité pour choisir le bon type de bio
• Si personnalité = "sarcastique, humour noir" → privilégie TYPE ABSURDE ou TYPE TENSION
• Si personnalité = "mystérieux, joueur, intrigue" → privilégie TYPE MYSTÈRE
• Si personnalité = "ambitieux, confiant, direct" → privilégie TYPE DIRECT
• NE MENTIONNE PAS ses passions/anecdotes SAUF si tu peux en faire une punchline ultra-courte
• Exemple : Si passion = "moto" → ❌ "Passionné de moto" ✅ "Mon psy dit que j'aime trop ma moto. Il a raison"
• Si job = intéressant → tu PEUX en faire une punchline : "Mon CV dit avocat. Ma mère dit menteur professionnel"
• FOCUS TOTAL sur humour/tension/intrigue, PAS sur décrire sa vie

════════════════════════════════════════════════════════════════
SECTION 4 : PSYCHOLOGIE FÉMININE & INTERDITS ABSOLUS
════════════════════════════════════════════════════════════════

PSYCHOLOGIE (ce qui marche vraiment) :
• L'humour intelligent = signal de confiance et d'intelligence
• L'autodérision = montre qu'on ne se prend pas trop au sérieux (sexy)
• Le mystère = crée la curiosité et l'envie d'en savoir plus
• La tension légère = crée l'attraction (pas trop gentil/accessible)
• La confiance assumée > nice guy qui s'excuse d'exister

INTERDITS ABSOLUS (ça tue ton profil à 100%) :
• "J'aime voyager" / "J'aime le sport" / "J'aime les bons restos" / "Profiter de la vie"
• "Pas de drama" / "Pas de prise de tête" / "Si tu es ennuyeuse, swipe à gauche" (négativisme)
• Lister ses qualités ("gentil, drôle, loyal, ambitieux") = vide de sens
• Bio vide (tu perds 50% de matchs potentiels)
• Pavé de texte de plus de 280 caractères
• Fautes d'orthographe (détruit ta crédibilité instantanément)
• Trop d'emojis (max 1 pour souligner, idéalement zéro)
• Mensonges sur tes intentions (filtre mal et attire mauvais matchs)

LONGUEUR & FORMAT OPTIMAL :
• 15-25 mots = parfait (lu en 1-2 secondes)
• 1-2 lignes maximum
• Phrases courtes et percutantes qui "claquent"
• 0-1 emoji MAX (et seulement si ça renforce la punchline)
• Pas de saut de ligne (trop court pour ça)

COHÉRENCE PHOTOS-BIO :
• Pas obligé de mentionner ses passions dans la bio
• La bio doit juste créer une RÉACTION (humour/tension/mystère)
• Les passions/activités seront visibles dans ses photos

════════════════════════════════════════════════════════════════
DONNÉES UTILISATEUR À ANALYSER
════════════════════════════════════════════════════════════════

${JSON.stringify(analysisData, null, 2)}

════════════════════════════════════════════════════════════════
RETOURNE CE JSON STRICT (sans markdown, sans backticks, sans commentaires)
════════════════════════════════════════════════════════════════

{
  "diagnostic": "string",
  "photos_order_recommendation": "string",
  "optimized_bios": [
    {
      "text": "string",
      "type": "string",
      "why": "string"
    }
  ],
  "match_projection": {
    "current_weekly": number,
    "projected_weekly": number,
    "explanation": "string"
  },
  "signature_positioning": "string"
}

════════════════════════════════════════════════════════════════
RÈGLES STRICTES POUR CHAQUE CHAMP DU JSON
════════════════════════════════════════════════════════════════

─── DIAGNOSTIC (2 paragraphes max) ───
• Analyse les photos actuelles : qualité, lumière, couleurs, composition
• Pointe les erreurs précises : photos ternes/floues, trop de selfies, absence d'extérieur, lunettes de soleil en 1ère, manque de couleurs vives
• Analyse la bio actuelle : détecte les clichés ("voyages/sport/restos"), manque d'accroche, trop longue, ennuyeuse
• Détecte mentalité "nice guy" si présente (trop accessible, pas assez mystérieux/confiant)
• Ton : coach direct, sans langue de bois, orienté solutions concrètes
• JAMAIS mentionner "réponses à des questions" ou "formulaire"
• Langage simple et accessible (ZÉRO jargon technique)

─── OPTIMIZED_BIOS (exactement 4 bios différentes) ───
• Génère EXACTEMENT 4 bios différentes avec des TYPES et ACCROCHES variées
• Chaque bio doit être MAX 2 lignes, 25 mots MAXIMUM
• Les 4 bios doivent représenter des approches différentes :
  1. Une bio TYPE ABSURDE (humour décalé)
  2. Une bio TYPE TENSION (taquinerie légère)
  3. Une bio TYPE MYSTÈRE (intrigue immédiate)
  4. Une bio TYPE DIRECT (confiance assumée)
• TOUTES basées sur SA DESCRIPTION PERSONNALITÉ complète
• Chaque bio doit avoir une accroche DIFFÉRENTE pour tester ce qui marche
• Format de chaque bio :
  * text: la bio complète (MAX 25 mots)
  * type: le type utilisé ("Absurde", "Tension", "Mystère", "Direct")
  * why: 1 phrase courte expliquant pourquoi ce type correspond à sa personnalité
• JAMAIS de clichés : "voyages", "sport", "bon resto", "profiter de la vie"
• JAMAIS lister ses passions (sauf punchline ultra-courte)
• JAMAIS d'adjectifs vides ("gentil, drôle, loyal")
• Orthographe parfaite sur chaque bio
• 0-1 emoji MAX par bio (pas obligatoire)
• Ton : percutant, mémorable, crée de l'émotion instantanée

─── PHOTOS_ORDER_RECOMMENDATION (1 paragraphe) ───
• INSISTE sur 1ère photo = clé absolue du succès (lumière naturelle + couleur vive vêtement + regard masculin)
• Mentionne la règle : photos extérieur > intérieur (+19% réactions)
• Recommande des couleurs de vêtements PRÉCISES : rouge, bleu électrique, vert émeraude, orange vif (pas noir/gris)
• Conseille le timing : golden hour (lever/coucher soleil) ou lumière naturelle indirecte
• Ordonne les 5 types de photos selon sa vibe et sa cible (utilise ses lifestyle, vibe, passions)
• Vérifie qu'il a bien les 5 types : portrait HD, en pied, passion, preuve sociale, intrigue
• Langage simple et accessible

─── MATCH_PROJECTION.PROJECTED_WEEKLY ───
• Calcul réaliste : entre +50% et +200% de current_weekly selon qualité des données
• Si current_matches = "0-2" et profil catastrophique → +50% à +80%
• Si current_matches = "3-5" et bon potentiel → +100% à +150%
• Si current_matches = "6-10" et excellent profil → +150% à +200%

─── MATCH_PROJECTION.EXPLANATION ───
• 1-2 phrases simples et réalistes
• Mentionne l'impact de la première photo captivante + être sélectif (30% max) + bio percutante + timing dimanche soir
• Langage accessible (pas de jargon)

─── SIGNATURE_POSITIONING (1 phrase) ───
• Phrase masculine assumée avec confiance calibrée
• JAMAIS apologétique ou "nice guy"
• Résume son identité projetée de façon affirmée et claire
• Exemple : "Le mec mystérieux qui cache un cœur sensible sous l'attitude détachée"
• Exemple : "Le sportif dominant qui prend soin de son entourage sans s'excuser"

════════════════════════════════════════════════════════════════
RAPPEL FINAL : LANGAGE SIMPLE ET ACCESSIBLE
════════════════════════════════════════════════════════════════

JAMAIS utiliser ces termes dans le JSON final destiné au client :
❌ "HOOK viral"
❌ "DHV" (Demonstrating High Value)
❌ "PhotoImpact"
❌ "Sélectivité algorithmique"
❌ "Frame virale"

À la place, utilise :
✅ "première photo qui attire l'attention"
✅ "montrer ta valeur naturellement"
✅ "photos de qualité"
✅ "être sélectif"
✅ "première impression"

Le client doit comprendre IMMÉDIATEMENT sans avoir besoin d'un dictionnaire marketing.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system: `Tu es Mike de Dragueur de Paris, le meilleur coach en séduction masculine français. Tu as aidé des centaines d'hommes à transformer leurs profils Tinder et obtenir +100 likes par semaine. Tu maîtrises parfaitement la psychologie féminine et les stratégies de dating modernes.

EXPERTISE :
• Bios ultra-courtes (max 2 lignes, 15-25 mots) qui créent une RÉACTION immédiate
• 4 types de bios : absurde, tension, mystère, direct
• Première impression qui capte l'attention en moins d'1 seconde (lumière + couleur + mystère masculin)
• Algorithme Tinder 2026 (sélectivité, engagement, timing optimal, Smart Photos)
• Photos qui génèrent +150% de matchs (extérieur +19%, éviter selfies -8%, haute qualité)
• Élimination totale des clichés (jamais "voyages/sport/restos/profiter de la vie")

PRINCIPES CLÉS :
• Règle 3/10 : swiper maximum 30% des profils pour être valorisé par l'algorithme
• Dimanche 21h-23h : pic absolu d'activité féminine (moment boost)
• Première photo : couleur vive + lumière naturelle + regard masculin confiant
• Bio : MAX 2 lignes (15-25 mots) avec humour/tension/mystère (PAS de liste de passions)
• Utilise la DESCRIPTION PERSONNALITÉ complète de l'utilisateur (qui il est vraiment) comme boussole absolue

TON : Direct, stratégique, sans bullshit, orienté résultats concrets. Coach élite qui transforme les profils en aimants à matchs. LANGAGE SIMPLE ET ACCESSIBLE : pas de jargon technique, pas de termes marketing. Le client doit comprendre immédiatement.

FORMAT : Fournis uniquement du JSON valide, sans markdown, sans backticks, sans commentaires. Langue : français exclusivement.`,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const content = message.content[0]
    if (content.type === 'text') {
      // Remove markdown code blocks if present
      let jsonText = content.text.trim()
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      }
      
      const plan = JSON.parse(jsonText)
      return plan
    }

    throw new Error('Unexpected response format from Claude')
  } catch (error) {
    console.error('Claude API error:', error)
    throw error
  }
}
