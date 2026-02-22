'use client'

import { useState, useEffect } from 'react'
import { Coins, Plus, RefreshCw, Search } from 'lucide-react'

interface PaidUser {
  id: string
  email: string
  credits: number
  paid_at: string
}

export function CreditManager() {
  const [users, setUsers] = useState<PaidUser[]>([])
  const [filtered, setFiltered] = useState<PaidUser[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<PaidUser | null>(null)
  const [amount, setAmount] = useState(13)
  const [adding, setAdding] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/credits')
      const data = await res.json()
      setUsers(data.users ?? [])
      setFiltered(data.users ?? [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(users.filter(u => u.email.toLowerCase().includes(q)))
  }, [search, users])

  const handleAddCredits = async () => {
    if (!selectedUser || amount < 1) return
    setAdding(true)
    setSuccess(null)
    try {
      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, credits: amount }),
      })
      const data = await res.json()
      if (!res.ok) { alert(`Erreur: ${data.error}`); return }
      setSuccess(`✅ ${amount} crédits ajoutés à ${selectedUser.email} — nouveau solde : ${data.newCredits}`)
      // Mettre à jour localement
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, credits: data.newCredits } : u))
      setSelectedUser(prev => prev ? { ...prev, credits: data.newCredits } : null)
    } catch {
      alert('Erreur lors de l\'ajout des crédits')
    } finally {
      setAdding(false)
    }
  }

  const PRESETS = [5, 13, 30, 60, 130]

  return (
    <div className="bg-[#1f2128] border border-[#2a2d36] rounded-lg p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-sora font-bold text-white text-lg flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-400" />
          Gestion des crédits
        </h3>
        <button onClick={fetchUsers} className="p-2 rounded-lg bg-[#16171b] hover:bg-[#2a2d36] transition-colors" title="Rafraîchir">
          <RefreshCw className="w-4 h-4 text-[#9da3af]" />
        </button>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9da3af]" />
        <input
          type="text"
          placeholder="Rechercher un email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#16171b] border border-[#2a2d36] rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder-[#6b7280] focus:outline-none focus:border-red-primary transition-colors"
        />
      </div>

      {/* Liste des users */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-[#9da3af] text-sm text-center py-4">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-[#9da3af] text-sm text-center py-4">Aucun utilisateur payant trouvé</p>
        ) : (
          filtered.map(u => (
            <button
              key={u.id}
              onClick={() => { setSelectedUser(u); setSuccess(null) }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all text-left ${
                selectedUser?.id === u.id
                  ? 'bg-red-primary/10 border-red-primary/50 text-white'
                  : 'bg-[#16171b] border-[#2a2d36] hover:border-[#3a3d46] text-[#9da3af] hover:text-white'
              }`}
            >
              <div>
                <p className="text-sm font-medium">{u.email}</p>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Payé le {new Date(u.paid_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <span className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                <Coins className="w-3.5 h-3.5" />
                {u.credits}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Panel ajout crédits */}
      {selectedUser && (
        <div className="bg-[#16171b] border border-[#2a2d36] rounded-lg p-4 space-y-4">
          <p className="text-white text-sm font-medium">
            Ajouter des crédits à <span className="text-red-light">{selectedUser.email}</span>
            <span className="text-[#9da3af] ml-2">(solde actuel : {selectedUser.credits})</span>
          </p>

          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setAmount(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  amount === p
                    ? 'bg-red-primary text-white'
                    : 'bg-[#2a2d36] text-[#9da3af] hover:text-white hover:bg-[#3a3d46]'
                }`}
              >
                +{p}
              </button>
            ))}
          </div>

          {/* Input custom */}
          <div className="flex gap-3">
            <input
              type="number"
              min={1}
              max={1000}
              value={amount}
              onChange={e => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-28 bg-[#1f2128] border border-[#2a2d36] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-primary transition-colors"
            />
            <button
              onClick={handleAddCredits}
              disabled={adding}
              className="flex-1 bg-red-primary hover:bg-red-dark disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {adding ? 'Ajout...' : `Ajouter ${amount} crédit${amount > 1 ? 's' : ''}`}
            </button>
          </div>

          {success && (
            <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
              {success}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
