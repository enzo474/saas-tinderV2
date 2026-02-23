'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, MessageSquare, MessageCircle, Zap, Infinity, LayoutDashboard, ArrowUpRight } from 'lucide-react'

interface CrushTalkMobileNavProps {
  userEmail: string
  credits: number
  isUnlimited: boolean
  hasPhotosPro?: boolean
}

export function CrushTalkMobileNav({ userEmail, credits, isUnlimited, hasPhotosPro = false }: CrushTalkMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  const navItems = [
    { path: '/ct/accroche', label: 'Accroche', icon: MessageSquare },
    { path: '/ct/discussion', label: 'Discussion', icon: MessageCircle },
  ]

  return (
    <>
      {/* Top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b flex items-center justify-between px-4" style={{ background: '#0D0D0D', borderColor: '#1F1F1F' }}>
        <div className="flex items-center gap-2">
          <span
            className="font-montserrat font-extrabold text-xl"
            style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            Crushmaxxing
          </span>
          <div className="px-2 py-0.5 rounded-full border text-xs font-bold" style={{ background: 'rgba(247,127,0,0.1)', borderColor: 'rgba(247,127,0,0.3)', color: '#F77F00' }}>
            CrushTalk
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Credits badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}>
            {isUnlimited ? <Infinity className="w-3.5 h-3.5 text-white" /> : <Zap className="w-3.5 h-3.5 text-white" />}
            <span className="text-white font-bold text-xs">{isUnlimited ? '∞' : credits}</span>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#9da3af', background: '#1A1A1A' }}
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-[85vw] max-w-72 border-r flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#0D0D0D', borderColor: '#1F1F1F' }}
      >
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#1F1F1F' }}>
          <div>
            <span className="font-montserrat font-extrabold text-xl"
              style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              Crushmaxxing
            </span>
            <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-bold" style={{ background: 'rgba(247,127,0,0.1)', borderColor: 'rgba(247,127,0,0.3)', color: '#F77F00' }}>
              <MessageSquare className="w-3 h-3" />
              CrushTalk
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-lg" style={{ color: '#9da3af', background: '#1A1A1A' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Credits */}
        <div className="mx-3 mt-4 px-4 py-3 rounded-xl border" style={{ background: 'rgba(247,127,0,0.06)', borderColor: 'rgba(247,127,0,0.2)' }}>
          <div className="flex items-center gap-2">
            {isUnlimited ? (
              <>
                <Infinity className="w-4 h-4" style={{ color: '#F77F00' }} />
                <span className="font-bold text-white">Illimité</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}>Charo</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" style={{ color: '#F77F00' }} />
                <span className="font-bold text-white">{credits} crédits</span>
                <Link
                  href="/ct/pricing"
                  onClick={() => setIsOpen(false)}
                  className="ml-auto text-xs px-2.5 py-1 rounded-lg font-semibold text-white flex items-center gap-1"
                  style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}
                >
                  Upgrade <ArrowUpRight className="w-3 h-3" />
                </Link>
              </>
            )}
          </div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1 mt-3 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
              style={isActive(path) ? {
                background: 'rgba(247,127,0,0.12)',
                color: '#ffffff',
                fontWeight: 600,
                borderLeft: '2px solid #F77F00',
                paddingLeft: '10px',
              } : { color: '#9da3af' }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          ))}

          {hasPhotosPro && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: '#1F1F1F' }}>
              <Link href="/dashboard/home" onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm" style={{ color: '#6b7280' }}>
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                <span>CrushPicture</span>
              </Link>
            </div>
          )}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: '#1F1F1F' }}>
          <Link href="/dashboard/settings" onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#1A1A1A' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}>
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{userEmail.split('@')[0]}</p>
              <p className="text-xs" style={{ color: '#6b7280' }}>CrushTalk</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  )
}
