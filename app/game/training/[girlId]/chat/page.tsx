'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Send, ArrowLeft, RefreshCw, Star, Trophy, Zap, X, Gem } from 'lucide-react'

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

/* ── Paywall popup ── */
function PaywallPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.65)' }}>
      <div
        className="w-full rounded-t-3xl px-6 py-8 text-center"
        style={{ background: '#1C1C1E' }}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: '#2A2A2A' }}
        >
          <X size={16} color="#888" />
        </button>

        <Gem size={40} color="#E63946" className="mx-auto mb-4" />
        <h3
          className="text-white font-black text-xl mb-2"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          Deviens le Tombeur Ultime !
        </h3>
        <p className="text-sm mb-6" style={{ color: '#888' }}>
          Réponses illimitées • Toutes les filles IA • Sans pub
        </p>

        <div className="flex flex-col gap-3">
          <button
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-98"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
            onClick={() => window.open('/game/profile', '_self')}
          >
            Passer Premium 💎
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-medium"
            style={{ color: '#666' }}
          >
            Continuer gratuitement
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Rizz bar ── */
function RizzBar({ value }: { value: number }) {
  const color = value >= 70 ? '#22C55E' : value >= 40 ? '#F59E0B' : '#E63946'
  const label = value >= 70 ? '🔥 Chaud' : value >= 40 ? '😐 Neutre' : '❄️ Froid'
  return (
    <div className="px-4 py-2 flex items-center gap-3" style={{ background: '#0D0D0D' }}>
      <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#666' }}>Rizz</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#2A2A2A' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, #E63946, ${color})` }}
        />
      </div>
      <span className="text-xs font-bold flex-shrink-0" style={{ color }}>
        {label} · {value}%
      </span>
    </div>
  )
}

/* ── Result modal ── */
function ResultModal({ result, girlName, onClose }: { result: ResultData; girlName: string; onClose: () => void }) {
  const router = useRouter()
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-3xl p-8 border text-center"
        style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}
      >
        <div className="mb-5">
          {result.dateObtained ? (
            <>
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="font-montserrat text-2xl font-bold text-white mb-1">Date obtenu !</h2>
              <p className="text-sm" style={{ color: '#888' }}>Tu as convaincu {girlName} — respect</p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-3">{result.finalRizz >= 40 ? '😅' : '💀'}</div>
              <h2 className="font-montserrat text-2xl font-bold text-white mb-1">
                {result.finalRizz >= 40 ? 'Pas mal...' : 'Raté !'}
              </h2>
              <p className="text-sm" style={{ color: '#888' }}>
                {result.finalRizz >= 40 ? 'T\'étais proche, entraîne-toi encore' : 'Il faut s\'entraîner plus'}
              </p>
            </>
          )}
        </div>

        <div className="flex justify-center gap-1.5 mb-5">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={30} style={s <= result.stars ? { color: '#E63946', fill: '#E63946' } : { color: '#333' }} />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl p-4" style={{ background: '#252525' }}>
            <p className="text-xs mb-1" style={{ color: '#888' }}>Rizz final</p>
            <p className="font-montserrat text-xl font-bold text-white">{result.finalRizz}%</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: '#252525' }}>
            <p className="text-xs mb-1" style={{ color: '#888' }}>XP gagné</p>
            <p className="font-montserrat text-xl font-bold" style={{ color: '#E63946' }}>+{result.xpEarned}</p>
          </div>
        </div>

        {result.levelUp && (
          <div
            className="rounded-xl p-4 mb-5 border"
            style={{ background: 'rgba(230,57,70,0.08)', borderColor: 'rgba(230,57,70,0.3)' }}
          >
            <p className="font-semibold text-white mb-1">⬆️ Niveau {result.levelUp.oldLevel} → {result.levelUp.newLevel}</p>
            <p className="text-sm" style={{ color: '#E63946' }}>{LEVEL_NAMES[result.levelUp.newLevel]}</p>
            {result.levelUp.newGirlsUnlocked.length > 0 && (
              <p className="text-xs mt-1" style={{ color: '#888' }}>
                🔓 {result.levelUp.newGirlsUnlocked.map(g => g.name).join(', ')} débloquée(s) !
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => { onClose(); window.location.reload() }}
            className="w-full py-4 rounded-2xl text-white font-semibold transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
          >
            Rejouer 🎮
          </button>
          <button
            onClick={() => router.push('/game/training')}
            className="w-full py-3 rounded-2xl text-sm font-medium border"
            style={{ borderColor: '#2A2A2A', color: '#888' }}
          >
            Retour au Training
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Chat intro screen ── */
function GirlIntro({ girlInfo, onStart, onPaywall }: {
  girlInfo: GirlInfo
  onStart: () => void
  onPaywall: () => void
}) {
  return (
    <div
      className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center"
      style={{ background: '#0A0A0A', minHeight: '70vh' }}
    >
      <p
        className="font-semibold text-sm mb-6"
        style={{ color: '#E63946', fontFamily: 'var(--font-montserrat)' }}
      >
        Ton Objectif : obtenir un date avec elle !
      </p>

      <div
        className="w-28 h-28 rounded-full flex items-center justify-center mb-4 text-5xl"
        style={{
          background: '#1A1A1A',
          border: '3px solid #E63946',
        }}
      >
        👤
      </div>

      <h3
        className="text-white font-black text-2xl mb-2"
        style={{ fontFamily: 'var(--font-montserrat)' }}
      >
        {girlInfo.name}
      </h3>
      <p className="text-sm leading-relaxed mb-8 max-w-xs" style={{ color: '#888' }}>
        {girlInfo.bio || `${girlInfo.name} est ${girlInfo.personality_type.toLowerCase()}.`}
      </p>

      <button
        onClick={onStart}
        className="w-full max-w-xs py-4 rounded-2xl text-white font-bold text-base active:scale-95 transition-all"
        style={{ background: 'linear-gradient(135deg, #E63946, #FF4757)' }}
      >
        Commencer la conversation
      </button>
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
  const [showIntro, setShowIntro] = useState(true)
  const [showPaywall, setShowPaywall] = useState(false)
  const [msgCount, setMsgCount] = useState(0)

  const bottomRef = useRef<HTMLDivElement>(null)

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
        if ((d.messages ?? []).length > 0) setShowIntro(false)
      })
      .catch(e => { setInitError(e.message); setInitLoading(false) })
  }, [girlIndex])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !conversationId || sending) return

    // Show paywall after 3 free messages (demo)
    if (msgCount >= 3 && !showPaywall) {
      setShowPaywall(true)
      return
    }

    const msg = input.trim()
    setInput('')
    setSending(true)
    setMsgCount(prev => prev + 1)

    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date().toISOString() }])

    try {
      const res = await fetch('/api/training/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, userMessage: msg }),
      })
      const data = await res.json()
      if (data.error) { setSending(false); return }
      setMessages(prev => [...prev, { role: 'assistant', content: data.aiResponse, timestamp: new Date().toISOString(), rizzDelta: data.rizzDelta }])
      setRizz(data.currentRizz)
    } catch { }
    finally { setSending(false) }
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
    } catch { }
    finally { setCompleting(false) }
  }

  if (initLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" style={{ background: '#0A0A0A' }}>
        <RefreshCw size={32} className="animate-spin" style={{ color: '#E63946' }} />
        <p className="text-sm" style={{ color: '#888' }}>Chargement...</p>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-6" style={{ background: '#0A0A0A', minHeight: '100vh' }}>
        <div className="text-5xl mb-4">{initError.includes('débloquée') ? '🔒' : '⚠️'}</div>
        <h2 className="font-montserrat text-xl font-bold text-white mb-3">
          {initError.includes('débloquée') ? 'Meuf verrouillée' : 'Erreur'}
        </h2>
        <p className="text-sm mb-6" style={{ color: '#888' }}>{initError}</p>
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
    <div className="flex flex-col" style={{ height: '100dvh', background: '#0A0A0A' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: '#1F1F1F', background: '#0D0D0D' }}
      >
        <button
          onClick={() => router.push('/game/training')}
          className="w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ background: '#1A1A1A', color: '#888' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
          style={{ background: '#252525', border: '2px solid #E63946' }}
        >
          👤
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-montserrat font-bold text-white text-base truncate">{girlInfo?.name ?? '...'}</p>
          <p className="text-xs truncate" style={{ color: '#888' }}>{girlInfo?.personality_type ?? ''}</p>
        </div>
        <div
          className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
          style={{ background: 'rgba(230,57,70,0.15)', color: '#E63946', border: '1px solid rgba(230,57,70,0.3)' }}
        >
          Rizz {rizz}%
        </div>
        <button
          onClick={endConversation}
          disabled={completing || messages.length < 4}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-30"
          style={{ background: 'rgba(230,57,70,0.1)', color: '#E63946', border: '1px solid rgba(230,57,70,0.2)' }}
        >
          {completing ? <RefreshCw size={12} className="animate-spin" /> : <Trophy size={12} />}
          Fin
        </button>
      </div>

      {/* Rizz bar */}
      <RizzBar value={rizz} />

      {/* Content: intro OR messages */}
      {showIntro && girlInfo ? (
        <GirlIntro
          girlInfo={girlInfo}
          onStart={() => setShowIntro(false)}
          onPaywall={() => setShowPaywall(true)}
        />
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: '#0A0A0A' }}>
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">💬</div>
              <p className="font-semibold text-white mb-1">Envoie ton premier message</p>
              <p className="text-xs" style={{ color: '#555' }}>
                À toi de faire le premier pas avec {girlInfo?.name}
              </p>
            </div>
          )}
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user'
            return (
              <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2 items-end`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: '#252525', border: '1px solid #333' }}>
                    👤
                  </div>
                )}
                <div className="max-w-[78%] space-y-0.5">
                  <div
                    className="px-4 py-2.5 text-sm leading-relaxed"
                    style={{
                      background: isUser ? 'linear-gradient(135deg, #E63946, #FF4757)' : '#1A1A1A',
                      color: '#fff',
                      borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      border: isUser ? 'none' : '1px solid #2A2A2A',
                    }}
                  >
                    {msg.content}
                  </div>
                  {!isUser && msg.rizzDelta !== undefined && (
                    <div className="flex items-center gap-1 text-[10px]">
                      <Zap size={10} style={{ color: msg.rizzDelta >= 0 ? '#22C55E' : '#EF4444' }} />
                      <span style={{ color: msg.rizzDelta >= 0 ? '#22C55E' : '#EF4444' }}>
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
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm" style={{ background: '#252525', border: '1px solid #333' }}>👤</div>
              <div className="px-4 py-3 flex gap-1" style={{ background: '#1A1A1A', borderRadius: '18px 18px 18px 4px', border: '1px solid #2A2A2A' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#666', animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      {!showIntro && (
        <div className="px-4 py-3 border-t flex-shrink-0" style={{ borderColor: '#1F1F1F', background: '#0D0D0D' }}>
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Ton message..."
              rows={1}
              className="flex-1 px-4 py-3 rounded-2xl text-sm resize-none outline-none text-white placeholder-gray-600"
              style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', maxHeight: 120 }}
            />
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
      )}

      {/* Paywall popup */}
      {showPaywall && <PaywallPopup onClose={() => setShowPaywall(false)} />}

      {/* Result modal */}
      {result && <ResultModal result={result} girlName={girlInfo?.name ?? ''} onClose={() => setResult(null)} />}
    </div>
  )
}
