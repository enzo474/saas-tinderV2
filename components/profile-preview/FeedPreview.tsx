'use client'

import { Heart, X, Star, MessageCircle, Zap, RefreshCw, Send, Flame, Compass, User, ChevronUp, MapPin } from 'lucide-react'
import { useState } from 'react'

type AppType = 'tinder' | 'fruitz' | 'hinge'

interface FeedPreviewProps {
  appType: AppType
  images: string[]
  bio: string
}

export function FeedPreview({ appType, images, bio }: FeedPreviewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  if (appType === 'tinder') {
    const displayName = 'Prénom, âge à configurer'
    const displayBio = bio || 'Bio à configurer'
    const displayDistance = 'à configurer'

    return (
      <div className="max-w-[390px] mx-auto rounded-[2rem] overflow-hidden bg-[#0a0b0d] shadow-2xl border border-[#1f2128] relative aspect-[9/16]">
        {/* Image plein écran en arrière-plan */}
        <img
          src={images[currentImageIndex]}
          alt={`Photo ${currentImageIndex + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dégradé haut : couvre status bar + nav + indicateurs */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 via-black/20 to-transparent z-20 pointer-events-none" />

        {/* Barre de statut */}
        <div className="absolute top-0 left-0 right-0 h-6 flex items-center justify-between px-4 text-white/80 text-xs z-30">
          <span>02:00</span>
          <span className="flex gap-1 items-center">
            <span className="w-1 h-1 rounded-full bg-white/80" />
            <span className="w-1 h-1 rounded-full bg-white/80" />
            <span className="w-1 h-1 rounded-full bg-white/80" />
            <span className="w-4 h-2 rounded-sm border border-white/80" />
          </span>
        </div>

        {/* Header navigation */}
        <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-4 py-2 z-30">
          <button className="p-1 text-white/80 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="6" cy="6" r="2" />
              <circle cx="18" cy="6" r="2" />
              <line x1="6" y1="6" x2="6" y2="18" />
              <line x1="18" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="flex gap-2 text-xs">
            <span className="bg-white/15 text-white px-2 py-1.5 rounded-full font-medium whitespace-nowrap">Pour toi</span>
            <span className="text-white/80 px-1.5 py-1.5 whitespace-nowrap">Astro</span>
            <span className="text-white/80 px-1.5 py-1.5 whitespace-nowrap">Double Date</span>
            <span className="text-white/80 px-1.5 py-1.5 whitespace-nowrap">Musique</span>
          </div>
          <button className="p-1 text-[#8b5cf6]">
            <Zap className="w-5 h-5" />
          </button>
        </div>

        {/* Indicateurs photos */}
        <div className="absolute top-[70px] left-0 right-0 flex gap-1 px-4 z-30">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-0.5 flex-1 rounded-full transition-colors ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Zones cliquables navigation */}
        <div className="absolute inset-0 flex cursor-pointer z-10">
          <div className="flex-1" onClick={prevImage} />
          <div className="flex-1" onClick={nextImage} />
        </div>

        {/* Dégradé bas : couvre profil + boutons */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-20 pointer-events-none" />

        {/* Overlay profil */}
        <div className="absolute bottom-[140px] left-0 right-0 pb-4 px-4 z-30">
          <div className="relative z-10">
            {currentImageIndex === 0 && (
              <div className="flex items-start justify-between">
                <h3 className="text-white font-bold text-2xl whitespace-nowrap overflow-hidden text-ellipsis max-w-[calc(100%-3rem)]">{displayName}</h3>
                <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <ChevronUp className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
            {currentImageIndex === 1 && (
              <div className="relative">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-bold text-2xl pr-10 whitespace-nowrap overflow-hidden text-ellipsis max-w-[calc(100%-3rem)]">{displayName}</h3>
                  <button className="absolute right-0 top-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <ChevronUp className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="text-white/90 text-sm leading-relaxed line-clamp-1 whitespace-nowrap overflow-hidden text-ellipsis">{displayBio}</p>
              </div>
            )}
            {currentImageIndex === 2 && (
              <>
                <span className="inline-block bg-green-500/90 text-white text-xs px-2 py-0.5 rounded-full mb-2">Actif.ve</span>
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-2xl whitespace-nowrap overflow-hidden text-ellipsis max-w-[calc(100%-3rem)]">{displayName}</h3>
                  <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <ChevronUp className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="text-white/90 text-sm flex items-center gap-1 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {displayDistance}
                </p>
              </>
            )}
            {currentImageIndex === 3 && (
              <>
                <h3 className="text-white font-bold text-2xl mb-2 whitespace-nowrap overflow-hidden text-ellipsis">{displayName}</h3>
                <p className="text-white/70 text-xs mb-2 flex items-center gap-1 whitespace-nowrap">
                  <ChevronUp className="w-3 h-3 rotate-90 flex-shrink-0" />
                  Habitudes et Lifestyle
                </p>
                <div className="flex flex-wrap gap-2">
                  {['à configurer', 'à configurer', 'à configurer'].map((tag, i) => (
                    <span key={i} className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ChevronUp className="w-4 h-4 text-white" />
                </button>
              </>
            )}
            {(currentImageIndex === 4 || currentImageIndex === 5) && (
              <div className="flex items-start justify-between">
                <h3 className="text-white font-bold text-2xl whitespace-nowrap overflow-hidden text-ellipsis max-w-[calc(100%-3rem)]">{displayName}</h3>
                <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <ChevronUp className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="absolute bottom-[70px] left-0 right-0 flex justify-center items-center gap-3 py-4 px-4 z-30">
          <button className="relative z-10 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:scale-105 transition-transform">
            <RefreshCw className="w-7 h-7 text-[#f97316]" />
          </button>
          <button className="relative z-10 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:scale-105 transition-transform">
            <X className="w-7 h-7 text-[#ec4899]" />
          </button>
          <button className="relative z-10 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:scale-105 transition-transform">
            <Star className="w-7 h-7 text-[#4fc3f7]" />
          </button>
          <button className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-[#ff6b6b] to-[#ff8e53] flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
            <Heart className="w-8 h-8 text-white fill-white" />
          </button>
          <button className="relative z-10 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:scale-105 transition-transform">
            <Send className="w-6 h-6 text-[#4fc3f7]" />
          </button>
        </div>

        {/* Barre de navigation bas - opaque/noire */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around py-3 px-2 bg-black z-30">
          <div className="relative z-10 flex flex-col items-center gap-0.5">
            <Flame className="w-6 h-6 text-white fill-white" />
            <span className="text-white text-xs font-medium">Swipez</span>
            <div className="w-12 h-1 bg-white/30 rounded-full" />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-0.5 text-white/60">
            <Compass className="w-6 h-6" />
            <span className="text-xs">Explore</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-0.5 text-white/60">
            <Heart className="w-6 h-6" />
            <span className="text-xs">Likes</span>
            <span className="absolute -top-0.5 -right-1 w-4 h-4 bg-[#fbbf24] rounded-full text-[10px] font-bold text-black flex items-center justify-center">2</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-0.5 text-white/60">
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">Messages</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-0.5 text-white/60">
            <User className="w-6 h-6" />
            <span className="text-xs">Profil</span>
          </div>
        </div>
      </div>
    )
  }

  if (appType === 'fruitz') {
    return (
      <div className="max-w-[390px] mx-auto rounded-[2rem] overflow-hidden shadow-2xl border border-gray-200 bg-white relative aspect-[9/16]">

        {/* Header Fruitz fixe */}
        <div className="absolute top-0 left-0 right-0 z-40 bg-white">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-2.5 pb-0.5 text-[11px] font-semibold text-gray-900">
            <span>11:53</span>
            <div className="flex items-center gap-1 text-gray-700 text-[10px]">
              <span>▲▲▲</span>
              <span>WiFi</span>
              <span className="font-bold">88%</span>
            </div>
          </div>
          {/* App bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <User className="w-6 h-6 text-[#9B39C0]" />
                <span className="absolute -top-1.5 -right-1.5 text-[11px]">🎁</span>
              </div>
              <RefreshCw className="w-5 h-5 text-gray-300" />
            </div>
            <span className="font-black text-[#E91E8C] text-lg tracking-widest">FRUITZ</span>
            <div className="flex items-center gap-2.5">
              <span className="text-[17px]">🍶</span>
              <div className="relative">
                <MessageCircle className="w-5 h-5 text-[#7B2FBE]" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#E91E8C] rounded-full text-[8px] text-white flex items-center justify-center">1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Zone scrollable */}
        <div className="absolute inset-0 top-[82px] bottom-[62px] overflow-y-auto bg-white">

          {/* 1ère photo - grande format portrait */}
          <div className="mx-2 mt-1 rounded-2xl overflow-hidden relative" style={{ aspectRatio: '3/4' }}>
            {images[0] ? (
              <>
                <img src={images[0]} alt="Photo 1" className="w-full h-full object-cover" />
                {/* Scrollbar indicator */}
                <div className="absolute top-3 right-2 w-1 h-6 bg-gray-400/50 rounded-full" />
                {/* Gradient overlay bas */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />
                {/* Infos profil */}
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">🛡️</span>
                    <span className="font-bold text-base drop-shadow">Prénom · 00</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs opacity-90 mb-0.5">
                    <span>💼</span>
                    <span>à configurer</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs opacity-90">
                    <Send className="w-3 h-3" />
                    <span>xx km</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-xs">Photo principale</span>
              </div>
            )}
          </div>

          {/* Section Bio */}
          <div className="bg-white px-5 pt-4 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">📚</span>
              <span className="font-bold text-[#3D1A5E] text-sm">Bio</span>
            </div>
            {bio ? (
              <p className="text-gray-700 text-xs leading-relaxed">{bio}</p>
            ) : null}
          </div>

          {/* Section À propos de moi */}
          <div className="bg-white px-5 py-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">📍</span>
              <span className="font-bold text-[#3D1A5E] text-sm">À propos de moi</span>
            </div>
            <div className="bg-[#F8F0FF] rounded-xl px-3 py-2 text-xs text-gray-500 mb-2">
              à configurer
            </div>
            <div className="bg-[#F8F0FF] rounded-xl px-3 py-2 text-xs text-gray-500">
              à configurer
            </div>
          </div>

          {/* Section Accroches */}
          <div className="bg-white px-5 py-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">🔊</span>
              <span className="font-bold text-[#3D1A5E] text-sm">Accroches</span>
            </div>
            <div className="bg-[#FFF0F7] rounded-xl px-4 py-3 mb-2">
              <p className="text-[#E91E8C] text-[10px] mb-0.5">à configurer</p>
              <p className="text-[#3D1A5E] font-bold text-xs">à configurer</p>
            </div>
            <div className="bg-[#FFF0F7] rounded-xl px-4 py-3 mb-2">
              <p className="text-[#E91E8C] text-[10px] mb-0.5">à configurer</p>
              <p className="text-[#3D1A5E] font-bold text-xs">à configurer</p>
            </div>
          </div>

          {/* Photos suivantes */}
          {images[1] && (
            <div className="mx-2 mb-1 rounded-2xl overflow-hidden relative" style={{ aspectRatio: '3/4' }}>
              <img src={images[1]} alt="Photo 2" className="w-full h-full object-cover" />
              <div className="absolute top-3 right-2 w-1 h-6 bg-gray-400/50 rounded-full" />
            </div>
          )}
          {images[2] && (
            <div className="mx-2 mb-1 rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
              <img src={images[2]} alt="Photo 3" className="w-full h-full object-cover" />
            </div>
          )}
          {images[3] && (
            <div className="mx-2 mb-1 rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
              <img src={images[3]} alt="Photo 4" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="h-4" />
        </div>

        {/* Boutons flottants droite */}
        <div className="absolute right-3 z-40 flex flex-col gap-2" style={{ bottom: '72px' }}>
          {/* Bouton like - gradient rose/orange */}
          <button className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #ff6eb4, #ff9a3c)' }}>
            <Heart className="w-5 h-5 text-white fill-white" />
          </button>
          {/* Bouton question */}
          <div className="relative">
            <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100">
              <span className="text-[#F97316] font-black text-base">?</span>
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E91E8C] rounded-full text-[9px] text-white flex items-center justify-center font-bold">3</span>
          </div>
        </div>

        {/* Barre de navigation pill */}
        <div className="absolute bottom-2.5 left-3 right-3 z-40">
          <div className="bg-white rounded-full shadow-xl border border-gray-100 flex items-center justify-around py-2.5 px-3">
            <div className="relative">
              <span className="text-xl">🍦</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#E91E8C] rounded-full" />
            </div>
            <span className="text-xl">💎</span>
            <div className="relative">
              <span className="text-xl">🍑</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#E91E8C] rounded-full" />
            </div>
            <div className="relative">
              <span className="text-xl">⭐</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full text-[8px] text-white flex items-center justify-center font-bold">0</span>
            </div>
          </div>
        </div>

      </div>
    )
  }

  if (appType === 'hinge') {
    return (
      <div className="max-w-[390px] mx-auto rounded-[2rem] overflow-hidden shadow-2xl border border-gray-200 bg-white relative aspect-[9/16]">

        {/* Header Hinge fixe */}
        <div className="absolute top-0 left-0 right-0 z-40 bg-white">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-2.5 pb-0.5 text-[11px] font-semibold text-gray-900">
            <span>12:05</span>
            <div className="flex items-center gap-1 text-gray-700 text-[10px]">
              <span>▲▲▲</span>
              <span>WiFi</span>
              <span className="font-bold">88%</span>
            </div>
          </div>
          {/* App bar */}
          <div className="flex items-center justify-center px-4 py-2.5 relative border-b border-gray-100">
            <span className="font-bold text-gray-900 text-base">Prénom</span>
            <button className="absolute right-4 text-gray-500">
              <span className="tracking-widest text-xs font-bold">•••</span>
            </button>
          </div>
        </div>

        {/* Zone scrollable */}
        <div className="absolute inset-0 top-[78px] bottom-[56px] overflow-y-auto bg-[#F5F3EE]">
          <div className="px-3 pt-2 pb-2 space-y-3">

            {/* Photo 1 */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-100">
              {images[0] ? (
                <img src={images[0]} alt="Photo 1" className="w-full object-cover" style={{ aspectRatio: '4/5' }} />
              ) : (
                <div className="w-full bg-gray-200 flex items-center justify-center" style={{ aspectRatio: '4/5' }}>
                  <span className="text-gray-400 text-xs">Photo principale</span>
                </div>
              )}
              <button className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
                <Heart className="w-4.5 h-4.5 text-gray-700" style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Prompt 1 - bio si renseignée */}
            <div className="bg-white rounded-2xl px-5 pt-5 pb-14 relative shadow-sm">
              <p className="text-gray-400 text-xs mb-1.5">à configurer</p>
              <p className="text-gray-900 font-bold text-xl leading-snug">
                {bio || 'à configurer'}
              </p>
              <button className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center">
                <Heart className="text-gray-700" style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Photo 2 */}
            {images[1] && (
              <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                <img src={images[1]} alt="Photo 2" className="w-full object-cover" style={{ aspectRatio: '4/5' }} />
                <button className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
                  <Heart className="text-gray-700" style={{ width: '18px', height: '18px' }} />
                </button>
              </div>
            )}

            {/* Section infos */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              {/* Ligne rapide : âge, genre, taille, ville */}
              <div className="flex items-center gap-3 text-gray-700 text-xs border-b border-gray-100 pb-3 mb-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                  <span>00</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px]">👤</span>
                  <span>à configurer</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px]">📏</span>
                  <span>à configurer</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  <span>à configurer</span>
                </div>
              </div>
              {/* Détails */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                  <span>💼</span><span>à configurer</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                  <span>🏠</span><span>à configurer</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                  <span>👥</span><span>à configurer</span>
                </div>
              </div>
            </div>

            {/* Photo 3 */}
            {images[2] && (
              <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                <img src={images[2]} alt="Photo 3" className="w-full object-cover" style={{ aspectRatio: '4/5' }} />
                <button className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
                  <Heart className="text-gray-700" style={{ width: '18px', height: '18px' }} />
                </button>
              </div>
            )}

            {/* Prompt 2 */}
            <div className="bg-white rounded-2xl px-5 pt-5 pb-14 relative shadow-sm">
              <p className="text-gray-400 text-xs mb-1.5">à configurer</p>
              <p className="text-gray-900 font-bold text-xl leading-snug">à configurer</p>
              <button className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center">
                <Heart className="text-gray-700" style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Photo 4 */}
            {images[3] && (
              <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                <img src={images[3]} alt="Photo 4" className="w-full object-cover" style={{ aspectRatio: '4/5' }} />
                <button className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
                  <Heart className="text-gray-700" style={{ width: '18px', height: '18px' }} />
                </button>
              </div>
            )}

            <div className="h-16" />
          </div>
        </div>

        {/* Bouton X flottant bas gauche */}
        <div className="absolute z-40" style={{ bottom: '66px', left: '16px' }}>
          <button className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center">
            <X className="w-5 h-5 text-gray-800" />
          </button>
        </div>

        {/* Barre de navigation Hinge */}
        <div className="absolute bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100">
          <div className="flex items-center justify-around py-3 px-4">
            <button>
              <span className="font-black text-2xl text-gray-900 leading-none">H</span>
            </button>
            <button>
              <Star className="w-6 h-6 text-gray-400" />
            </button>
            <button>
              <Heart className="w-6 h-6 text-gray-400" />
            </button>
            <button>
              <MessageCircle className="w-6 h-6 text-gray-400" />
            </button>
            <button className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border border-gray-200">
              {images[0] && <img src={images[0]} alt="Profile" className="w-full h-full object-cover" />}
            </button>
          </div>
        </div>

      </div>
    )
  }

  return null
}
