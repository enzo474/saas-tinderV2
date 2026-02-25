'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Send, ArrowLeft, RefreshCw, Star, Trophy, Zap, Lock } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  rizzDelta?: number
}

interface GirlInfo {
  id: string
  name: string
  personality_type: string
  badge_color: string
  badge_text: string
  bio: string
}

interface ResultData {
  stars: number
  xpEarned: number
  dateObtained: boolean
  finalRizz: number
  newTotalXP: number
  newLevel: number
  levelUp: {
    oldLevel: number
    newLevel: number
    newGirlsUnlocked: { name: string; personalityType: string }[]
  } | null
}

const LEVEL_NAMES: Record<number, string> = {
  0: 'Le Raté', 1: 'Le Débutant', 2: "L'Apprenti",
  3: 'Le Progressiste', 4: 'Le Confident', 5: 'Le Séducteur', 6: "L'Alpha",
}

function RizzBar({ value }: { value: number }) {
  const color = value >= 70 ? '#4CAF50' : value >= 40 ? '#FF9800' : '#F44336'
  const label = value >= 70 ? '🔥 Chaud' : value >= 40 ? '😐 Neutre' : '❄️ Froid'
  return (
    <div className="px-4 py-3 border-b" style={{ borderColor: '#1F1F1F', background: '#0D0D0D' }}>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span style={{ color: '#9da3af' }}>Rizz-o-mètre</span>
        <span style={{ color }}>{label} · {value}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1A1A1A' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, #E63946, ${color})` }}
        />
      </div>
    </div>
  )
}

function ResultModal({ result, girlName, onClose }: {
  result: ResultData
  girlName: string
  onClose: () => void
}) {
  const router = useRouter()
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-3xl p-8 border text-center"
        style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}
      >
        {/* Résultat principal */}
        <div className="mb-6">
          {result.dateObtained ? (
            <>
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="font-montserrat text-2xl font-bold text-white mb-1">Date obtenu !</h2>
              <p style={{ color: '#9da3af' }} className="text-sm">Tu as convaincu {girlName} — respect</p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-3">{result.finalRizz >= 40 ? '😅' : '💀'}</div>
              <h2 className="font-montserrat text-2xl font-bold text-white mb-1">
                {result.finalRizz >= 40 ? 'Pas mal...' : 'Raté !'}
              </h2>
              <p style={{ color: '#9da3af' }} className="text-sm">
                {result.finalRizz >= 40 ? 'T\'étais proche, entraîne-toi encore' : 'Il faut s\'entraîner plus'}
              </p>
            </>
          )}
        </div>

        {/* Étoiles */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {[1, 2, 3, 4, 5].map(s => (
            <Star
              key={s}
              size={32}
              style={s <= result.stars
                ? { color: '#E63946', fill: '#E63946' }
                : { color: '#333' }
              }
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl p-4" style={{ background: '#252525' }}>
            <p className="text-xs mb-1" style={{ color: '#9da3af' }}>Rizz final</p>
            <p className="font-montserrat text-xl font-bold text-white">{result.finalRizz}%</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: '#252525' }}>
            <p className="text-xs mb-1" style={{ color: '#9da3af' }}>XP gagné</p>
            <p className="font-montserrat text-xl font-bold" style={{ color: '#E63946' }}>+{result.xpEarned}</p>
          </div>
        </div>

        {/* Level up */}
        {result.levelUp && (
          <div
            className="rounded-xl p-4 mb-5 border"
            style={{ background: 'rgba(230,57,70,0.08)', borderColor: 'rgba(230,57,70,0.3)' }}
          >
            <p className="font-semibold text-white mb-1">
              ⬆️ Niveau {result.levelUp.oldLevel} → {result.levelUp.newLevel}
            </p>
            <p className="text-sm" style={{ color: '#E63946' }}>
              {LEVEL_NAMES[result.levelUp.newLevel]}
            </p>
            {result.levelUp.newGirlsUnlocked.length > 0 && (
              <p className="text-xs mt-1" style={{ color: '#9da3af' }}>
                🔓 {result.levelUp.newGirlsUnlocked.map(g => g.name).join(', ')} débloquée(s) !
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => { onClose(); window.location.reload() }}
            className="w-full py-4 rounded-2xl text-white font-semibold transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
          >
            Rejouer 🎮
          </button>
          <button
            onClick={() => router.push('/game')}
            className="w-full py-3 rounded-2xl text-sm font-medium border transition-all"
            style={{ borderColor: '#2A2A2A', color: '#9da3af' }}
          >
            Retour au Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { girlId } = useParams<{ girlId: string }>()
  const router = useRouter()
  const girlIndex = parseInt(girlId, 10)

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [girlInfo, setGirlInfo] = useState<GirlInfo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [rizz, setRizz] = useState(50)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [result, setResult] = useState<ResultData | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  const [initLoading, setInitLoading] = useState(true)

  const bottomRef = useRef<HTMLDivElement>(null)

  // Initialiser la conversation
  useEffect(() => {
    if (!girlIndex || isNaN(girlIndex)) return
    fetch('/api/training/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ girlIndex }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) { setInitError(d.error); setInitLoading(false); return }
        setConversationId(d.conversationId)
        setGirlInfo(d.girlInfo)
        setMessages(d.messages ?? [])
        setRizz(d.currentRizz ?? 50)
        setInitLoading(false)
      })
      .catch(e => { setInitError(e.message); setInitLoading(false) })
  }, [girlIndex])

  // Scroll auto vers le bas
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !conversationId || sending) return
    const msg = input.trim()
    setInput('')
    setSending(true)

    // Ajouter le message user immédiatement
    setMessages(prev => [...prev, {
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString(),
    }])

    try {
      const res = await fetch('/api/training/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, userMessage: msg }),
      })
      const data = await res.json()
      if (data.error) { setSending(false); return }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.aiResponse,
        timestamp: new Date().toISOString(),
        rizzDelta: data.rizzDelta,
      }])
      setRizz(data.currentRizz)
    } catch {
      // message déjà affiché
    } finally {
      setSending(false)
    }
  }

  const endConversation = async () => {
    if (!conversationId || completing) return
    setCompleting(true)
    try {
      const res = await fetch('/api/training/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      })
      const data = await res.json()
      if (!data.error) setResult(data)
    } catch {
      // silencieux
    } finally {
      setCompleting(false)
    }
  }

  // --- États de chargement / erreur ---
  if (initLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw size={32} className="animate-spin" style={{ color: '#E63946' }} />
        <p style={{ color: '#9da3af' }}>Chargement de la conversation...</p>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="text-5xl mb-4">
          {initError.includes('débloquée') ? '🔒' : '⚠️'}
        </div>
        <h2 className="font-montserrat text-xl font-bold text-white mb-3">
          {initError.includes('débloquée') ? 'Meuf verrouillée' : 'Erreur'}
        </h2>
        <p className="text-sm mb-6" style={{ color: '#9da3af' }}>{initError}</p>
        <button
          onClick={() => router.push('/game/training')}
          className="px-6 py-3 rounded-xl text-white font-semibold"
          style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
        >
          Retour au Training
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: '#1F1F1F', background: '#0D0D0D' }}>
        <button
          onClick={() => router.push('/game/training')}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
          style={{ background: '#1A1A1A', color: '#9da3af' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: '#252525', border: '2px solid #E63946' }}
        >
          👤
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-montserrat font-bold text-white text-base truncate">
            {girlInfo?.name ?? '...'}
          </p>
          <p className="text-xs truncate" style={{ color: '#9da3af' }}>
            {girlInfo?.personality_type ?? ''}
          </p>
        </div>
        <button
          onClick={endConversation}
          disabled={completing || messages.length < 4}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'rgba(230,57,70,0.15)', color: '#E63946', border: '1px solid rgba(230,57,70,0.3)' }}
        >
          {completing ? <RefreshCw size={14} className="animate-spin" /> : <Trophy size={14} />}
          Terminer
        </button>
      </div>

      {/* Rizz bar */}
      <RizzBar value={rizz} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3" style={{ background: '#0A0A0A' }}>
        {messages.length === 0 && (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">💬</div>
            <p className="font-semibold text-white mb-1">Envoie ton premier message</p>
            <p className="text-xs" style={{ color: '#6b7280' }}>
              À toi de faire le premier pas avec {girlInfo?.name}
            </p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user'
          return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2 items-end`}>
              {!isUser && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: '#252525', border: '1px solid #333' }}
                >
                  👤
                </div>
              )}
              <div className="max-w-[78%] space-y-0.5">
                <div
                  className="px-4 py-2.5 text-sm leading-relaxed"
                  style={{
                    background: isUser ? 'linear-gradient(135deg, #E63946, #FF4757)' : '#1A1A1A',
                    color: '#ffffff',
                    borderRadius: isUser
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                    border: isUser ? 'none' : '1px solid #2A2A2A',
                  }}
                >
                  {msg.content}
                </div>
                {!isUser && msg.rizzDelta !== undefined && (
                  <div className={`flex items-center gap-1 text-[10px] ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <Zap size={10} style={{ color: msg.rizzDelta >= 0 ? '#4CAF50' : '#F44336' }} />
                    <span style={{ color: msg.rizzDelta >= 0 ? '#4CAF50' : '#F44336' }}>
                      {msg.rizzDelta >= 0 ? '+' : ''}{msg.rizzDelta} Rizz
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {sending && (
          <div className="flex justify-start gap-2 items-end">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: '#252525', border: '1px solid #333' }}
            >
              👤
            </div>
            <div
              className="px-4 py-3 flex gap-1"
              style={{ background: '#1A1A1A', borderRadius: '18px 18px 18px 4px', border: '1px solid #2A2A2A' }}
            >
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: '#9da3af', animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t" style={{ borderColor: '#1F1F1F', background: '#0D0D0D' }}>
        {messages.length < 4 && (
          <p className="text-xs mb-2 text-center" style={{ color: '#555' }}>
            Envoie au moins 4 messages avant de pouvoir terminer
          </p>
        )}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Ton message..."
              rows={1}
              className="w-full px-4 py-3 rounded-2xl text-sm resize-none outline-none text-white placeholder-gray-600"
              style={{
                background: '#1A1A1A',
                border: '1px solid #2A2A2A',
                maxHeight: 120,
              }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Modal résultat */}
      {result && (
        <ResultModal
          result={result}
          girlName={girlInfo?.name ?? ''}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  )
}
