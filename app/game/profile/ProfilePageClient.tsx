'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  User, Share2, HelpCircle, Lock, Shield,
  ChevronRight, LogOut, Zap, Infinity, Trash2, CreditCard,
} from 'lucide-react'
import { unsubscribeAction, deleteAccountAction } from './actions'

interface ProfilePageClientProps {
  email: string
  balance: number
  planLabel: string | null
  hasActiveSub: boolean
  isAdmin: boolean
}

export function ProfilePageClient({ email, balance, planLabel, hasActiveSub, isAdmin }: ProfilePageClientProps) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [unsubLoading, setUnsubLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [unsubError, setUnsubError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Crushmaxxing',
        text: "Génère des messages Tinder avec l'IA",
        url: 'https://crushmaxxing.com',
      }).catch(() => {})
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const handleUnsubscribe = async () => {
    if (!confirm('Es-tu sûr de vouloir résilier ton abonnement ?')) return
    setUnsubLoading(true)
    setUnsubError(null)
    const result = await unsubscribeAction()
    if (result?.error) {
      setUnsubError(result.error)
    } else {
      router.refresh()
    }
    setUnsubLoading(false)
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    await deleteAccountAction()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-montserrat text-2xl font-bold text-white mb-1">Mon Profil</h1>
        <p className="text-sm" style={{ color: '#9da3af' }}>Gérer ton compte et tes préférences</p>
      </div>

      {/* User Card */}
      <div
        className="rounded-2xl p-6 border flex items-center gap-5"
        style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
        >
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-montserrat text-lg font-bold text-white truncate">
            {email.split('@')[0]}
          </p>
          <p className="text-sm truncate" style={{ color: '#9da3af' }}>{email}</p>
        </div>
      </div>

      {/* Infos du compte */}
      <div>
        <p className="text-xs uppercase tracking-wider mb-2 px-1 font-semibold" style={{ color: '#555' }}>
          Informations du compte
        </p>
        <div className="rounded-2xl overflow-hidden border" style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}>

          {/* Email */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#2A2A2A' }}>
            <div className="flex items-center gap-3">
              <User size={18} style={{ color: '#E63946' }} />
              <div>
                <p className="text-sm font-medium text-white">Adresse email</p>
                <p className="text-xs" style={{ color: '#6b7280' }}>{email}</p>
              </div>
            </div>
          </div>

          {/* Statut abonnement */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {planLabel ? (
                <Infinity size={18} style={{ color: '#E63946' }} />
              ) : (
                <Zap size={18} style={{ color: '#E63946' }} />
              )}
              <div>
                <p className="text-sm font-medium text-white">Abonnement</p>
                <p className="text-xs" style={{ color: '#6b7280' }}>
                  {planLabel ?? `Gratuit — ${balance} crédits restants`}
                </p>
              </div>
            </div>
            {!planLabel && (
              <Link
                href="/game/pricing"
                className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)', color: '#fff' }}
              >
                Passer Pro
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Liens utiles */}
      <div>
        <p className="text-xs uppercase tracking-wider mb-2 px-1 font-semibold" style={{ color: '#555' }}>
          Aide & Légal
        </p>
        <div className="rounded-2xl overflow-hidden border" style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}>
          {[
            { icon: Share2,      label: "Partager l'application", action: handleShare },
            { icon: HelpCircle,  label: 'Nous contacter',         href: 'mailto:contact@crushmaxxing.fr' },
            { icon: Lock,        label: 'Confidentialité',         href: '/privacy' },
            { icon: Shield,      label: "Conditions d'utilisation", href: '/terms' },
          ].map((item, index, arr) => {
            const inner = (
              <div
                className={`flex items-center justify-between p-4 cursor-pointer hover:bg-[#252525] transition-colors ${index < arr.length - 1 ? 'border-b' : ''}`}
                style={{ borderColor: '#2A2A2A' }}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} style={{ color: '#E63946' }} />
                  <span className="text-sm font-medium text-white">{item.label}</span>
                </div>
                <ChevronRight size={16} style={{ color: '#555' }} />
              </div>
            )
            if ('action' in item) return <button key={item.label} onClick={item.action} className="w-full text-left">{inner}</button>
            return <Link key={item.label} href={item.href!}>{inner}</Link>
          })}
        </div>
      </div>

      {/* Se désabonner (users avec abonnement actif uniquement) */}
      {!isAdmin && hasActiveSub && (
        <div>
          {unsubError && (
            <p className="text-xs mb-2 text-center" style={{ color: '#f87171' }}>{unsubError}</p>
          )}
          <button
            onClick={handleUnsubscribe}
            disabled={unsubLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
            style={{ borderColor: '#2A2A2A', color: '#9da3af', background: '#1A1A1A' }}
          >
            <CreditCard size={16} />
            {unsubLoading ? 'Résiliation en cours...' : 'Résilier mon abonnement'}
          </button>
        </div>
      )}

      {/* Déconnexion */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
        style={{ borderColor: '#E63946', color: '#E63946', background: 'rgba(230,57,70,0.06)' }}
      >
        <LogOut size={16} />
        {loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
      </button>

      {/* Supprimer le compte (users uniquement, pas admin) */}
      {!isAdmin && (
        <div>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-medium transition-all"
              style={{ color: '#555' }}
            >
              <Trash2 size={14} />
              Supprimer mon compte
            </button>
          ) : (
            <div
              className="rounded-2xl p-5 border space-y-4"
              style={{ background: 'rgba(230,57,70,0.06)', borderColor: 'rgba(230,57,70,0.3)' }}
            >
              <p className="text-sm text-white font-semibold text-center">
                Cette action est irréversible.
              </p>
              <p className="text-xs text-center" style={{ color: '#9da3af' }}>
                Toutes tes données seront supprimées définitivement.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all"
                  style={{ borderColor: '#2A2A2A', color: '#9da3af' }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
                >
                  {deleteLoading ? 'Suppression...' : 'Confirmer'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
