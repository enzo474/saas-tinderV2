import { redirect } from 'next/navigation'

/**
 * Page racine du dashboard
 * Redirige automatiquement vers /dashboard/home
 */
export default function DashboardPage() {
  redirect('/dashboard/home')
}
