'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Shield, Home, UserCircle, ImageIcon, Wand2, FileText, MessageSquare, Lightbulb, Zap, ArrowUpRight, Lock } from 'lucide-react'

interface SidebarProps {
  userEmail: string
  isAdmin?: boolean
  credits?: number
  hasPlan?: boolean
}

export function Sidebar({ userEmail, isAdmin = false, credits = 0, hasPlan = false }: SidebarProps) {
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
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border" style={{ background: 'rgba(230,57,70,0.1)', borderColor: 'rgba(230,57,70,0.3)' }}>
          <ImageIcon className="w-3 h-3" style={{ color: '#E63946' }} />
          <span className="text-xs font-bold" style={{ color: '#E63946' }}>Photos Pro</span>
        </div>
      </div>

      {/* Carte Crédits */}
      {hasPlan ? (
        <div className="mx-3 mt-4 px-4 py-3 rounded-xl border" style={{ background: 'rgba(230,57,70,0.06)', borderColor: 'rgba(230,57,70,0.2)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(230,57,70,0.7)' }}>Crédits</p>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: '#E63946' }} />
            <span className="font-montserrat font-bold text-white text-xl">{credits}</span>
            <Link
              href="/pricing"
              className="ml-auto text-xs px-2.5 py-1 rounded-lg font-semibold text-white transition-opacity hover:opacity-80 flex items-center gap-1"
              style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
            >
              Upgrade <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mx-3 mt-4 px-4 py-3 rounded-xl border" style={{ background: 'rgba(230,57,70,0.04)', borderColor: 'rgba(230,57,70,0.15)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4" style={{ color: 'rgba(230,57,70,0.6)' }} />
            <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Photos Pro verrouillé</p>
          </div>
          <p className="text-xs mb-3" style={{ color: '#6b7280' }}>Génère tes photos pro avec l&apos;IA</p>
          <Link
            href="/pricing"
            className="block w-full text-center text-xs px-2.5 py-2 rounded-lg font-semibold text-white transition-opacity hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
          >
            Débloquer Photos Pro
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-1 mt-3">
        {photoProItems.map(({ path, label, icon: Icon }) => {
          const active = isActive(path)
          return (
            <Link
              key={path}
              href={path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
              style={active ? {
                background: 'rgba(230,57,70,0.12)',
                color: '#ffffff',
                fontWeight: 600,
                borderLeft: '2px solid #E63946',
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

        {/* Switch vers CrushTalk — juste après les nav items */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: '#1F1F1F' }}>
          <Link
            href="/ct/accroche"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 hover:text-white"
            style={{ color: '#6b7280' }}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0" style={{ color: '#F77F00' }} />
            <span>CrushTalk</span>
          </Link>
        </div>

        {/* Admin Panel */}
        {isAdmin && (
          <div className="mt-2 pt-2 border-t" style={{ borderColor: '#1F1F1F' }}>
            <Link
              href="/dashboard/admin"
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

        {/* Spacer */}
        <div className="mt-auto" />

        {/* Feedback */}
        <div className="pt-2 border-t" style={{ borderColor: '#1F1F1F' }}>
          <Link
            href="/dashboard/feedback"
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

      {/* User */}
      <div className="p-3 border-t" style={{ borderColor: '#1F1F1F' }}>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
          style={{ background: '#1A1A1A' }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}>
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{userEmail.split('@')[0]}</p>
            <p className="text-xs" style={{ color: '#6b7280' }}>Photos Pro</p>
          </div>
        </Link>
      </div>
    </aside>
  )
}
