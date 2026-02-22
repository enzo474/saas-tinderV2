'use client'

import Link from 'next/link'
import { MessageSquare, Zap, Target, Smile, Moon, Star, ArrowRight, Upload, Sparkles, CheckCircle } from 'lucide-react'

export default function CrushTalkLanding() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span
            className="font-montserrat font-extrabold text-xl"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            Crushmaxxing
          </span>
          <Link
            href="/crushtalk/login"
            className="px-5 py-2 rounded-full text-sm font-semibold text-white border border-white/20 hover:border-white/40 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-28 pb-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#F77F00]/30 bg-[#F77F00]/10 text-[#F77F00] text-sm font-semibold mb-8">
            <Zap className="w-4 h-4" />
            CrushTalk — Messages d'accroche IA
          </div>

          <h1 className="font-montserrat font-extrabold text-4xl md:text-6xl leading-tight mb-6">
            Fini les messages<br />
            <span style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ignorés.
            </span>
          </h1>

          <p className="text-[#9da3af] text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Upload le profil qui t'intéresse, l'IA analyse sa bio et ses photos,
            puis génère <strong className="text-white">4 messages d'accroche ultra-personnalisés</strong> en 30 secondes.
          </p>

          <Link
            href="/crushtalk/login"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white hover:scale-105 transition-transform shadow-lg"
            style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)', boxShadow: '0 8px 32px rgba(247,127,0,0.3)' }}
          >
            <Sparkles className="w-5 h-5" />
            Commencer maintenant
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="text-[#6b7280] text-sm mt-4">Connexion avec Google · Rapide et sécurisé</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#F77F00] text-sm font-semibold uppercase tracking-wider mb-3">Comment ça marche</p>
            <h2 className="font-montserrat font-bold text-3xl md:text-4xl text-white">
              3 étapes, 30 secondes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: <Upload className="w-7 h-7" />,
                title: 'Upload le profil',
                desc: "Prends un screenshot du profil qui t'intéresse — bio visible, quelques photos. C'est tout.",
              },
              {
                step: '02',
                icon: <Sparkles className="w-7 h-7" />,
                title: "L'IA analyse tout",
                desc: "Claude lit la bio, analyse le vibe des photos et détecte les centres d'intérêt pour personnaliser.",
              },
              {
                step: '03',
                icon: <MessageSquare className="w-7 h-7" />,
                title: 'Reçois 4 messages',
                desc: '4 accroches différentes — Direct, Drôle, Mystérieux, Compliment. Tu choisis ton style.',
              },
            ].map(item => (
              <div key={item.step} className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
                <div className="absolute -top-3 left-6 text-[#F77F00] font-montserrat font-bold text-xs bg-[#0A0A0A] px-2">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#F77F00]/10 flex items-center justify-center text-[#F77F00] mb-4">
                  {item.icon}
                </div>
                <h3 className="font-montserrat font-bold text-white text-lg mb-2">{item.title}</h3>
                <p className="text-[#9da3af] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TONES */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#F77F00] text-sm font-semibold uppercase tracking-wider mb-3">4 tons disponibles</p>
            <h2 className="font-montserrat font-bold text-3xl md:text-4xl text-white">
              Un message pour chaque situation
            </h2>
            <p className="text-[#9da3af] mt-4 max-w-xl mx-auto">
              Tu reçois toujours 4 messages avec des approches radicalement différentes.
              Tu copies celui qui te ressemble le plus.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: '🎯', tone: 'Direct', desc: 'Va droit au but. Confiant, assertif, sans fioritures.' },
              { emoji: '😂', tone: 'Drôle', desc: 'Humour décalé. Crée une réaction immédiate, mémorable.' },
              { emoji: '🌙', tone: 'Mystérieux', desc: 'Intrigue sans tout dire. Donne envie d\'en savoir plus.' },
              { emoji: '⚡', tone: 'Compliment', desc: 'Valorise quelque chose de spécifique dans son profil.' },
            ].map(item => (
              <div key={item.tone} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 text-center hover:border-[#F77F00]/30 transition-colors">
                <span className="text-3xl">{item.emoji}</span>
                <h3 className="font-montserrat font-bold text-white mt-3 mb-2">{item.tone}</h3>
                <p className="text-[#6b7280] text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#F77F00] text-sm font-semibold uppercase tracking-wider mb-4">Pourquoi CrushTalk ?</p>
              <h2 className="font-montserrat font-bold text-3xl md:text-4xl text-white mb-6">
                Personnalisé à 100%.
                <br />
                Pas un template.
              </h2>
              <div className="space-y-4">
                {[
                  'Chaque message est unique et basé sur la vraie bio du profil',
                  'Compatible Tinder, Bumble, Hinge, Fruitz et toutes les apps',
                  'Fonctionne aussi pour répondre à des messages reçus',
                  'Résultats en moins de 30 secondes',
                ].map(feat => (
                  <div key={feat} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#F77F00] flex-shrink-0 mt-0.5" />
                    <p className="text-[#9da3af] text-sm">{feat}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Message preview cards */}
            <div className="space-y-3">
              {[
                { emoji: '🎯', tone: 'Direct', msg: 'T\'es prof de yoga ET tu lis Camus ? Je comprends pas encore comment on n\'est pas déjà en train de boire un verre ensemble.' },
                { emoji: '😂', tone: 'Drôle', msg: 'J\'ai lu ta bio 3 fois pour être sûr que tu existais vraiment. Mon cerveau voulait pas y croire.' },
              ].map(item => (
                <div key={item.tone} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{item.emoji}</span>
                    <span className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider">{item.tone}</span>
                  </div>
                  <p className="text-white text-sm leading-relaxed">{item.msg}</p>
                </div>
              ))}
              <p className="text-[#6b7280] text-xs text-center">Exemples générés par l'IA — chaque résultat est unique</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl text-white mb-4">
            Prêt à matcher plus ?
          </h2>
          <p className="text-[#9da3af] text-lg mb-10">
            Connecte-toi avec Google et génère ton premier message en 30 secondes.
          </p>
          <Link
            href="/crushtalk/login"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)', boxShadow: '0 8px 32px rgba(247,127,0,0.3)' }}
          >
            <Sparkles className="w-5 h-5" />
            Commencer gratuitement
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[#6b7280] text-sm">
          <span>© 2026 Crushmaxxing · CrushTalk</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
