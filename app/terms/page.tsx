import Link from 'next/link'

export const metadata = {
  title: "Conditions Générales d'Utilisation — Crushmaxxing",
  description: "Conditions Générales d'Utilisation du service Crushmaxxing.",
}

export default function TermsPage() {
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
        <Link href="/" className="text-sm font-inter text-text-secondary hover:text-white transition-colors">
          ← Retour
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-20">
        <h1 className="font-montserrat font-black text-3xl md:text-4xl mb-2">
          {"Conditions Générales d'Utilisation"}
        </h1>
        <p className="text-text-secondary text-sm mb-12 font-inter">
          Dernière mise à jour : [DATE]
        </p>

        <div className="space-y-12 font-inter text-text-secondary leading-relaxed">

          {/* Art. 1 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">Article 1 — Objet</h2>
            <p className="text-sm mb-3">
              Les présentes Conditions Générales d&apos;Utilisation (ci-après « <strong className="text-white">CGU</strong> ») régissent l&apos;accès et l&apos;utilisation du service <strong className="text-white">Crushmaxxing</strong>, accessible à l&apos;adresse <strong className="text-white">crushmaxxing.com</strong>.
            </p>
            <p className="text-sm mb-3">Crushmaxxing est un service d&apos;optimisation de profils de rencontres basé sur l&apos;intelligence artificielle. Il permet notamment :</p>
            <ul className="list-disc list-inside space-y-1 text-sm mb-4">
              <li>L&apos;analyse personnalisée d&apos;un profil de rencontre</li>
              <li>La génération d&apos;un plan d&apos;optimisation</li>
              <li>La génération de photos de profil par intelligence artificielle</li>
              <li>La génération de biographies personnalisées</li>
            </ul>
            <p className="text-sm mb-2">Le Service est édité par :</p>
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-4 space-y-1 text-sm">
              <p>[Nom / Raison sociale]</p>
              <p>[Forme juridique]</p>
              <p>[Adresse complète]</p>
              <p>[SIRET]</p>
              <p>Email : <strong className="text-white">[email]</strong></p>
            </div>
          </section>

          {/* Art. 2 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">Article 2 — Acceptation des CGU</h2>
            <p className="text-sm mb-3">
              L&apos;accès et l&apos;utilisation du Service impliquent l&apos;acceptation pleine et entière des présentes CGU.
            </p>
            <p className="text-sm mb-3">
              En créant un compte sur crushmaxxing.com, l&apos;utilisateur reconnaît avoir lu, compris et accepté sans réserve les présentes CGU ainsi que la{' '}
              <Link href="/privacy" className="text-white underline hover:opacity-70 transition-opacity">
                Politique de Confidentialité
              </Link>.
            </p>
            <p className="text-sm">
              Crushmaxxing se réserve le droit de modifier les présentes CGU à tout moment. Les modifications prennent effet dès leur publication. L&apos;utilisateur sera informé par email en cas de modification substantielle.
            </p>
          </section>

          {/* Art. 3 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">Article 3 — Accès au Service</h2>
            <h3 className="font-montserrat font-semibold text-white mb-2">3.1 Conditions d&apos;accès</h3>
            <p className="text-sm mb-4">
              Le Service est accessible à toute personne physique majeure (18 ans ou plus) disposant d&apos;une connexion internet et d&apos;un compte valide. Le Service est destiné à un usage strictement personnel et non commercial.
            </p>
            <h3 className="font-montserrat font-semibold text-white mb-2">3.2 Disponibilité</h3>
            <p className="text-sm">
              Crushmaxxing s&apos;efforce d&apos;assurer la disponibilité du Service 24h/24 et 7j/7. Toutefois, l&apos;Éditeur se réserve le droit d&apos;interrompre temporairement l&apos;accès pour des opérations de maintenance, de mise à jour ou en cas de force majeure, sans que cela puisse ouvrir droit à une indemnisation.
            </p>
          </section>

          {/* Art. 4 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">Article 4 — Création de compte</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">4.1 Inscription</h3>
                <p className="text-sm">Pour accéder aux fonctionnalités du Service, l&apos;utilisateur doit créer un compte en fournissant une adresse email valide et un mot de passe sécurisé, ou en utilisant la connexion Google.</p>
              </div>
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">4.2 Identifiants</h3>
                <p className="text-sm">L&apos;utilisateur est seul responsable de la confidentialité de ses identifiants. Il s&apos;engage à ne pas les communiquer à des tiers et à notifier immédiatement Crushmaxxing en cas d&apos;utilisation non autorisée de son compte.</p>
              </div>
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">4.3 Exactitude des informations</h3>
                <p className="text-sm">L&apos;utilisateur garantit que les informations fournies (profil, photos, données personnelles) sont exactes, sincères et ne portent pas atteinte aux droits de tiers.</p>
              </div>
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">4.4 Unicité du compte</h3>
                <p className="text-sm">Chaque utilisateur ne peut détenir qu&apos;un seul compte. La création de comptes multiples à des fins de contournement est strictement interdite.</p>
              </div>
            </div>
          </section>

          {/* Art. 5 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">{"Article 5 — Responsabilités de l'utilisateur"}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">5.1 Usage conforme</h3>
                <p className="text-sm">{"L'utilisateur s'engage à utiliser le Service conformément aux lois en vigueur, aux présentes CGU et aux bonnes mœurs."}</p>
              </div>
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">5.2 Contenu soumis</h3>
                <p className="text-sm mb-2">{"L'utilisateur est seul responsable des contenus qu'il soumet. Il garantit notamment :"}</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{"Être l'auteur ou détenir les droits sur les photos soumises"}</li>
                  <li>{"Que les photos soumises le représentent personnellement"}</li>
                  <li>{"Que les contenus ne contiennent pas de données relatives à des tiers sans leur consentement"}</li>
                  <li>{"Que les contenus ne sont pas illicites, diffamatoires ou portant atteinte à des droits de tiers"}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">5.3 Usage des contenus générés</h3>
                <p className="text-sm mb-2">{"Les photos et biographies générées sont destinées à un usage personnel. L'utilisateur s'interdit :"}</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{"Toute utilisation commerciale sans accord préalable"}</li>
                  <li>{"L'utilisation des contenus pour induire des tiers en erreur de manière frauduleuse"}</li>
                  <li>{"La revente ou redistribution des contenus générés"}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">5.4 Comportements interdits</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{"Toute tentative de contournement des mesures de sécurité"}</li>
                  <li>{"L'utilisation de robots ou scripts automatisés"}</li>
                  <li>{"La tentative d'accès aux données d'autres utilisateurs"}</li>
                  <li>{"L'utilisation du Service à des fins illicites"}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Art. 6 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">Article 6 — Paiement et crédits</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">6.1 Modèle économique</h3>
                <p className="text-sm">{"Le Service fonctionne sur la base d'un système de "}<strong className="text-white">crédits</strong>{". Certaines fonctionnalités (génération de photos, génération de biographies) nécessitent la consommation de crédits préalablement achetés."}</p>
              </div>
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">6.2 Traitement du paiement</h3>
                <p className="text-sm">{"Les paiements sont traités exclusivement via "}<strong className="text-white">Stripe</strong>{", prestataire de paiement sécurisé. Crushmaxxing ne stocke à aucun moment les informations bancaires de l'utilisateur."}</p>
              </div>
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">6.3 Droit de rétractation</h3>
                <p className="text-sm">{"Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contenus numériques dont l'exécution a commencé avec l'accord exprès de l'utilisateur et sa renonciation à son droit de rétractation. En utilisant les crédits achetés, l'utilisateur reconnaît expressément y renoncer."}</p>
              </div>
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">6.4 Remboursement</h3>
                <p className="text-sm">{"Les crédits achetés et non consommés sont remboursables dans un délai de 14 jours suivant l'achat, sous réserve qu'aucun crédit n'ait été utilisé. Passé ce délai, les crédits ne sont ni remboursables ni transférables."}</p>
              </div>
            </div>
          </section>

          {/* Art. 7 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">Article 7 — Résiliation</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">{"7.1 Résiliation par l'utilisateur"}</h3>
                <p className="text-sm">{"L'utilisateur peut supprimer son compte à tout moment depuis "}<strong className="text-white">{"Paramètres → Supprimer mon compte"}</strong>{". La suppression est immédiate et irréversible. Les crédits restants sont définitivement perdus et ne donnent lieu à aucun remboursement."}</p>
              </div>
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">7.2 Résiliation par Crushmaxxing</h3>
                <p className="text-sm mb-2">{"Crushmaxxing se réserve le droit de résilier un compte en cas de violation des présentes CGU, notamment :"}</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{"Soumission de contenus illicites"}</li>
                  <li>{"Utilisation frauduleuse du Service"}</li>
                  <li>{"Tentative de contournement des mesures de sécurité"}</li>
                  <li>{"Non-paiement"}</li>
                </ul>
                <p className="text-sm mt-2">{"En cas de résiliation pour faute, les crédits restants ne sont pas remboursés."}</p>
              </div>
            </div>
          </section>

          {/* Art. 8 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">Article 8 — Suspension de compte</h2>
            <p className="text-sm mb-3">{"Crushmaxxing peut suspendre temporairement un compte en cas de :"}</p>
            <ul className="list-disc list-inside space-y-1 text-sm mb-3">
              <li>{"Suspicion de violation des CGU en cours d'investigation"}</li>
              <li>{"Activité anormale ou suspecte"}</li>
              <li>{"Demande des autorités compétentes"}</li>
            </ul>
            <p className="text-sm">{"L'utilisateur concerné sera notifié dans les meilleurs délais. En cas de suspension injustifiée, les crédits non utilisés seront remboursés."}</p>
          </section>

          {/* Art. 9 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">Article 9 — Propriété intellectuelle</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">{"9.1 Propriété de l'Éditeur"}</h3>
                <p className="text-sm">{"Le Service, son code source, son interface graphique, ses algorithmes, ses marques et logos sont la propriété exclusive de Crushmaxxing. Toute reproduction ou exploitation non autorisée est interdite."}</p>
              </div>
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">{"9.2 Contenus soumis par l'utilisateur"}</h3>
                <p className="text-sm">{"L'utilisateur conserve la propriété de ses contenus et accorde à Crushmaxxing une licence non exclusive pour les traiter dans le seul but d'exécuter les fonctionnalités du Service. Cette licence prend fin à la suppression du compte."}</p>
              </div>
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">9.3 Contenus générés</h3>
                <p className="text-sm">{"Les photos et biographies générées sont mises à disposition de l'utilisateur pour un usage personnel sur les applications de rencontres."}</p>
              </div>
            </div>
          </section>

          {/* Art. 10 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">Article 10 — Limitation de responsabilité</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">10.1 Nature des résultats</h3>
                <p className="text-sm">{"Les résultats produits par le Service sont générés par des algorithmes et des intelligences artificielles. Crushmaxxing ne garantit pas de résultats spécifiques en termes de matchs ou d'interactions."}</p>
              </div>
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">10.2 Exclusion de responsabilité</h3>
                <p className="text-sm mb-2">{"Crushmaxxing ne saurait être tenu responsable :"}</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{"De l'utilisation faite des contenus générés"}</li>
                  <li>{"Des conséquences sur les applications de rencontres tierces"}</li>
                  <li>{"Des interruptions indépendantes de sa volonté"}</li>
                  <li>{"Des pertes de données résultant d'un comportement de l'utilisateur"}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-montserrat font-semibold text-white mb-2">10.3 Plafond</h3>
                <p className="text-sm">{"La responsabilité de Crushmaxxing est en tout état de cause limitée au montant payé par l'utilisateur au cours des 12 derniers mois précédant le fait générateur."}</p>
              </div>
            </div>
          </section>

          {/* Art. 11 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">Article 11 — Données personnelles</h2>
            <p className="text-sm">
              {"Le traitement des données personnelles est décrit dans notre "}
              <Link href="/privacy" className="text-white underline hover:opacity-70 transition-opacity">
                Politique de Confidentialité
              </Link>
              {", qui fait partie intégrante des présentes CGU."}
            </p>
          </section>

          {/* Art. 12 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">Article 12 — Cookies</h2>
            <p className="text-sm">
              {"Le Service utilise uniquement des cookies techniques strictement nécessaires à son fonctionnement. Aucun cookie publicitaire ou de tracking n'est utilisé. Pour plus de détails, voir notre "}
              <Link href="/privacy" className="text-white underline hover:opacity-70 transition-opacity">
                Politique de Confidentialité
              </Link>.
            </p>
          </section>

          {/* Art. 13 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">{"Article 13 — Droit applicable et juridiction"}</h2>
            <p className="text-sm mb-3">
              {"Les présentes CGU sont régies par le "}
              <strong className="text-white">droit français</strong>.
            </p>
            <p className="text-sm mb-3">
              {"En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, le litige sera soumis aux tribunaux compétents du ressort de "}
              <strong className="text-white">[ville du siège social]</strong>.
            </p>
            <p className="text-sm">
              {"Conformément aux articles L.611-1 et suivants du Code de la consommation, l'utilisateur a le droit de recourir gratuitement à un médiateur de la consommation. Médiateur compétent : "}
              <strong className="text-white">[à compléter]</strong>.
            </p>
          </section>

          {/* Art. 14 */}
          <section>
            <h2 className="font-montserrat font-bold text-xl text-white mb-4">Article 14 — Dispositions diverses</h2>
            <div className="space-y-3 text-sm">
              <p><strong className="text-white">Intégralité :</strong> {" Les présentes CGU constituent l'intégralité de l'accord entre l'utilisateur et Crushmaxxing."}</p>
              <p><strong className="text-white">Nullité partielle :</strong> {" Si une clause est déclarée nulle, les autres clauses restent en vigueur."}</p>
              <p><strong className="text-white">Non-renonciation :</strong> {" Le fait de ne pas se prévaloir d'un manquement ne constitue pas une renonciation à le faire ultérieurement."}</p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-primary/30 py-8 text-center text-text-secondary text-xs font-inter">
        <p>© 2026 Crushmaxxing — Tous droits réservés</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
          <Link href="/" className="hover:text-white transition-colors">Retour à l&apos;accueil</Link>
        </div>
      </footer>
    </div>
  )
}
