import Link from 'next/link'

export const metadata = {
  title: 'Politique de confidentialité — Crushmaxxing',
  description: 'Politique de confidentialité et protection des données personnelles de Crushmaxxing.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-bg-primary/90 backdrop-blur-sm border-b border-border-primary/30">
        <Link
          href="/"
          className="font-montserrat font-extrabold text-xl"
          style={{
            background: 'linear-gradient(135deg, #E63946, #FF4757)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Crushmaxxing
        </Link>
        <Link
          href="/"
          className="text-sm font-inter text-text-secondary hover:text-white transition-colors"
        >
          ← Retour
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-20">
        <h1 className="font-montserrat font-black text-3xl md:text-4xl mb-2">
          Politique de confidentialité
        </h1>
        <p className="text-text-secondary text-sm mb-12 font-inter">
          Dernière mise à jour : [DATE]
        </p>

        <div className="space-y-12 font-inter text-text-secondary leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">
              1. Responsable du traitement
            </h2>
            <p className="mb-3">
              Le responsable du traitement des données personnelles collectées via le site{' '}
              <strong className="text-white">crushmaxxing.com</strong> est :
            </p>
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-4 space-y-1 text-sm">
              <p>[Nom / Raison sociale]</p>
              <p>[Forme juridique]</p>
              <p>[Adresse complète]</p>
              <p>[SIRET]</p>
              <p>Email de contact : <strong className="text-white">[email]</strong></p>
            </div>
            <p className="mt-3 text-sm">
              Ci-après désigné « <strong className="text-white">Crushmaxxing</strong> » ou « nous ».
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-6">
              2. Données collectées et finalités
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-3">
                  2.1 Données d&apos;authentification
                </h3>
                <p className="mb-2 text-sm font-semibold text-white">Données collectées :</p>
                <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                  <li>Adresse email</li>
                  <li>Mot de passe (chiffré, jamais stocké en clair)</li>
                  <li>Identifiant utilisateur unique (UUID)</li>
                  <li>En cas de connexion via Google : email, nom, photo de profil</li>
                </ul>
                <p className="mb-2 text-sm font-semibold text-white">Finalité :</p>
                <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                  <li>Création et gestion du compte utilisateur</li>
                  <li>Authentification sécurisée</li>
                </ul>
                <p className="text-sm">
                  <span className="text-white font-semibold">Base légale :</span> exécution du contrat (Article 6.1.b RGPD)
                </p>
                <p className="text-sm mt-2">
                  Les données obtenues via Google OAuth sont utilisées exclusivement à des fins d&apos;authentification et de gestion de compte. Elles ne sont ni revendues, ni utilisées à des fins publicitaires.
                </p>
              </div>

              <div>
                <h3 className="font-montserrat font-semibold text-white mb-3">
                  2.2 Données de profil et d&apos;analyse
                </h3>
                <p className="mb-2 text-sm font-semibold text-white">Données fournies volontairement :</p>
                <ul className="list-disc list-inside space-y-1 text-sm mb-4 columns-2">
                  <li>Fréquence de matchs et ancienneté</li>
                  <li>Selfie</li>
                  <li>3 à 6 photos de profil</li>
                  <li>Taille, profession, sports, hobbies</li>
                  <li>Description de personnalité</li>
                  <li>Style de vie, ambiance recherchée</li>
                  <li>Anecdotes, passions</li>
                  <li>Objectif relationnel</li>
                  <li>Type de partenaire recherché</li>
                </ul>
                <p className="mb-2 text-sm font-semibold text-white">Finalité :</p>
                <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                  <li>Analyse personnalisée du profil</li>
                  <li>Génération d&apos;un plan d&apos;optimisation</li>
                  <li>Génération de biographies</li>
                  <li>Génération de photos optimisées</li>
                </ul>
                <p className="text-sm">
                  <span className="text-white font-semibold">Base légale :</span> exécution du contrat (Article 6.1.b RGPD). Certaines données relevant de la vie privée sont traitées sur la base du consentement explicite de l&apos;utilisateur (Article 6.1.a RGPD).
                </p>
              </div>

              <div>
                <h3 className="font-montserrat font-semibold text-white mb-3">
                  2.3 Données générées par intelligence artificielle
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                  <li>Plan d&apos;optimisation (format JSON)</li>
                  <li>Biographies générées</li>
                  <li>Photos générées</li>
                </ul>
                <p className="text-sm">
                  <span className="text-white font-semibold">Finalité :</span> fourniture des fonctionnalités principales du service.
                </p>
              </div>

              <div>
                <h3 className="font-montserrat font-semibold text-white mb-3">
                  2.4 Données de paiement
                </h3>
                <p className="text-sm mb-3">
                  Crushmaxxing <strong className="text-white">ne stocke pas les données bancaires.</strong>
                </p>
                <p className="mb-2 text-sm font-semibold text-white">Données conservées :</p>
                <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                  <li>Identifiant de session Stripe</li>
                  <li>Type de produit</li>
                  <li>Date de paiement</li>
                </ul>
                <p className="text-sm mb-2">
                  Les données de carte bancaire sont traitées exclusivement par Stripe.
                </p>
                <p className="text-sm">
                  <span className="text-white font-semibold">Base légale :</span> exécution du contrat (Article 6.1.b RGPD) ; obligation légale comptable (Article 6.1.c RGPD).
                </p>
              </div>

              <div>
                <h3 className="font-montserrat font-semibold text-white mb-3">
                  2.5 Données techniques
                </h3>
                <p className="mb-2 text-sm font-semibold text-white">Collectées automatiquement :</p>
                <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                  <li>Adresse IP</li>
                  <li>User-Agent</li>
                  <li>Logs serveur</li>
                </ul>
                <p className="text-sm">
                  <span className="text-white font-semibold">Base légale :</span> intérêt légitime (Article 6.1.f RGPD).
                </p>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">
              3. Durée de conservation
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border-primary">
                    <th className="text-left py-3 pr-6 font-semibold text-white">Catégorie</th>
                    <th className="text-left py-3 font-semibold text-white">Durée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary/40">
                  {[
                    ['Compte utilisateur', 'Durée du compte'],
                    ['Données profil & analyses', 'Durée du compte'],
                    ['Photos uploadées', 'Suppression automatique sous 24h'],
                    ['Photos générées', 'Suppression automatique sous 24h'],
                    ['Données de paiement (preuve)', '10 ans'],
                    ['Logs techniques', '12 mois'],
                  ].map(([cat, dur]) => (
                    <tr key={cat}>
                      <td className="py-3 pr-6">{cat}</td>
                      <td className="py-3 text-white">{dur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm">
              En cas de suppression de compte, les données en base sont supprimées immédiatement. Les fichiers de stockage résiduels sont supprimés automatiquement dans un délai maximum de 24 heures.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">
              4. Sous-traitants
            </h2>
            <p className="text-sm mb-4">Crushmaxxing fait appel aux prestataires suivants :</p>
            <div className="space-y-4">
              {[
                {
                  name: 'Supabase',
                  location: 'États-Unis',
                  role: 'Base de données, authentification, stockage',
                  note: 'Clauses contractuelles types / SOC 2',
                },
                {
                  name: 'Stripe',
                  location: 'États-Unis',
                  role: 'Paiement en ligne',
                  note: 'Conformité PCI-DSS',
                },
                {
                  name: 'Anthropic',
                  location: 'États-Unis',
                  role: "Génération IA (plans d'optimisation & biographies)",
                  note: 'SOC 2',
                },
                {
                  name: 'NanoBanana',
                  location: 'Localisation à préciser',
                  role: 'Génération photos IA',
                  note: '',
                },
                {
                  name: 'Vercel',
                  location: 'États-Unis',
                  role: "Hébergement de l'application",
                  note: 'SOC 2 Type II',
                },
                {
                  name: 'Google',
                  location: 'États-Unis',
                  role: 'Authentification OAuth',
                  note: 'SOC 2',
                },
              ].map((s) => (
                <div key={s.name} className="bg-bg-secondary border border-border-primary rounded-xl p-4 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">{s.name}</span>
                    <span className="text-xs text-text-secondary">{s.location}</span>
                  </div>
                  <p>{s.role}</p>
                  {s.note && <p className="text-xs mt-1 opacity-60">{s.note}</p>}
                </div>
              ))}
            </div>
          </section>

          {/* 5 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">
              5. Transferts hors Union Européenne
            </h2>
            <p className="text-sm mb-3">
              Certains sous-traitants sont situés aux États-Unis. Ces transferts sont encadrés par :
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm mb-4">
              <li>Clauses Contractuelles Types de la Commission européenne</li>
              <li>EU-US Data Privacy Framework lorsque applicable</li>
            </ul>
            <p className="text-sm font-semibold text-white mb-2">Données susceptibles d&apos;être transférées :</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Données de profil</li>
              <li>Photos</li>
              <li>Données de paiement</li>
              <li>Données d&apos;authentification</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">
              6. Sécurité
            </h2>
            <p className="text-sm mb-3">Mesures mises en œuvre :</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Chiffrement HTTPS (TLS)</li>
              <li>Mots de passe hashés</li>
              <li>Row Level Security activée sur toutes les tables</li>
              <li>Isolation des données par utilisateur</li>
              <li>Clés API stockées hors code source</li>
              <li>Suppression automatique des photos sous 24 heures</li>
              <li>Accès administrateur restreint et contrôlé</li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">
              7. Droits des utilisateurs
            </h2>
            <p className="text-sm mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                "Droit d'accès",
                'Droit de rectification',
                "Droit à l'effacement",
                'Droit à la portabilité',
                "Droit d'opposition",
                'Droit de retrait du consentement',
              ].map((right) => (
                <div key={right} className="bg-bg-secondary border border-border-primary rounded-lg px-4 py-3 text-sm text-white">
                  {right}
                </div>
              ))}
            </div>
            <p className="text-sm mb-2">
              Vous pouvez supprimer votre compte directement depuis l&apos;application (Paramètres → Supprimer mon compte).
            </p>
            <p className="text-sm">
              Vous pouvez introduire une réclamation auprès de la{' '}
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline hover:opacity-70 transition-opacity"
              >
                CNIL
              </a>.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">
              8. Cookies
            </h2>
            <p className="text-sm mb-3">
              Crushmaxxing utilise uniquement des cookies techniques strictement nécessaires :
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm mb-4">
              <li>Cookies de session Supabase (maintien de l&apos;authentification)</li>
              <li>Cookies Stripe lors du processus de paiement</li>
              <li>Cookies Google en cas d&apos;authentification OAuth</li>
            </ul>
            <p className="text-sm font-semibold text-white">
              Aucun cookie publicitaire ou analytique n&apos;est utilisé.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">
              9. Modifications
            </h2>
            <p className="text-sm mb-2">
              La présente politique peut être modifiée à tout moment. La version en vigueur est disponible à l&apos;adresse :
            </p>
            <p className="text-sm text-white font-semibold">
              https://crushmaxxing.com/privacy
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-primary/30 py-8 text-center text-text-secondary text-xs font-inter">
        <p>© 2026 Crushmaxxing — Tous droits réservés</p>
        <p className="mt-1">
          <Link href="/" className="hover:text-white transition-colors">Retour à l&apos;accueil</Link>
        </p>
      </footer>
    </div>
  )
}
