'use client'

import { useState } from 'react'
import { Coins, Plus, Infinity, Users, LogOut, Trash2, MessageSquare, AlertCircle } from 'lucide-react'
import { RechargeModal } from '@/components/credits/RechargeModal'
import { formatCredits } from '@/lib/credits'
import { deleteAccount, signOut } from '@/app/auth/actions'
import { cancelCrushTalkSubscription } from './actions'

interface SettingsContentProps {
  credits: number
  isAdmin: boolean
  presalePurchasedAt: string | null
  paidAt: string | null
  crushTalkSubscription?: { type: string; status: string } | null
}

export function SettingsContent({
  credits,
  isAdmin,
  presalePurchasedAt,
  paidAt,
  crushTalkSubscription,
}: SettingsContentProps) {
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [cancelDone, setCancelDone] = useState(false)

  const handleCancelCrushTalk = async () => {
    setIsCancelling(true)
    setCancelError(null)
    const result = await cancelCrushTalkSubscription()
    setIsCancelling(false)
    if (result.error) {
      setCancelError(result.error)
    } else {
      setCancelDone(true)
      setShowCancelConfirm(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Abonnement actuel */}
        <section className="bg-[#1f2128] border border-[#2a2d36] rounded-lg p-6">
          <h2 className="font-sora font-bold text-white text-lg mb-3">Votre abonnement</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-inter text-white font-medium">Membre Premium</p>
              {paidAt && (
                <p className="font-inter text-[#9da3af] text-sm mt-1">
                  Depuis le {new Date(paidAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Crédits */}
        <section className="bg-[#1f2128] border border-[#2a2d36] rounded-lg p-6">
          <h2 className="font-sora font-bold text-white text-lg mb-3">Vos crédits</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <>
                  <Infinity className="w-5 h-5 text-[#fbbf24]" />
                  <span className="font-inter text-white font-medium">Illimités</span>
                </>
              ) : (
                <>
                  <Coins className="w-5 h-5 text-[#fbbf24]" />
                  <span className="font-inter text-white font-medium">{formatCredits(credits)}</span>
                </>
              )}
            </div>
            {!isAdmin && (
              <button
                onClick={() => setIsRechargeModalOpen(true)}
                className="bg-red-primary hover:bg-red-dark text-white px-4 py-2 rounded-lg font-inter text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Recharger
              </button>
            )}
          </div>
        </section>

        {/* CrushTalk — abonnement */}
        <section className="bg-[#1f2128] border border-[#2a2d36] rounded-lg p-6" style={{ borderColor: 'rgba(247,127,0,0.2)' }}>
          <h2 className="font-sora font-bold text-white text-lg mb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" style={{ color: '#F77F00' }} />
            CrushTalk
          </h2>

          {crushTalkSubscription && !cancelDone ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-medium">
                    {crushTalkSubscription.type === 'charo' ? 'Pack Charo — Illimité' : 'Pack Chill — 500 crédits/mois'}
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
                    {crushTalkSubscription.type === 'charo' ? '14,90€/mois' : '8,90€/mois'} · Renouvellement automatique
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: 'rgba(247,127,0,0.15)', color: '#F77F00' }}>
                  Actif
                </span>
              </div>

              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-sm px-4 py-2 rounded-lg border transition-colors font-medium"
                  style={{ borderColor: 'rgba(247,127,0,0.3)', color: '#F77F00' }}
                >
                  Se désabonner
                </button>
              ) : (
                <div className="rounded-xl p-4 space-y-3 border" style={{ background: 'rgba(247,127,0,0.06)', borderColor: 'rgba(247,127,0,0.2)' }}>
                  <p className="text-white text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" style={{ color: '#F77F00' }} />
                    Confirmer la résiliation ?
                  </p>
                  <p className="text-xs" style={{ color: '#9da3af' }}>
                    Ton abonnement restera actif jusqu&apos;à la fin de la période en cours. Pas de remboursement.
                  </p>
                  {cancelError && <p className="text-xs text-red-400">{cancelError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelCrushTalk}
                      disabled={isCancelling}
                      className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}
                    >
                      {isCancelling ? 'Résiliation...' : 'Confirmer la résiliation'}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-[#9da3af] border border-[#2a2d36] hover:text-white transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : cancelDone ? (
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Abonnement résilié — actif jusqu&apos;à la fin de la période en cours.
            </p>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: '#6b7280' }}>Aucun abonnement CrushTalk actif.</p>
              <a
                href="/ct/pricing"
                className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white transition-opacity hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #F77F00, #FFAA33)' }}
              >
                Voir les offres
              </a>
            </div>
          )}
        </section>

        {/* Affiliation - grisé Bientôt */}
        <section className="bg-[#1f2128] border border-[#2a2d36] rounded-lg p-6 opacity-70">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-sora font-bold text-[#9da3af] text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Affiliation
            </h2>
            <span className="text-xs bg-[#fbbf24] text-black px-2 py-0.5 rounded-full font-medium">
              Bientôt
            </span>
          </div>
          <p className="font-inter text-[#6b7280] text-sm">
            Programme de parrainage en cours de développement — revenez bientôt.
          </p>
        </section>

        {/* Supprimer le compte */}
        <section className="bg-[#1f2128] border border-red-primary/30 rounded-lg p-6">
          <h2 className="font-sora font-bold text-white text-lg mb-3 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-primary" />
            Supprimer mon compte
          </h2>
          <p className="font-inter text-[#9da3af] text-sm mb-4">
            Cette action est irréversible. Toutes vos données (images, bios, analyse) seront définitivement supprimées.
          </p>

          {!showDeleteConfirm ? (
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-lg font-inter text-sm font-medium text-red-primary border border-red-primary/40 hover:bg-red-primary/10 transition-colors"
              >
                Supprimer mon compte
              </button>
              <button
                onClick={async () => {
                  setIsSigningOut(true)
                  await signOut()
                }}
                disabled={isSigningOut}
                className="px-4 py-2 rounded-lg font-inter text-sm font-medium text-white border border-[#2a2d36] hover:border-white/30 hover:bg-white/5 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {isSigningOut ? 'Déconnexion...' : 'Se déconnecter'}
              </button>
            </div>
          ) : (
            <div className="bg-red-primary/10 border border-red-primary/30 rounded-xl p-4 space-y-3">
              <p className="text-white font-semibold text-sm">Êtes-vous sûr ? Cette action est définitive.</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    setIsDeleting(true)
                    await deleteAccount()
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg font-inter text-sm font-bold text-white bg-red-primary hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Suppression...' : 'Oui, supprimer définitivement'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg font-inter text-sm font-medium text-[#9da3af] border border-[#2a2d36] hover:text-white transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        currentCredits={credits}
      />
    </>
  )
}
