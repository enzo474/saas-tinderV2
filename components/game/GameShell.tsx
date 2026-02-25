'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Dumbbell,
  MessageSquare,
  MessageCircle,
  User,
  ImageIcon,
  ShieldCheck,
  LogIn,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>
  adminOnly?: boolean
  guestHidden?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/game',            label: 'Dashboard',    icon: Home,          adminOnly: true,  guestHidden: true  },
  { href: '/game/accroche',   label: 'Disquettes',   icon: MessageSquare, adminOnly: false, guestHidden: false },
  { href: '/game/discussion', label: 'Conversation', icon: MessageCircle, adminOnly: false, guestHidden: false },
  { href: '/game/training',   label: 'Training',     icon: Dumbbell,      adminOnly: true,  guestHidden: true  },
  { href: '/game/profile',    label: 'Profil',       icon: User,          adminOnly: false, guestHidden: true  },
]

interface GameShellProps {
  children: React.ReactNode
  userEmail: string
  isAdmin?: boolean
  isGuest?: boolean
}

export function GameShell({ children, userEmail, isAdmin = false, isGuest = false }: GameShellProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/game') return pathname === '/game'
    return pathname.startsWith(href)
  }

  const visibleNavItems = NAV_ITEMS.filter(item => {
    if (isGuest && item.guestHidden) return false
    if (!isGuest && !isAdmin && item.adminOnly) return false
    return true
  })

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: '#1F1F1F' }}>
        <h1
          className="font-montserrat font-extrabold text-2xl mb-1"
          style={{
            background: 'linear-gradient(135deg, #E63946, #FF4757)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Crushmaxxing
        </h1>
        {isAdmin && (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
            style={{ background: 'rgba(230,57,70,0.15)', borderColor: 'rgba(230,57,70,0.3)' }}
          >
            <ShieldCheck className="w-3 h-3" style={{ color: '#E63946' }} />
            <span className="text-xs font-bold" style={{ color: '#E63946' }}>Admin</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-1 mt-3">
        {visibleNavItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
              style={active ? {
                background: 'rgba(230,57,70,0.12)',
                color: '#ffffff',
                fontWeight: 600,
                borderLeft: '2px solid #E63946',
                paddingLeft: '10px',
              } : { color: '#9da3af' }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}

        {/* Lien Admin Panel — admin uniquement */}
        {isAdmin && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#1F1F1F' }}>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
              style={pathname.startsWith('/admin') ? {
                background: 'rgba(230,57,70,0.12)',
                color: '#ffffff',
                fontWeight: 600,
                borderLeft: '2px solid #E63946',
                paddingLeft: '10px',
              } : { color: '#9da3af' }}
            >
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Admin Panel</span>
            </Link>
          </div>
        )}

        {/* Photos IA — bientôt disponible (non-admin connectés uniquement) */}
        {!isAdmin && !isGuest && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#1F1F1F' }}>
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-not-allowed"
              style={{ color: '#555' }}
            >
              <ImageIcon className="w-4 h-4 flex-shrink-0" style={{ color: '#333' }} />
              <span>Photos IA</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#1A1A1A', color: '#555' }}>
                Bientôt
              </span>
            </div>
          </div>
        )}

        <div className="mt-auto" />
      </nav>

      {/* User / Se connecter */}
      <div className="p-3 border-t" style={{ borderColor: '#1F1F1F' }}>
        {isGuest ? (
          <Link
            href="/auth"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
          >
            <LogIn className="w-4 h-4 text-white flex-shrink-0" />
            <span className="text-white text-sm font-semibold">Se connecter</span>
          </Link>
        ) : (
          <Link
            href="/game/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
            style={{ background: '#1A1A1A' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
            >
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{userEmail.split('@')[0]}</p>
              <p className="text-xs" style={{ color: '#6b7280' }}>
                {isAdmin ? 'Administrateur' : 'Crushmaxxing'}
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  )

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: '#0A0A0A' }}>

      {/* ── MOBILE HEADER ── */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 border-b"
        style={{ background: '#0D0D0D', borderColor: '#1F1F1F' }}
      >
        <h1
          className="font-montserrat font-extrabold text-xl"
          style={{
            background: 'linear-gradient(135deg, #E63946, #FF4757)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Crushmaxxing
        </h1>
        {isGuest ? (
          <Link
            href="/auth"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
          >
            <LogIn className="w-3 h-3" />
            Connexion
          </Link>
        ) : (
          <Link
            href="/game/profile"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
          >
            <User className="w-4 h-4 text-white" />
          </Link>
        )}
      </header>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="hidden lg:flex w-64 h-full flex-shrink-0 flex-col border-r"
        style={{ background: '#0D0D0D', borderColor: '#1F1F1F' }}
      >
        <SidebarContent />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-h-0">
        <main
          className="flex-1 min-h-0 overflow-auto p-4 lg:p-8 pt-20 lg:pt-8 pb-24 lg:pb-8"
          style={{ background: '#0A0A0A' }}
        >
          {children}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV (mobile uniquement) ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t"
        style={{ background: '#1A1A1A', borderColor: '#2A2A2A', height: '64px' }}
      >
        {visibleNavItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 transition-colors flex-1"
              style={{ color: active ? '#E63946' : '#9da3af' }}
            >
              <Icon size={20} />
              <span className="text-xs font-medium leading-none">{label}</span>
            </Link>
          )
        })}
        {/* Bouton connexion dans la nav mobile pour les guests */}
        {isGuest && (
          <Link
            href="/auth"
            className="flex flex-col items-center justify-center gap-1 transition-colors flex-1"
            style={{ color: '#E63946' }}
          >
            <LogIn size={20} />
            <span className="text-xs font-medium leading-none">Connexion</span>
          </Link>
        )}
      </nav>
    </div>
  )
}
