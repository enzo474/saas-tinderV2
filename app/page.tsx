import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { IntroAnimation } from '@/components/IntroAnimation'
import { LandingDemoWrapper } from '@/components/landing/LandingDemoWrapper'
import { SocialProofMarquee } from '@/components/landing/SocialProofMarquee'
import { AppPreviewPhone } from '@/components/landing/AppPreviewPhone'
import { BioGenerator } from '@/components/landing/BioGenerator'
import { FaqAccordion } from '@/components/landing/FaqAccordion'

const STYLE_NAME_MAP: Record<string, string> = {
  night:    'Night',
  urban:    'Urban',
  sport:    'Sport',
  travel:   'Travel',
  food:     'Food',
  business: 'Business',
  beach:    'Beach',
  tennis:   'Tennis',
}

export default async function Home() {
  const supabase = await createClient()
  const { data: photoStyles } = await supabase
    .from('photo_styles')
    .select('style_name, preview_image_url')
    .eq('photo_number', 1)

  const styleImages: Record<string, string> = {}
  if (photoStyles) {
    for (const [id, name] of Object.entries(STYLE_NAME_MAP)) {
      const found = photoStyles.find(s =>
        s.style_name?.toLowerCase() === name.toLowerCase()
      )
      if (found?.preview_image_url) styleImages[id] = found.preview_image_url
    }
  }

  return (
    <IntroAnimation>
    <div className="min-h-screen bg-bg-primary text-white relative overflow-x-hidden">

      {/* ── NAVIGATION ── */}
      <nav className="relative z-10 flex items-center justify-between px-4 md:px-12 py-4 border-b border-border-primary bg-bg-primary/80 backdrop-blur-sm sticky top-0">
        <span
          className="font-montserrat font-extrabold text-xl md:text-2xl"
          style={{
            background: 'linear-gradient(135deg, #E63946, #FF4757)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Crushmaxxing
        </span>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/auth" className="hidden sm:block text-text-secondary hover:text-white text-sm font-medium transition-colors">
            Connexion
          </Link>
          <Link
            href="/auth"
            className="font-semibold text-sm whitespace-nowrap rounded-xl transition-all duration-300 hover:bg-red-primary/10"
            style={{
              color: '#E63946',
              border: '1.5px solid #E63946',
              padding: '0.35rem 0.9rem',
            }}
          >
            Commencer
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 py-24 md:py-36">
        {/* Glow blob */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] md:w-[600px] h-[400px] pointer-events-none animate-pulse-glow"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(230,57,70,0.12), transparent 70%)',
          }}
        />

        <h1 className="font-montserrat font-black text-4xl md:text-7xl leading-tight mb-6 max-w-4xl">
          <span className="text-white">Arrête d&apos;attendre</span><br />
          <span className="text-gradient-red">des matchs</span>
        </h1>

        <p className="text-text-secondary text-lg md:text-xl mb-10 max-w-xl leading-relaxed">
          Découvre pourquoi ton profil ne&nbsp;marche&nbsp;pas.<br />
          Analyse gratuite en 3 minutes.
        </p>

        <div className="flex flex-col items-center gap-4">
          <Link href="/onboarding/intro" className="btn-primary text-base md:text-lg">
            Analyser mon profil gratuitement
          </Link>
          <span className="text-text-tertiary text-sm">Résultats instantanés</span>
        </div>
      </section>

      {/* ── DEMO INTERACTIVE + STYLE CHANGE ── */}
      <LandingDemoWrapper styleImages={styleImages} />

      {/* ── APP PREVIEW PHONE ── */}
      <AppPreviewPhone />

      {/* ── BIO GENERATOR ── */}
      <BioGenerator />

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 px-6 md:px-12 py-24 bg-bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-montserrat font-bold text-4xl md:text-5xl mb-4 heading-gradient">
              Comment ça marche ?
            </h2>
            <p className="text-text-secondary text-lg">
              3 étapes simples pour transformer ton profil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Upload tes photos',
                description: 'Uploade 4-6 photos de toi. N\'importe quelle photo fera l\'affaire pour entraîner l\'IA.',
              },
              {
                step: '2',
                title: 'L\'IA analyse & génère',
                description: 'Notre IA analyse ton profil et génère des photos professionnelles adaptées à ta cible.',
              },
              {
                step: '3',
                title: 'Maximise tes matchs',
                description: 'Applique les recommandations, utilise tes nouvelles photos et regarde tes matchs exploser.',
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-montserrat font-black text-2xl text-white mb-5"
                  style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', boxShadow: '0 8px 24px rgba(230,57,70,0.4)' }}
                >
                  {item.step}
                </div>
                <h3 className="font-montserrat font-bold text-xl text-white mb-3">{item.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="relative z-10 py-24">
        <div className="text-center mb-12 px-6 md:px-12">
          <h2 className="font-montserrat font-black text-4xl md:text-5xl text-white">
            Ils étaient{' '}
            <span style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              invisibles
            </span>
          </h2>
        </div>
        <SocialProofMarquee />
      </section>

      {/* ── PRICING ── */}
      <section className="relative z-10 px-6 md:px-12 py-24 bg-bg-secondary/30">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-montserrat font-black text-4xl md:text-5xl mb-4 text-white">
            Arrête d&apos;être{' '}
            <span style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ignoré
            </span>
          </h2>
          <p className="text-text-secondary text-lg mb-10">
            Arrête de gâcher ton potentiel
          </p>

          <div className="relative bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-red-primary/40 rounded-2xl p-8 overflow-hidden">
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse-glow"
              style={{ background: 'radial-gradient(ellipse at center, rgba(230,57,70,0.06), transparent 70%)' }}
            />

            <div className="relative z-10">
              <div className="text-center mb-8">
                <p className="font-montserrat font-black text-4xl md:text-6xl text-white mb-1">9,90 €</p>
                <p className="text-text-secondary text-sm">Paiement unique • Accès immédiat</p>
              </div>

              <ul className="text-left space-y-3 mb-8">
                {[
                  '130 crédits inclus',
                  'Prévisualisation de ton profil',
                  '4 bios optimisées offertes',
                  'Génération de 5 à 13 photos IA avec ton visage',
                  'Photos lifestyle adaptées à ta cible',
                  '+1200 combinaisons de style possibles',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white">
                    <span className="text-red-primary font-bold flex-shrink-0 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/auth" className="btn-primary w-full justify-center text-base">
                Optimiser mon profil maintenant
              </Link>

              <p className="text-text-tertiary text-xs mt-4">
                Paiement sécurisé · Satisfait ou remboursé
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqAccordion />

      {/* ── FOOTER CTA ── */}
      <section className="relative z-10 px-6 md:px-12 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-montserrat font-black text-3xl md:text-6xl mb-6 heading-gradient">
            Prêt à maximiser tes matchs ?
          </h2>
          <p className="text-text-secondary text-base md:text-lg mb-10">
            Rejoins les milliers d&apos;utilisateurs qui ont déjà transformé leur profil.
          </p>
          <Link href="/auth" className="btn-primary text-base md:text-lg">
            Commencer maintenant
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-border-primary px-6 md:px-12 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span
            className="font-montserrat font-extrabold text-xl"
            style={{
              background: 'linear-gradient(135deg, #E63946, #FF4757)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Crushmaxxing
          </span>
          <p className="text-text-tertiary text-sm">
            © 2026 Crushmaxxing. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-text-tertiary text-sm">
            <Link href="#" className="hover:text-white transition-colors">CGV</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="mailto:contact@cruchmaxxing.fr" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
    </IntroAnimation>
  )
}
