'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Dumbbell,
  MessageSquare,
  ImageIcon,
  Settings,
  Menu,
  X,
  User,
  LayoutDashboard,
  Swords,
} from 'lucide-react'

interface GameShellProps {
  children: React.ReactNode
  userEmail: string
}

const NAV_ITEMS = [
  { href: '/game',          label: 'Dashboard',        icon: Home },
  { href: '/game/training', label: 'Training Mode',    icon: Dumbbell },
  { href: '/game/analyze',  label: 'Analyse Messages', icon: MessageSquare },
]

const OTHER_ITEMS = [
  { href: '/ct/accroche',    label: 'CrushTalk',   icon: Swords,        color: '#F77F00' },
  { href: '/dashboard/home', label: 'CrushPicture', icon: LayoutDashboard, color: '#E63946' },
]

export function GameShell({ children, userEmail }: GameShellProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/game' ? pathname === '/game' : pathname.startsWith(href)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: '#1F1F1F' }}>
        <h1
          className="font-montserrat font-extrabold text-2xl mb-1"
          style={{
            background: 'linear-gradient(135deg, #FF8C42, #FFA366)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Crushmaxxing
        </h1>
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
          style={{ background: 'rgba(255,140,66,0.1)', borderColor: 'rgba(255,140,66,0.3)' }}
        >
          <Dumbbell className="w-3 h-3" style={{ color: '#FF8C42' }} />
          <span className="text-xs font-bold" style={{ color: '#FF8C42' }}>Training Mode</span>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 p-3 flex flex-col gap-1 mt-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
              style={active ? {
                background: 'rgba(255,140,66,0.12)',
                color: '#ffffff',
                fontWeight: 600,
                borderLeft: '2px solid #FF8C42',
                paddingLeft: '10px',
              } : { color: '#9da3af' }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}

        {/* Autres sections */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: '#1F1F1F' }}>
          <p className="text-xs uppercase tracking-wider mb-2 px-3" style={{ color: '#555' }}>
            Autres outils
          </p>
          {OTHER_ITEMS.map(({ href, label, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 hover:text-white"
              style={{ color: '#6b7280' }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-auto" />
      </nav>

      {/* User */}
      <div className="p-3 border-t" style={{ borderColor: '#1F1F1F' }}>
        <Link
          href="/dashboard/settings"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
          style={{ background: '#1A1A1A' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FF8C42, #FFA366)' }}
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
        className="md:hidden fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 border-b"
        style={{ background: '#0D0D0D', borderColor: '#1F1F1F' }}
      >
        <h1
          className="font-montserrat font-extrabold text-xl"
          style={{
            background: 'linear-gradient(135deg, #FF8C42, #FFA366)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Crushmaxxing
        </h1>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: '#fff' }}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ── MOBILE SIDEBAR (overlay) ── */}
      {open && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setOpen(false)}
          />
          <aside
            className="md:hidden fixed top-16 left-0 bottom-0 w-72 z-50 overflow-y-auto"
            style={{ background: '#0D0D0D', borderRight: '1px solid #1F1F1F' }}
          >
            <SidebarContent />
          </aside>
        </>
      )}

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="hidden md:flex w-64 h-full flex-shrink-0 flex-col border-r"
        style={{ background: '#0D0D0D', borderColor: '#1F1F1F' }}
      >
        <SidebarContent />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-h-0">
        <main
          className="flex-1 min-h-0 overflow-auto p-4 md:p-8 pt-20 md:pt-8"
          style={{ background: '#0A0A0A' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
