'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, Shield } from 'lucide-react'

interface MobileNavProps {
  userEmail: string
  isAdmin?: boolean
}

export function MobileNav({ userEmail, isAdmin = false }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const visualGameItems = [
    { path: '/dashboard/home', label: 'Accueil' },
    { path: '/dashboard/profile', label: 'Rendu Profil' },
    { path: '/dashboard/images', label: 'Générateur Images' },
    { path: '/dashboard/images/reprendre', label: 'Choisis ton propre style' },
    { path: '/dashboard/bio', label: 'Générateur Bio' },
  ]

  const textGameItems = [
    { path: '/dashboard/hooks', label: 'Accroche', badge: '-50%', badgeColor: 'red' as const },
    { path: '/dashboard/discussion', label: 'Discussion', locked: true, badge: 'Bientôt', badgeColor: 'gold' as const },
  ]

  return (
    <>
      {/* Top bar — mobile only */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-bg-secondary border-b border-border-primary flex items-center justify-between px-4">
        <span
          className="font-montserrat font-extrabold text-xl"
          style={{
            background: 'linear-gradient(135deg, #E63946, #FF4757)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Crushmaxxing
        </span>
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
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-[85vw] max-w-72 bg-bg-secondary border-r border-border-primary flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="p-5 border-b border-border-primary flex items-center justify-between">
          <div>
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
            <p className="text-text-tertiary text-xs mt-0.5">Dashboard Créateur</p>
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
        <nav className="flex-1 p-4 flex flex-col overflow-y-auto">
          <div className="space-y-1">
            {visualGameItems.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-lg text-sm
                    transition-all duration-200
                    ${active
                      ? 'bg-bg-tertiary text-white font-semibold border-l-2 border-red-primary pl-3'
                      : 'text-text-secondary hover:bg-bg-tertiary hover:text-white'
                    }
                  `}
                >
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-border-primary space-y-1">
            {textGameItems.map((item) => {
              const active = !item.locked && isActive(item.path)

              const content = (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`
                      text-xs px-2.5 py-1 rounded-full font-semibold
                      ${item.badgeColor === 'red' ? 'bg-red-primary text-white' : ''}
                      ${item.badgeColor === 'gold' ? 'bg-gold-primary text-black' : ''}
                    `}>
                      {item.badge}
                    </span>
                  )}
                </>
              )

              if (item.locked) {
                return (
                  <span
                    key={item.path}
                    className="flex items-center justify-between px-4 py-3 rounded-lg text-sm text-text-tertiary opacity-60 cursor-not-allowed"
                  >
                    {content}
                  </span>
                )
              }

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-lg text-sm
                    transition-all duration-200
                    ${active
                      ? 'bg-bg-tertiary text-white font-semibold border-l-2 border-red-primary pl-3'
                      : 'text-text-secondary hover:bg-bg-tertiary hover:text-white'
                    }
                  `}
                >
                  {content}
                </Link>
              )
            })}
          </div>

          {isAdmin && (
            <div className="border-t border-border-primary pt-2 mt-2">
              <Link
                href="/dashboard/admin"
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm
                  transition-all duration-200
                  ${isActive('/dashboard/admin') || isActive('/dashboard/admin/photo-styles')
                    ? 'bg-red-primary/10 text-red-light font-semibold border-l-2 border-red-primary pl-3'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-white'
                  }
                `}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
                <span className="ml-auto text-xs bg-red-primary text-white px-2 py-0.5 rounded-full">
                  ✨
                </span>
              </Link>
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-border-primary">
            <Link
              href="/dashboard/feedback"
              onClick={() => setIsOpen(false)}
              className={`
                flex items-center justify-between px-4 py-3 rounded-lg text-sm
                transition-all duration-200
                ${isActive('/dashboard/feedback')
                  ? 'bg-bg-tertiary text-white font-semibold border-l-2 border-red-primary pl-3'
                  : 'text-text-secondary hover:bg-bg-tertiary hover:text-white'
                }
              `}
            >
              <span className="flex-1">Donnez-nous vos idées</span>
              <span>💡</span>
            </Link>
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-border-primary">
          <Link
            href="/dashboard/settings"
            onClick={() => setIsOpen(false)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
              ${isActive('/dashboard/settings')
                ? 'bg-bg-tertiary ring-1 ring-red-primary/50'
                : 'bg-bg-tertiary hover:bg-border-primary'
              }
            `}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-red-primary to-red-light rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {userEmail.split('@')[0]}
              </p>
              <p className="text-text-tertiary text-xs">Membre Premium</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  )
}
