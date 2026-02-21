import { redirect } from 'next/navigation'

/**
 * Redirige /admin vers /dashboard/admin pour que les cookies de session
 * (path /dashboard) soient bien envoyés.
 */
export default function AdminRedirect() {
  redirect('/dashboard/admin')
}
