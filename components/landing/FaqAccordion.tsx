'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'Comment générer des photos Tinder réalistes avec l\'IA ?',
    a: 'Crushmaxxing utilise l\'IA pour générer des photos ultra-réalistes pour Tinder, Bumble et Hinge. Le processus est simple : tu upload 4-6 photos de toi, tu choisis parmi 12+ styles disponibles (Urban, Sport, Travel, etc.), et l\'IA génère des photos professionnelles en 5 minutes. Les photos sont indétectables et optimisées pour les algorithmes des apps de dating. Avec 130 crédits inclus, tu peux créer plusieurs variations et tester ce qui marche le mieux sur ton profil.',
  },
  {
    q: 'Les photos générées par l\'IA sont-elles vraiment indétectables sur Tinder ?',
    a: 'Oui, les photos générées par Crushmaxxing sont indétectables. Notre technologie IA crée des photos qui respectent les mêmes caractéristiques que des vraies photos : grain naturel, éclairage réaliste, proportions exactes. Même tes amis ne verront pas la différence. Des milliers d\'utilisateurs utilisent ces photos sur Tinder, Bumble, Hinge et Fruitz sans aucun problème. Les photos passent tous les contrôles de qualité des apps de dating.',
  },
  {
    q: 'Combien de temps faut-il pour générer des photos de profil Tinder ?',
    a: 'La génération de photos Tinder avec Crushmaxxing prend seulement 5 minutes. Voici le processus complet : upload de tes photos (30 secondes), choix du style (1 minute), génération IA (3 minutes), téléchargement (30 secondes). En moins de 10 minutes, tu as un profil Tinder complet avec des photos professionnelles optimisées. Pas besoin de photographe, pas de déplacement, tout se fait en ligne instantanément.',
  },
  {
    q: 'Est-ce que ça marche vraiment pour avoir plus de matchs sur Tinder ?',
    a: 'Oui, nos utilisateurs obtiennent en moyenne x3 à x5 plus de matchs après avoir optimisé leur profil avec Crushmaxxing. Les photos générées par l\'IA sont optimisées pour les algorithmes de Tinder, Bumble et Hinge : bon éclairage, cadrage professionnel, variété de styles. L\'analyse gratuite de ton profil actuel te montre exactement ce qui bloque tes matchs. Plus de 10 000 profils ont été transformés avec des résultats mesurables.',
  },
  {
    q: 'Quelle est la différence entre Crushmaxxing et un photographe professionnel ?',
    a: 'Crushmaxxing coûte 9,90€ vs 150-300€ pour un photographe. Avec l\'IA, tu génères des photos en 5 minutes vs une session d\'1-2 heures. Tu peux tester 12+ styles différents (Urban, Sport, Business, Travel) instantanément. Les photos IA sont optimisées spécifiquement pour Tinder et les apps de dating. Pas de rendez-vous à prendre, pas de déplacement, résultats immédiats. L\'IA permet aussi de générer des photos dans des contextes impossibles à organiser (voyage, sport, etc.).',
  },
  {
    q: 'Comment fonctionne l\'optimisation de profil Tinder avec l\'IA ?',
    a: 'L\'optimisation de profil Crushmaxxing analyse 5 éléments clés : qualité de tes photos actuelles, ordre des photos (photo de face en 1er), cohérence avec ta cible, qualité de ta bio, et ton positionnement général. L\'IA génère ensuite 4 bios personnalisées selon ton style (Direct, Drôle, Mystérieux, Intrigant) et te recommande l\'ordre optimal de tes photos. L\'analyse gratuite te montre ton score actuel et ton potentiel réel. En 10 minutes, tu passes d\'un profil moyen à un profil qui génère des résultats.',
  },
  {
    q: 'Ça fonctionne sur toutes les applications de rencontre ?',
    a: 'Oui, Crushmaxxing fonctionne sur toutes les apps de dating : Tinder, Bumble, Hinge, Fruitz, Happn, Once. Les photos sont générées au format portrait (3:4) qui fonctionne sur toutes les plateformes. L\'ordre des photos est optimisé selon les algorithmes de chaque app. La bio est adaptable à tous les profils. Un seul profil optimisé, des résultats sur toutes les apps de rencontre.',
  },
  {
    q: 'Combien coûte la génération de photos Tinder avec l\'IA ?',
    a: 'Crushmaxxing coûte 9,90€ en paiement unique. Ce prix inclut : 130 crédits pour générer des photos, analyse détaillée de ton profil actuel, 4 bios optimisées personnalisées, accès à 12+ styles de photos (Urban, Sport, Night, Travel, Business, etc.), recommandations d\'ordre de photos, et téléchargement illimité en HD. Pas d\'abonnement mensuel, pas de frais cachés. Tu paies une fois et tu génères autant de variations que tu veux avec tes crédits.',
  },
  {
    q: 'Mes données et photos sont-elles sécurisées ?',
    a: 'Oui, toutes tes données sont sécurisées et cryptées. Tes photos sont utilisées uniquement pour la génération IA et ne sont jamais partagées, revendues ou utilisées pour entraîner d\'autres modèles. Conformité RGPD complète. Tu peux supprimer tes données à tout moment. Les paiements sont sécurisés via Stripe. Aucune donnée personnelle n\'est conservée au-delà de la génération de tes photos.',
  },
  {
    q: 'Que faire si je ne suis pas satisfait des photos générées ?',
    a: 'Crushmaxxing offre une garantie satisfait ou remboursé 7 jours. Si les photos ne te conviennent pas, tu peux demander un remboursement complet sans justification. Avant de demander un remboursement, notre support peut t\'aider à optimiser les résultats : changer de style, ajuster les paramètres, ou régénérer avec de meilleures photos de base. Plus de 10 000 utilisateurs sont satisfaits, mais si ça ne te convient pas, remboursement garanti.',
  },
  {
    q: 'Puis-je générer des photos pour différents styles de dating (casual, sérieux, etc.) ?',
    a: 'Oui, Crushmaxxing propose 12+ styles adaptés à tous les objectifs dating : Night Style et Urban pour les relations casual, Business pour les relations sérieuses, Sport et Travel pour montrer un lifestyle actif, Food pour un côté authentique. Tu peux générer plusieurs sets de photos selon ta cible et ton objectif. Chaque style est optimisé pour attirer un type de profil spécifique.',
  },
  {
    q: 'Comment l\'IA génère-t-elle des photos qui me ressemblent vraiment ?',
    a: 'L\'IA de Crushmaxxing analyse tes photos de référence pour copier exactement : structure du visage, yeux, nez, bouche, teint de peau, cheveux et pilosité faciale. L\'IA respecte tes proportions exactes pour que la reconnaissance faciale puisse t\'identifier. Le résultat : des photos qui te ressemblent à 100% mais dans des contextes et avec une qualité professionnelle. C\'est toi, juste mieux photographié.',
  },
  {
    q: 'Quelle est la meilleure photo à mettre en premier sur Tinder ?',
    a: 'La meilleure première photo Tinder est une photo de face avec : bon éclairage naturel, fond travaillé mais pas chargé, toi en tenue casual-chic, regard confiant vers la caméra ou légèrement de côté. Crushmaxxing analyse ton profil et te dit exactement quelle photo mettre en 1er pour maximiser tes matchs. L\'algorithme Tinder favorise les profils avec une bonne première photo. Notre IA génère automatiquement ce type de photo optimisée selon les critères des apps de dating.',
  },
  {
    q: 'Puis-je utiliser les photos IA sur mon profil dating en toute légalité ?',
    a: 'Oui, les photos générées par Crushmaxxing t\'appartiennent à 100% et tu peux les utiliser librement sur toutes les apps de dating. Il n\'y a aucune restriction légale à utiliser des photos générées par IA sur Tinder, Bumble, Hinge ou autres. Les photos sont créées à partir de tes vraies photos, c\'est donc bien toi sur les images. Des milliers d\'utilisateurs les utilisent quotidiennement sans problème.',
  },
  {
    q: 'Combien de photos Tinder dois-je avoir sur mon profil pour maximiser mes matchs ?',
    a: 'Le nombre optimal de photos Tinder est 5-6 photos : 1 photo de face (photo principale), 2-3 photos lifestyle (sport, voyage, café), 1 photo sociale si possible, 1 photo qui montre ta personnalité. Moins de 4 photos = profil incomplet et peu de matchs. Plus de 7 photos = dilution de l\'attention. Crushmaxxing génère le mix parfait de photos pour maximiser tes swipes right sur toutes les apps.',
  },
]

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(faq => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.a,
    },
  })),
}

export function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIdx(openIdx === i ? null : i)

  return (
    <section className="relative z-10 px-6 md:px-12 py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-montserrat font-black text-4xl md:text-5xl text-white mb-4">
            Questions fréquentes
          </h2>
          <p className="text-text-secondary text-lg">Tout ce qu&apos;il faut savoir avant de commencer</p>
        </div>

        {/* Accordion */}
        <div
          className="flex flex-col gap-3"
          itemScope
          itemType="https://schema.org/FAQPage"
        >
          {FAQS.map((faq, i) => (
            <div
              key={i}
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
              className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                openIdx === i
                  ? 'border-red-primary/50 bg-red-primary/5'
                  : 'border-border-primary bg-bg-secondary hover:border-red-primary/30'
              }`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                itemProp="name"
              >
                <p className={`font-inter font-semibold text-base transition-colors ${openIdx === i ? 'text-white' : 'text-text-primary'}`}>
                  {faq.q}
                </p>
                <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  openIdx === i ? 'border-red-primary bg-red-primary rotate-45' : 'border-border-primary'
                }`}>
                  <span className={`font-bold text-sm transition-colors ${openIdx === i ? 'text-white' : 'text-text-secondary'}`}>+</span>
                </div>
              </button>

              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: openIdx === i ? '500px' : '0px' }}
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <p
                  className="font-inter text-text-secondary text-sm leading-relaxed px-6 pb-5"
                  itemProp="text"
                >
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
