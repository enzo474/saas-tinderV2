'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  User,
  Bell,
  ImagePlus,
  Share2,
  HelpCircle,
  Lock,
  Shield,
  ChevronRight,
  LogOut,
} from 'lucide-react'

interface MenuItem {
  icon: React.ElementType
  label: string
  href?: string
  locked?: boolean
  badge?: string
  action?: () => void
  danger?: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Crushmaxxing',
        text: 'Entraîne-toi à draguer avec l\'IA',
        url: 'https://crushmaxxing.com',
      }).catch(() => {})
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/crushtalk/login')
  }

  const menuSections: { title?: string; items: MenuItem[] }[] = [
    {
      title: 'Mon compte',
      items: [
        {
          icon: User,
          label: 'Informations personnelles',
          href: '/dashboard/settings',
        },
        {
          icon: Bell,
          label: 'Notifications',
          href: '#',
        },
      ],
    },
    {
      title: 'Outils',
      items: [
        {
          icon: ImagePlus,
          label: 'Photos IA',
          href: '/dashboard/images',
          locked: true,
          badge: 'Bientôt',
        },
      ],
    },
    {
      title: 'Aide & Partage',
      items: [
        {
          icon: Share2,
          label: "Partager l'application",
          action: handleShare,
        },
        {
          icon: HelpCircle,
          label: 'Nous contacter',
          href: 'mailto:contact@crushmaxxing.fr',
        },
        {
          icon: Lock,
          label: 'Confidentialité',
          href: '/privacy',
        },
        {
          icon: Shield,
          label: 'Conditions d\'utilisation',
          href: '/terms',
        },
      ],
    },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-montserrat text-2xl font-bold text-white mb-1">Mon Profil</h1>
        <p className="text-sm" style={{ color: '#9da3af' }}>Gérer ton compte et tes préférences</p>
      </div>

      {/* User Card */}
      <div
        className="rounded-2xl p-6 border flex items-center gap-5"
        style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
        >
          👤
        </div>
        <div>
          <h2 className="font-montserrat text-xl font-bold text-white mb-0.5">
            Mon compte
          </h2>
          <p className="text-sm" style={{ color: '#9da3af' }}>
            Training Mode — Niveau 0
          </p>
        </div>
      </div>

      {/* Menu Sections */}
      {menuSections.map((section) => (
        <div key={section.title}>
          {section.title && (
            <p className="text-xs uppercase tracking-wider mb-2 px-1 font-semibold" style={{ color: '#555' }}>
              {section.title}
            </p>
          )}
          <div
            className="rounded-2xl overflow-hidden border"
            style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}
          >
            {section.items.map((item, index) => {
              const content = (
                <div
                  key={item.label}
                  className={`flex items-center justify-between p-4 transition-colors ${item.locked ? 'opacity-50' : 'cursor-pointer hover:bg-[#252525]'} ${index !== section.items.length - 1 ? 'border-b' : ''}`}
                  style={{ borderColor: '#2A2A2A' }}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} style={{ color: '#E63946' }} />
                    <span className="text-sm font-medium text-white">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(230,57,70,0.15)', color: '#E63946' }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {!item.locked && <ChevronRight size={16} style={{ color: '#555' }} />}
                  </div>
                </div>
              )

              if (item.action) {
                return (
                  <button key={item.label} onClick={item.action} className="w-full text-left">
                    {content}
                  </button>
                )
              }

              if (item.href && !item.locked) {
                return (
                  <Link key={item.label} href={item.href}>
                    {content}
                  </Link>
                )
              }

              return <div key={item.label}>{content}</div>
            })}
          </div>
        </div>
      ))}

      {/* Déconnexion */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
        style={{ borderColor: '#E63946', color: '#E63946', background: 'rgba(230,57,70,0.06)' }}
      >
        <LogOut size={16} />
        {loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
      </button>

    </div>
  )
}
