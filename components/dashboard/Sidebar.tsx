'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Shield, Home, UserCircle, ImageIcon, Wand2, FileText, MessageSquare, MessageCircle, Lightbulb } from 'lucide-react'

interface SidebarProps {
  userEmail: string
  isAdmin?: boolean
}

export function Sidebar({ userEmail, isAdmin = false }: SidebarProps) {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  const photoProItems = [
    { path: '/dashboard/home', label: 'Accueil', icon: Home },
    { path: '/dashboard/profile', label: 'Rendu Profil', icon: UserCircle },
    { path: '/dashboard/images', label: 'Générateur Images', icon: ImageIcon },
    { path: '/dashboard/images/reprendre', label: 'Choisis ton style', icon: Wand2 },
    { path: '/dashboard/bio', label: 'Générateur Bio', icon: FileText },
  ]

  const crushTalkItems = [
    { path: '/ct/accroche', label: 'Accroche', icon: MessageSquare },
    { path: '/ct/discussion', label: 'Discussion', icon: MessageCircle },
  ]

  const navItemClass = (active: boolean, accent: 'red' | 'orange' = 'red') => `
    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
    ${active
      ? accent === 'orange'
        ? 'bg-[#F77F00]/10 text-white font-semibold border-l-2 border-[#F77F00] pl-2.5'
        : 'bg-bg-tertiary text-white font-semibold border-l-2 border-red-primary pl-2.5'
      : 'text-text-secondary hover:bg-bg-tertiary hover:text-white'
    }
  `

  return (
    <aside className="hidden md:flex w-64 h-full flex-shrink-0 bg-bg-secondary border-r border-border-primary flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-border-primary">
        <h1
          className="font-montserrat font-extrabold text-2xl"
          style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          Crushmaxxing
        </h1>
        <p className="text-text-tertiary text-xs mt-1">Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-4 overflow-y-auto">

        {/* ── Section Photos Pro ── */}
        <div>
          <div className="flex items-center gap-2 px-3 mb-2">
            <div className="w-5 h-5 rounded-md bg-red-primary/15 flex items-center justify-center">
              <ImageIcon className="w-3 h-3 text-red-light" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-light/80">Photos Pro</span>
          </div>
          <div className="space-y-0.5">
            {photoProItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} href={path} className={navItemClass(isActive(path), 'red')}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Section CrushTalk ── */}
        <div>
          <div className="flex items-center gap-2 px-3 mb-2">
            <div className="w-5 h-5 rounded-md bg-[#F77F00]/15 flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-[#F77F00]" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F77F00]/80">CrushTalk</span>
          </div>
          <div className="space-y-0.5">
            {crushTalkItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} href={path} className={navItemClass(isActive(path), 'orange')}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Admin Panel */}
        {isAdmin && (
          <div className="border-t border-border-primary pt-3">
            <Link
              href="/dashboard/admin"
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

        {/* Feedback — en bas */}
        <div className="mt-auto border-t border-border-primary pt-3">
          <Link
            href="/dashboard/feedback"
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
    </aside>
  )
}
