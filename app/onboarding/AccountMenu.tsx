'use client'

import { useState } from 'react'
import { signOut, deleteAccount } from '@/app/auth/actions'

interface AccountMenuProps {
  userEmail: string | null
}

export function AccountMenu({ userEmail }: AccountMenuProps) {
  const [open, setOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await deleteAccount()
  }

  return (
    <div className="relative">
      {/* Bouton compte */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-primary hover:border-red-primary/50 transition-all duration-200 text-text-secondary hover:text-white"
      >
        <div className="w-6 h-6 rounded-full bg-red-primary/20 border border-red-primary/40 flex items-center justify-center">
          <span className="text-red-light text-xs font-bold">
            {userEmail ? userEmail[0].toUpperCase() : '?'}
          </span>
        </div>
        <span className="font-inter text-xs max-w-[120px] truncate hidden sm:block">
          {userEmail ?? 'Mon compte'}
        </span>
        <span className="text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown */}
      {open && !showDeleteConfirm && (
        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-52 bg-bg-secondary border border-border-primary rounded-xl shadow-xl z-50 overflow-hidden">
          {userEmail && (
            <div className="px-4 py-3 border-b border-border-primary">
              <p className="text-text-tertiary text-xs truncate">{userEmail}</p>
            </div>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="w-full text-left px-4 py-3 text-sm font-inter text-text-secondary hover:text-white hover:bg-bg-tertiary transition-colors"
            >
              Se déconnecter
            </button>
          </form>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full text-left px-4 py-3 text-sm font-inter text-red-light hover:bg-red-primary/10 transition-colors border-t border-border-primary"
          >
            Supprimer mon compte
          </button>
        </div>
      )}

      {/* Confirmation suppression */}
      {open && showDeleteConfirm && (
        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-64 bg-bg-secondary border border-red-primary/40 rounded-xl shadow-xl z-50 p-4">
          <p className="font-montserrat font-bold text-white text-sm mb-1">
            Supprimer le compte ?
          </p>
          <p className="text-text-tertiary text-xs mb-4 leading-relaxed">
            Toutes tes données seront définitivement supprimées. Cette action est irréversible.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowDeleteConfirm(false); setOpen(false) }}
              className="flex-1 px-3 py-2 text-xs font-inter text-text-secondary border border-border-primary rounded-lg hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 px-3 py-2 text-xs font-inter font-semibold text-white bg-red-primary rounded-lg hover:bg-red-light transition-colors disabled:opacity-50"
            >
              {deleting ? '...' : 'Confirmer'}
            </button>
          </div>
        </div>
      )}

      {/* Overlay pour fermer */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setShowDeleteConfirm(false) }} />
      )}
    </div>
  )
}
