'use client'

import { useState } from 'react'
import { Coins, Plus, Infinity, Sparkles, MessageCircle, Users, LogOut, Trash2 } from 'lucide-react'
import { RechargeModal } from '@/components/credits/RechargeModal'
import { formatCredits } from '@/lib/credits'
import { deleteAccount } from '@/app/auth/actions'

interface SettingsContentProps {
  credits: number
  isAdmin: boolean
  presalePurchasedAt: string | null
  paidAt: string | null
}

export function SettingsContent({
  credits,
  isAdmin,
  presalePurchasedAt,
  paidAt,
}: SettingsContentProps) {
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
                className="bg-[#6366f1] hover:bg-[#5558e3] text-white px-4 py-2 rounded-lg font-inter text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Recharger
              </button>
            )}
          </div>
        </section>

        {/* Messages Accroche - grisé Bientôt */}
        <section className="bg-[#1f2128] border border-[#2a2d36] rounded-lg p-6 opacity-70">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-sora font-bold text-[#9da3af] text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Messages Accroche
            </h2>
            <span className="text-xs bg-[#fbbf24] text-black px-2 py-0.5 rounded-full font-medium">
              Bientôt
            </span>
          </div>
          <p className="font-inter text-[#6b7280] text-sm">
            Fonctionnalité en cours de développement — sortie prévue prochainement.
          </p>
          {presalePurchasedAt && (
            <p className="font-inter text-green-500/80 text-sm mt-2">
              Prévente achetée — vous aurez accès en priorité.
            </p>
          )}
        </section>

        {/* Messages Discussion - grisé Bientôt */}
        <section className="bg-[#1f2128] border border-[#2a2d36] rounded-lg p-6 opacity-70">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-sora font-bold text-[#9da3af] text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Messages Discussion
            </h2>
            <span className="text-xs bg-[#fbbf24] text-black px-2 py-0.5 rounded-full font-medium">
              Bientôt
            </span>
          </div>
          <p className="font-inter text-[#6b7280] text-sm">
            Fonctionnalité en cours de développement — sortie prévue prochainement.
          </p>
          {presalePurchasedAt && (
            <p className="font-inter text-green-500/80 text-sm mt-2">
              Prévente achetée — vous aurez accès en priorité.
            </p>
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

        {/* Se désabonner */}
        <section className="bg-[#1f2128] border border-[#2a2d36] rounded-lg p-6">
          <h2 className="font-sora font-bold text-white text-lg mb-3 flex items-center gap-2">
            <LogOut className="w-5 h-5" />
            Se désabonner
          </h2>
          <p className="font-inter text-[#9da3af] text-sm">
            Pour résilier votre abonnement, contactez-nous à{' '}
            <a
              href="mailto:contact@cruchmaxxing.fr"
              className="text-[#6366f1] hover:underline"
            >
              contact@cruchmaxxing.fr
            </a>
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
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 rounded-lg font-inter text-sm font-medium text-red-primary border border-red-primary/40 hover:bg-red-primary/10 transition-colors"
            >
              Supprimer mon compte
            </button>
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
