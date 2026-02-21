import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FeedbackForm } from './FeedbackForm'

export default async function FeedbackPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-montserrat font-bold text-white text-3xl md:text-4xl mb-2">
          Donnez-nous vos idées
        </h1>
        <p className="text-text-secondary">
          Proposez des fonctionnalités, des modifications, des styles ou partagez vos retours pour nous aider à améliorer Crushmaxxing.
        </p>
      </div>

      <FeedbackForm />
    </div>
  )
}
