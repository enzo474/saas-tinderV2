'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Dumbbell,
  MessageSquare,
  MessageCircle,
  User,
  ImageIcon,
  X,
  Share2,
  Languages,
  FileText,
  Menu,
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

const MENU_ITEMS = [
  { icon: User, label: 'Mon profil', href: '/game/profile' },
  { icon: MessageCircle, label: 'Nous Contacter', href: 'mailto:contact@crushmaxxing.com' },
  { icon: Share2, label: "Partager l'application", href: '#share' },
  { icon: Languages, label: 'Langues', href: '#langues' },
  { icon: FileText, label: 'Confidentialité', href: '/privacy' },
]

export function GameShell({ children, userEmail }: GameShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/game') return pathname === '/game'
    return pathname.startsWith(href)
  }

  const isChatPage = pathname.includes('/chat')

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #FF6161 0%, #E63946 50%, #C1121F 100%)',
      }}
    >
      {/* ── HEADER MOBILE (hamburger + logo) ── */}
      {!isChatPage && (
        <header className="flex items-center justify-between px-5 pt-6 pb-3 flex-shrink-0">
          <button
            onClick={() => setMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <Menu size={22} color="white" />
          </button>

          <h1
            className="font-black text-white text-xl"
            style={{
              fontFamily: 'var(--font-montserrat)',
              letterSpacing: '-0.5px',
              textShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            Crushmaxxing
          </h1>

          <Link
            href="/game/profile"
            className="w-10 h-10 flex items-center justify-center rounded-xl"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <User size={20} color="white" />
          </Link>
        </header>
      )}

      {/* ── CONTENT ── */}
      <div className="flex-1 min-h-0 overflow-auto pb-20">
        {children}
      </div>

      {/* ── BOTTOM NAV ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 h-16 border-t"
        style={{ background: '#1C1C1E', borderColor: '#2A2A2A' }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 transition-colors"
              style={{ color: active ? '#E63946' : '#666' }}
            >
              <Icon size={20} />
              <span className="text-[10px] font-semibold leading-none">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* ── HAMBURGER MENU (bottom sheet) ── */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl pb-10"
            style={{ background: '#1C1C1E' }}
          >
            {/* Close button */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full"
                style={{ background: '#2A2A2A' }}
              >
                <X size={18} color="#888" />
              </button>
            </div>

            {/* Menu items */}
            <div className="px-4">
              {MENU_ITEMS.map(({ icon: Icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 py-4 border-b"
                  style={{ borderColor: '#2A2A2A' }}
                >
                  <Icon size={20} color="#888" />
                  <span className="text-base font-semibold text-white">{label}</span>
                </Link>
              ))}
            </div>

            {/* User info */}
            <div className="px-4 pt-4">
              <p className="text-xs" style={{ color: '#555' }}>
                Connecté : {userEmail}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
