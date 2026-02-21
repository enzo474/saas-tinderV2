import { Lock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ComingSoonPresaleProps {
  title: string
  icon: LucideIcon
}

export function ComingSoonPresale({ title, icon: Icon }: ComingSoonPresaleProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#1f2128] border border-[#2a2d36] rounded-lg p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <Icon className="w-10 h-10 text-white" />
          <div className="absolute -bottom-1 -right-1 bg-[#fbbf24] rounded-full p-1.5">
            <Lock className="w-4 h-4 text-black" />
          </div>
        </div>

        <h1 className="font-sora font-bold text-white text-3xl mb-3">
          {title}
        </h1>
        <p className="font-inter text-[#9da3af] text-lg mb-6">
          En cours de développement — sortie prévue dans 2 semaines
        </p>

        <div className="bg-[#13151a] border border-[#2a2d36] rounded-lg p-6 mb-6 text-left">
          <h3 className="font-sora font-bold text-white text-lg mb-4">
            Prévente — 50 places disponibles
          </h3>
          <p className="font-inter text-[#9da3af] text-sm mb-4">
            Les 50 premières places bénéficient de <span className="text-green-500 font-semibold">-50%</span> sur l&apos;abonnement à vie tant que vous restez abonné.
          </p>
          <div className="space-y-4">
            <div className="bg-[#1f2128] rounded-lg p-4 border border-[#2a2d36]">
              <p className="font-sora font-bold text-white">Pack 1</p>
              <p className="font-inter text-[#9da3af] text-sm">100 générations de messages via image</p>
              <p className="font-inter text-[#6366f1] font-semibold mt-2">9,90 €</p>
            </div>
            <div className="bg-[#1f2128] rounded-lg p-4 border border-[#2a2d36]">
              <p className="font-sora font-bold text-white">Pack 2</p>
              <p className="font-inter text-[#9da3af] text-sm">300 générations de messages via image</p>
              <p className="font-inter text-[#6366f1] font-semibold mt-2">19,90 €</p>
            </div>
          </div>
        </div>

        <button
          disabled
          className="bg-[#6366f1] text-white px-6 py-3 rounded-lg font-inter font-medium opacity-50 cursor-not-allowed"
        >
          S&apos;inscrire aux préventes — Bientôt
        </button>
      </div>
    </div>
  )
}
