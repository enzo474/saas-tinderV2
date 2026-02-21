import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const dynamic = 'force-dynamic'

export default function OnboardingIntro() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="font-sora font-bold text-white text-5xl md:text-6xl mb-6">
          Analysons ta situation ensemble.
        </h1>
        <p className="font-inter text-[#9da3af] text-lg md:text-xl mb-12">
          Quelques questions rapides pour comprendre où tu en es vraiment.
        </p>
        <Link href="/onboarding/step/1">
          <Button className="text-lg">
            Commencer
          </Button>
        </Link>
      </div>
    </div>
  )
}
