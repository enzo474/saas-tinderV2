'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, Shield, Home, UserCircle, ImageIcon, Wand2, FileText, MessageSquare, Lightbulb } from 'lucide-react'

interface MobileNavProps {
  userEmail: string
  isAdmin?: boolean
}

export function MobileNav({ userEmail, isAdmin = false }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  const photoProItems = [
    { path: '/dashboard/home', label: 'Accueil', icon: Home },
    { path: '/dashboard/profile', label: 'Rendu Profil', icon: UserCircle },
    { path: '/dashboard/images', label: 'Générateur Images', icon: ImageIcon },
    { path: '/dashboard/images/reprendre', label: 'Choisis ton style', icon: Wand2 },
    { path: '/dashboard/bio', label: 'Générateur Bio', icon: FileText },
  ]

  const navItemClass = (active: boolean) => `
    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
    ${active
      ? 'bg-bg-tertiary text-white font-semibold border-l-2 border-red-primary pl-2.5'
      : 'text-text-secondary hover:bg-bg-tertiary hover:text-white'
    }
  `

  return (
    <>
      {/* Top bar — mobile only */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-bg-secondary border-b border-border-primary flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span
            className="font-montserrat font-extrabold text-xl"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            Crushmaxxing
          </span>
          <div className="px-2 py-0.5 rounded-full border text-xs font-bold" style={{ background: 'rgba(230,57,70,0.1)', borderColor: 'rgba(230,57,70,0.3)', color: '#E63946' }}>
            Photos Pro
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-white hover:bg-bg-tertiary transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* Drawer */}
      <div className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-[85vw] max-w-72 bg-bg-secondary border-r border-border-primary flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Drawer header */}
        <div className="p-5 border-b border-border-primary flex items-center justify-between">
          <div>
            <h1
              className="font-montserrat font-extrabold text-xl"
              style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              Crushmaxxing
            </h1>
            <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-bold" style={{ background: 'rgba(230,57,70,0.1)', borderColor: 'rgba(230,57,70,0.3)', color: '#E63946' }}>
              <ImageIcon className="w-3 h-3" />
              Photos Pro
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-white hover:bg-bg-tertiary transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {photoProItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} href={path} onClick={() => setIsOpen(false)} className={navItemClass(isActive(path))}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          ))}

          {/* Admin */}
          {isAdmin && (
            <div className="border-t border-border-primary pt-3 mt-3">
              <Link
                href="/dashboard/admin"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive('/dashboard/admin') || isActive('/dashboard/admin/photo-styles')
                    ? 'bg-red-primary/10 text-red-light font-semibold border-l-2 border-red-primary pl-2.5'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
                <span className="ml-auto text-xs bg-red-primary text-white px-2 py-0.5 rounded-full">✨</span>
              </Link>
            </div>
          )}

          <div className="mt-auto" />

          {/* Switch vers CrushTalk */}
          <div className="border-t border-border-primary pt-3 mt-2">
            <Link
              href="/ct/accroche"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 hover:text-white"
              style={{ color: '#6b7280' }}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" style={{ color: '#F77F00' }} />
              <span>CrushTalk</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(247,127,0,0.15)', color: '#F77F00' }}>→</span>
            </Link>
          </div>

          {/* Feedback */}
          <div className="border-t border-border-primary pt-3 mt-1">
            <Link
              href="/dashboard/feedback"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isActive('/dashboard/feedback')
                  ? 'bg-bg-tertiary text-white font-semibold border-l-2 border-red-primary pl-2.5'
                  : 'text-text-secondary hover:bg-bg-tertiary hover:text-white'
              }`}
            >
              <Lightbulb className="w-4 h-4 flex-shrink-0" />
              <span>Donnez-nous vos idées</span>
            </Link>
          </div>
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-border-primary">
          <Link
            href="/dashboard/settings"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isActive('/dashboard/settings') ? 'bg-bg-tertiary ring-1 ring-red-primary/50' : 'bg-bg-tertiary hover:bg-border-primary'
            }`}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-red-primary to-red-light rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{userEmail.split('@')[0]}</p>
              <p className="text-text-tertiary text-xs">Membre Premium</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  )
}
