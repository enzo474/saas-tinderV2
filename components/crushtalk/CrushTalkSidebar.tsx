'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, MessageCircle, User, Zap, Infinity, LayoutDashboard } from 'lucide-react'

interface CrushTalkSidebarProps {
  userEmail: string
  credits: number
  isUnlimited: boolean
  hasPhotosPro?: boolean
}

export function CrushTalkSidebar({ userEmail, credits, isUnlimited, hasPhotosPro = false }: CrushTalkSidebarProps) {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  const navItems = [
    { path: '/ct/accroche', label: 'Accroche', icon: MessageSquare },
    { path: '/ct/discussion', label: 'Discussion', icon: MessageCircle },
  ]

  return (
    <aside className="hidden md:flex w-64 h-full flex-shrink-0 border-r flex-col" style={{ background: '#0D0D0D', borderColor: '#1F1F1F' }}>
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: '#1F1F1F' }}>
        <div className="flex items-center gap-2 mb-1">
          <h1
            className="font-montserrat font-extrabold text-2xl"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            Crushmaxxing
          </h1>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border" style={{ background: 'rgba(247,127,0,0.1)', borderColor: 'rgba(247,127,0,0.3)' }}>
          <MessageSquare className="w-3 h-3" style={{ color: '#F77F00' }} />
          <span className="text-xs font-bold" style={{ color: '#F77F00' }}>CrushTalk</span>
        </div>
      </div>

      {/* Crédits */}
      <div className="mx-3 mt-4 px-4 py-3 rounded-xl border" style={{ background: 'rgba(247,127,0,0.06)', borderColor: 'rgba(247,127,0,0.2)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(247,127,0,0.7)' }}>Crédits</p>
        <div className="flex items-center gap-2">
          {isUnlimited ? (
            <>
              <Infinity className="w-5 h-5" style={{ color: '#F77F00' }} />
              <span className="font-montserrat font-bold text-white text-lg">Illimité</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}>Charo</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" style={{ color: '#F77F00' }} />
              <span className="font-montserrat font-bold text-white text-xl">{credits}</span>
              <Link
                href="#recharge"
                className="ml-auto text-xs px-2.5 py-1 rounded-lg font-semibold text-white transition-opacity hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}
              >
                + Recharger
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-1 mt-3">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = isActive(path)
          return (
            <Link
              key={path}
              href={path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
              style={active ? {
                background: 'rgba(247,127,0,0.12)',
                color: '#ffffff',
                fontWeight: 600,
                borderLeft: '2px solid #F77F00',
                paddingLeft: '10px',
              } : {
                color: '#9da3af',
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}

        {/* Lien Photos Pro si applicable */}
        {hasPhotosPro && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#1F1F1F' }}>
            <Link
              href="/dashboard/home"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 hover:text-white"
              style={{ color: '#6b7280' }}
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span>Photos Pro</span>
            </Link>
          </div>
        )}

        {/* Spacer */}
        <div className="mt-auto" />
      </nav>

      {/* User */}
      <div className="p-3 border-t" style={{ borderColor: '#1F1F1F' }}>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
          style={{ background: '#1A1A1A' }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}>
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{userEmail.split('@')[0]}</p>
            <p className="text-xs" style={{ color: '#6b7280' }}>CrushTalk</p>
          </div>
        </Link>
      </div>
    </aside>
  )
}
