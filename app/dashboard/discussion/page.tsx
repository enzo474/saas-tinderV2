import { Suspense } from 'react'
import { getPresaleCount } from '@/lib/presale'
import { DiscussionDemo } from '@/components/dashboard/DiscussionDemo'

export default async function DiscussionPage() {
  const presaleCount = await getPresaleCount()

  return (
    <Suspense fallback={<div className="text-text-secondary">Chargement...</div>}>
      <DiscussionDemo presaleCount={presaleCount} />
    </Suspense>
  )
}
