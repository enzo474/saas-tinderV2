import { redirect } from 'next/navigation'

// Le middleware gère la redirection A/B (test-1 / test-2) et l'auth.
// Cette page n'est atteinte que si le middleware laisse passer (fallback).
export default function Home() {
  redirect('/onboarding-test-1')
}
