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
} from 'lucide-react'

interface GameShellProps {
  children: React.ReactNode
  userEmail: string
}

const NAV_ITEMS = [
  { href: '/game',              label: 'Dashboard',    icon: Home          },
  { href: '/game/accroche',     label: 'Disquettes',   icon: MessageSquare },
  { href: '/game/discussion',   label: 'Conversation', icon: MessageCircle },
  { href: '/game/training',     label: 'Training',     icon: Dumbbell      },
  { href: '/game/profile',      label: 'Profil',       icon: User          },
]

export function GameShell({ children, userEmail }: GameShellProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/game') return pathname === '/game'
    return pathname.startsWith(href)
  }

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
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
          style={{ background: 'rgba(230,57,70,0.1)', borderColor: 'rgba(230,57,70,0.3)' }}
        >
          <Dumbbell className="w-3 h-3" style={{ color: '#E63946' }} />
          <span className="text-xs font-bold" style={{ color: '#E63946' }}>Training Mode</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-1 mt-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
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

        {/* Lien CrushPicture — bientôt disponible */}
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

        <div className="mt-auto" />
      </nav>

      {/* User */}
      <div className="p-3 border-t" style={{ borderColor: '#1F1F1F' }}>
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
            <p className="text-xs" style={{ color: '#6b7280' }}>Training Mode</p>
          </div>
        </Link>
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
        <Link
          href="/game/profile"
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
        >
          <User className="w-4 h-4 text-white" />
        </Link>
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

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 h-16 border-t"
        style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 transition-colors"
              style={{ color: active ? '#E63946' : '#9da3af' }}
            >
              <Icon size={20} />
              <span className="text-xs font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
