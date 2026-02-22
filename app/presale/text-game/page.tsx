import Link from 'next/link'
import { getPresaleCount } from '@/lib/presale'
import { PresaleLandingCTA } from './PresaleLandingCTA'
import { CountdownTimer } from '@/components/dashboard/CountdownTimer'

const DISPLAY_SLOTS = 50
const REAL_SLOTS = 200
const RATIO = REAL_SLOTS / DISPLAY_SLOTS

export default async function TextGamePresalePage() {
  const presaleCount = await getPresaleCount()
  const displayCount = Math.min(Math.floor(presaleCount / RATIO), DISPLAY_SLOTS)
  const remaining = DISPLAY_SLOTS - displayCount

  const ctaGoldStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #F77F00, #FFAA33)',
    boxShadow: '0 8px 32px rgba(247,127,0,0.3)',
  }

  return (
    <div className="min-h-screen bg-bg-primary">

      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(247,127,0,0.04), transparent 60%)' }}
      />

      {/* NAV */}
      <nav className="relative z-10 border-b border-border-primary">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-montserrat font-extrabold text-xl" style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Crushmaxxing
          </Link>
          <PresaleLandingCTA
            label="Réserver (-50%)"
            packType="pack_2"
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-black hover:scale-105 transition-transform"
            style={ctaGoldStyle}
          />
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gold-primary/10 border border-gold-primary/30 text-gold-primary px-5 py-2 rounded-full font-semibold text-sm mb-8">
            <span>⚡</span>
            <span>{remaining}/50 places restantes</span>
          </div>

          <h1 className="font-montserrat font-extrabold text-5xl md:text-6xl text-white mb-6 leading-tight">
            Arrête de galérer<br />à avoir des réponses
          </h1>

          <p className="text-xl text-text-secondary mb-10 leading-relaxed max-w-2xl mx-auto">
            L'IA qui analyse les profils et conversations,<br />
            puis génère les messages parfaits pour concrétiser.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PresaleLandingCTA
              label="Accès anticipé -50%"
              packType="pack_2"
              className="px-10 py-4 rounded-xl font-bold text-lg text-black hover:scale-[1.02] transition-transform disabled:opacity-50"
              style={ctaGoldStyle}
            />
            <Link
              href="#features"
              className="px-10 py-4 rounded-xl font-semibold text-lg border-2 border-border-primary text-white hover:border-gold-primary hover:text-gold-primary transition-all duration-200"
            >
              Voir les features →
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mt-10 text-sm text-text-tertiary flex-wrap">
            <span>✓ Sortie dans <CountdownTimer variant="days" /></span>
            <span>✓ -50% sur les packs</span>
            <span>✓ {remaining}/50 places</span>
          </div>

          {/* Screenshot placeholder */}
          <div className="mt-16 relative max-w-4xl mx-auto">
            <div className="border-2 border-gold-primary/30 rounded-2xl overflow-hidden shadow-2xl" style={{ boxShadow: '0 24px 60px rgba(247,127,0,0.12)' }}>
              <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary h-72 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-text-tertiary">Interface Text Game — preview bientôt disponible</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-8">
                <div className="bg-gold-primary text-black px-6 py-3 rounded-xl font-bold">
                  Disponible dans <CountdownTimer variant="days" color="#000" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LE PROBLÈME */}
      <section className="relative z-10 py-24 px-6 bg-bg-secondary">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-montserrat font-bold text-4xl text-white text-center mb-16">
            Tu matches... mais après ?
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { emoji: '😶', problem: 'Tu sais pas quoi dire', desc: "Le profil est vide, ou tu trouves pas d'angle d'approche" },
              { emoji: '👻', problem: 'Tes messages tombent à plat', desc: 'Elle répond pas, ou la conv meurt en 3 messages' },
              { emoji: '⏰', problem: 'Tu perds du temps', desc: 'Tu réfléchis 15min pour chaque message' },
              { emoji: '💸', problem: 'Tinder Premium ne sert à rien', desc: "Tu payes pour voir qui t'a liké... mais tu sais toujours pas quoi dire" },
            ].map((item, i) => (
              <div key={i} className="bg-bg-tertiary border border-border-primary rounded-2xl p-7">
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="font-montserrat font-bold text-xl text-white mb-2">{item.problem}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block bg-gold-primary/10 border border-gold-primary/30 text-gold-primary px-4 py-1.5 rounded-full font-semibold text-sm uppercase tracking-wide mb-4">
              La solution
            </div>
            <h2 className="font-montserrat font-bold text-4xl md:text-5xl text-white mb-4">
              2 features. 1 objectif :
            </h2>
            <p className="font-montserrat font-bold text-4xl md:text-5xl text-gold-primary">
              Concrétiser tes matchs
            </p>
          </div>

          {/* Feature 1 */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="w-14 h-14 bg-gold-primary/10 border border-gold-primary/30 rounded-2xl flex items-center justify-center text-3xl mb-5">💬</div>
              <h3 className="font-montserrat font-bold text-3xl text-white mb-4">Messages Accroche</h3>
              <p className="text-lg text-text-secondary mb-6 leading-relaxed">
                Upload le screenshot du profil. L'IA analyse la bio, les photos,
                et génère 5 accroches personnalisées avec un taux de réponse optimisé.
              </p>
              <ul className="space-y-3">
                {[
                  'Analyse photos + bio en 30 secondes',
                  '5 accroches adaptées à différents styles',
                  'Score de pertinence pour chaque message',
                  'Personnalisation selon tes préférences',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gold-primary/20 flex items-center justify-center text-gold-primary text-xs font-bold flex-shrink-0">✓</div>
                    <span className="text-text-secondary text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gold-primary/5 border-2 border-gold-primary/20 rounded-2xl p-8 flex items-center justify-center min-h-48">
              <div className="text-center">
                <div className="text-6xl mb-3">🪝</div>
                <p className="text-text-tertiary text-sm">Aperçu bientôt disponible</p>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-gold-primary/5 border-2 border-gold-primary/20 rounded-2xl p-8 flex items-center justify-center min-h-48">
              <div className="text-center">
                <div className="text-6xl mb-3">🎯</div>
                <p className="text-text-tertiary text-sm">Aperçu bientôt disponible</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="w-14 h-14 bg-gold-primary/10 border border-gold-primary/30 rounded-2xl flex items-center justify-center text-3xl mb-5">🎯</div>
              <h3 className="font-montserrat font-bold text-3xl text-white mb-4">Messages Discussion</h3>
              <p className="text-lg text-text-secondary mb-6 leading-relaxed">
                Upload la conversation. L'IA analyse le contexte, détecte les signaux,
                et génère les réponses parfaites pour obtenir son numéro ou proposer un date.
              </p>
              <ul className="space-y-3">
                {[
                  'Analyse complète du contexte de la conv',
                  "Détecte son niveau d'intérêt",
                  'Propose plusieurs angles de réponse',
                  'Optimise pour concrétiser (date/numéro)',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gold-primary/20 flex items-center justify-center text-gold-primary text-xs font-bold flex-shrink-0">✓</div>
                    <span className="text-text-secondary text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="relative z-10 py-24 px-6 bg-bg-secondary">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-gold-primary/10 border border-gold-primary/30 text-gold-primary px-4 py-1.5 rounded-full font-semibold text-sm uppercase tracking-wide mb-4">
              Simple & rapide
            </div>
            <h2 className="font-montserrat font-bold text-4xl text-white">
              3 étapes. 30 secondes.
            </h2>
          </div>

          <div className="space-y-10">
            {[
              { num: '1', title: 'Upload le screenshot', desc: "Profil ou conversation, directement depuis ton téléphone" },
              { num: '2', title: "L'IA analyse", desc: "Photos, bio, contexte... tout est pris en compte en 30 secondes" },
              { num: '3', title: 'Copie-colle le message', desc: "Choisis parmi les suggestions et envoie. C'est tout." },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-montserrat font-extrabold text-2xl text-black flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)', boxShadow: '0 8px 24px rgba(247,127,0,0.3)' }}
                >
                  {step.num}
                </div>
                <div className="pt-3">
                  <h3 className="font-montserrat font-bold text-xl text-white mb-2">{step.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-gold-primary/10 border border-gold-primary/30 text-gold-primary px-4 py-1.5 rounded-full font-semibold text-sm uppercase tracking-wide mb-4">
              Offre de lancement
            </div>
            <h2 className="font-montserrat font-bold text-4xl md:text-5xl text-white mb-4">
              Sois parmi les 50 premiers
            </h2>
            <p className="text-text-secondary text-lg">
              1 abonnement. Accès illimité aux 2 features. Pour toujours.
            </p>
          </div>

          {/* Card unique */}
          <div
            className="rounded-3xl p-10 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #F77F00, #D46400)', boxShadow: '0 24px 64px rgba(247,127,0,0.35)' }}
          >
            <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 25% 25%, #fff, transparent 55%)' }} />
            <div className="relative z-10">
              <div className="inline-flex bg-black/25 px-4 py-1.5 rounded-full font-semibold text-sm text-white mb-7">
                🔥 Offre de lancement
              </div>

              <div className="mb-8">
                <div className="font-montserrat font-extrabold text-7xl text-white mb-2">19,90€</div>
                <div className="text-white/90 text-xl">par mois • Illimité à vie</div>
              </div>

              <ul className="space-y-5 mb-9">
                {[
                  { title: 'Messages Accroche illimités', desc: "Upload un profil, génère autant d'accroches que tu veux" },
                  { title: 'Messages Discussion illimités', desc: 'Analyse tes conversations et génère les réponses parfaites' },
                  { title: 'Accès à vie', desc: "Tant que tu restes abonné, c'est illimité. Pour toujours." },
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-white">
                    <span className="text-xl font-bold mt-0.5">✓</span>
                    <div>
                      <div className="font-semibold mb-0.5">{f.title}</div>
                      <p className="text-white/75 text-sm">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <PresaleLandingCTA
                label="Réserver ma place (19,90€/mois)"
                packType="text_game"
                className="w-full py-5 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl mb-4 disabled:opacity-50"
                style={{ backgroundColor: '#ffffff', color: '#D46400' }}
              />

              <p className="text-center text-white/70 text-sm">
                ✓ Sans engagement • Annule quand tu veux
              </p>

              <div className="mt-7 pt-7 border-t border-white/20 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-white/70 text-sm mb-1">Places restantes</p>
                  <p className="font-montserrat font-bold text-3xl text-white">{remaining} / 50</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm mb-1">Sortie dans</p>
                  <div className="font-montserrat font-bold text-3xl text-white">
                    <CountdownTimer variant="inline" color="#ffffff" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 py-24 px-6 bg-bg-secondary">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-montserrat font-bold text-4xl text-white text-center mb-14">
            Questions fréquentes
          </h2>

          <div className="space-y-4">
            {[
              { q: "Quand est-ce que ça sort exactement ?", a: "La sortie est prévue dans 4 jours, le 26 février. Les 50 premiers auront un accès anticipé avant tout le monde." },
              { q: "Comment l'IA analyse les profils et conversations ?", a: "L'IA analyse les photos, la bio, et le contexte de conversation pour générer des messages personnalisés en moins de 30 secondes." },
              { q: "Est-ce que c'est détectable par les apps de dating ?", a: "Non. Tu copies-colles les messages générés comme si tu les avais écrits. Aucune automatisation, aucune intégration avec les apps. 100% safe." },
              { q: "Est-ce que c'est un abonnement ou un achat unique ?", a: "C'est un abonnement mensuel à 19,90€/mois. Tant que tu restes abonné, tu as accès illimité aux deux features. Tu peux annuler à tout moment." },
              { q: "Que se passe-t-il après les 50 places ?", a: "Après les 50 places, l'offre -50% ne sera plus disponible. Les prochains utilisateurs paieront le prix normal." },
              { q: "Ça fonctionne sur toutes les dating apps ?", a: "Oui ! Tinder, Bumble, Hinge, Fruitz, Happn... Tant que tu peux faire un screenshot, ça fonctionne." },
            ].map((faq, i) => (
              <details key={i} className="bg-bg-tertiary border border-border-primary rounded-xl p-5 group cursor-pointer hover:border-gold-primary/40 transition-colors">
                <summary className="font-semibold text-white list-none flex justify-between items-center">
                  <span>{faq.q}</span>
                  <span className="text-gold-primary ml-4 flex-shrink-0 transition-transform group-open:rotate-180">▼</span>
                </summary>
                <p className="text-text-secondary text-sm mt-4 pt-4 border-t border-border-primary leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gold-primary/10 border-2 border-gold-primary/30 rounded-3xl p-14">
            <h2 className="font-montserrat font-bold text-4xl md:text-5xl text-white mb-5">
              Ne rate pas les 50 places
            </h2>
            <p className="text-text-secondary text-lg mb-10 leading-relaxed">
              Accès anticipé + -50% sur les packs.<br />
              L'offre disparaît dès les 50 places atteintes.
            </p>
            <PresaleLandingCTA
              label="Réserver mon accès anticipé"
              packType="pack_2"
              className="px-12 py-5 rounded-xl font-bold text-xl text-black hover:scale-105 transition-transform disabled:opacity-50 mb-8"
              style={ctaGoldStyle}
            />
            <div className="flex items-center justify-center gap-10 text-text-tertiary flex-wrap">
              <div>
                <span className="font-montserrat font-bold text-2xl text-gold-primary">{remaining}/50</span>
                <span className="ml-1.5 text-sm">places</span>
              </div>
              <div className="text-border-primary">•</div>
              <div>
                <span className="font-montserrat font-bold text-2xl text-gold-primary">-50%</span>
                <span className="ml-1.5 text-sm">sur les packs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-border-primary py-10 px-6 text-center">
        <p className="text-text-tertiary text-sm mb-3">© 2026 Crushmaxxing. Tous droits réservés.</p>
        <div className="flex justify-center gap-6 text-text-tertiary text-sm">
          <a href="#" className="hover:text-gold-primary transition-colors">CGU</a>
          <a href="#" className="hover:text-gold-primary transition-colors">Confidentialité</a>
          <Link href="/dashboard/home" className="hover:text-gold-primary transition-colors">Dashboard</Link>
        </div>
      </footer>
    </div>
  )
}
