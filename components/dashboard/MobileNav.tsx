'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, Shield, Home, UserCircle, ImageIcon, Wand2, FileText, MessageSquare, Lightbulb, Zap, ArrowUpRight, Lock, RefreshCw } from 'lucide-react'
import { CrushPictureRechargeModal } from './CrushPictureRechargeModal'

interface MobileNavProps {
  userEmail: string
  isAdmin?: boolean
  credits?: number
  hasPlan?: boolean
}

export function MobileNav({ userEmail, isAdmin = false, credits = 0, hasPlan = false }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showRecharge, setShowRecharge] = useState(false)
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  const photoProItems = [
    { path: '/dashboard/home', label: 'Accueil', icon: Home },
    { path: '/dashboard/profile', label: 'Rendu Profil', icon: UserCircle },
    { path: '/dashboard/images', label: 'Générateur Images', icon: ImageIcon },
    { path: '/dashboard/images/reprendre', label: 'Choisis ton style', icon: Wand2 },
    { path: '/dashboard/bio', label: 'Générateur Bio', icon: FileText },
  ]

  return (
    <>
      {/* Top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b flex items-center justify-between px-4" style={{ background: '#0D0D0D', borderColor: '#1F1F1F' }}>
        <div className="flex items-center gap-2">
          <span
            className="font-montserrat font-extrabold text-xl"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            Crushmaxxing
          </span>
          <div className="px-2 py-0.5 rounded-full border text-xs font-bold" style={{ background: 'rgba(230,57,70,0.1)', borderColor: 'rgba(230,57,70,0.3)', color: '#E63946' }}>
            CrushPicture
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasPlan && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}>
              <Zap className="w-3.5 h-3.5 text-white" />
              <span className="text-white font-bold text-xs">{credits}</span>
            </div>
          )}
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
              style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              Crushmaxxing
            </span>
            <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-bold" style={{ background: 'rgba(230,57,70,0.1)', borderColor: 'rgba(230,57,70,0.3)', color: '#E63946' }}>
              <ImageIcon className="w-3 h-3" />
              CrushPicture
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-lg" style={{ color: '#9da3af', background: '#1A1A1A' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Carte Crédits */}
        {hasPlan ? (
          <div className="mx-3 mt-4 px-4 py-3 rounded-xl border" style={{ background: 'rgba(230,57,70,0.06)', borderColor: 'rgba(230,57,70,0.2)' }}>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: '#E63946' }} />
              <span className="font-bold text-white">{credits} crédits</span>
              <button
                onClick={() => { setIsOpen(false); setShowRecharge(true) }}
                className="ml-auto text-xs px-2.5 py-1 rounded-lg font-semibold text-white flex items-center gap-1"
                style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
              >
                <RefreshCw className="w-3 h-3" /> Recharge
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-3 mt-4 px-4 py-3 rounded-xl border" style={{ background: 'rgba(230,57,70,0.04)', borderColor: 'rgba(230,57,70,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4" style={{ color: 'rgba(230,57,70,0.6)' }} />
              <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>CrushPicture verrouillé</p>
            </div>
            <Link
              href="/pricing"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1 w-full text-center text-xs px-2.5 py-2 rounded-lg font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
            >
              Débloquer <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        <nav className="flex-1 p-3 flex flex-col gap-1 mt-3 overflow-y-auto">
          {photoProItems.map(({ path, label, icon: Icon }) => {
            const active = isActive(path)
            return (
              <Link
                key={path}
                href={path}
                onClick={() => setIsOpen(false)}
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

          {/* Switch vers CrushTalk */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#1F1F1F' }}>
            <Link
              href="/ct/accroche"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 hover:text-white"
              style={{ color: '#6b7280' }}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" style={{ color: '#F77F00' }} />
              <span>CrushTalk</span>
            </Link>
          </div>

          {isAdmin && (
            <div className="mt-2 pt-2 border-t" style={{ borderColor: '#1F1F1F' }}>
              <Link
                href="/dashboard/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
                style={isActive('/dashboard/admin') ? {
                  background: 'rgba(230,57,70,0.1)',
                  color: '#FF4757',
                  fontWeight: 600,
                  borderLeft: '2px solid #E63946',
                  paddingLeft: '10px',
                } : { color: '#9da3af' }}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
                <span className="ml-auto text-xs text-white px-2 py-0.5 rounded-full" style={{ background: '#E63946' }}>✨</span>
              </Link>
            </div>
          )}

          <div className="mt-auto" />

          <div className="pt-2 border-t" style={{ borderColor: '#1F1F1F' }}>
            <Link
              href="/dashboard/feedback"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 hover:text-white"
              style={isActive('/dashboard/feedback') ? {
                background: 'rgba(230,57,70,0.12)',
                color: '#fff',
                fontWeight: 600,
                borderLeft: '2px solid #E63946',
                paddingLeft: '10px',
              } : { color: '#6b7280' }}
            >
              <Lightbulb className="w-4 h-4 flex-shrink-0" />
              <span>Donnez-nous vos idées</span>
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t" style={{ borderColor: '#1F1F1F' }}>
          <Link href="/dashboard/settings" onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#1A1A1A' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}>
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{userEmail.split('@')[0]}</p>
              <p className="text-xs" style={{ color: '#6b7280' }}>CrushPicture</p>
            </div>
          </Link>
        </div>
      </div>

      {showRecharge && <CrushPictureRechargeModal onClose={() => setShowRecharge(false)} />}
    </>
  )
}
