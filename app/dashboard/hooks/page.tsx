import { Suspense } from 'react'
import { getPresaleCount } from '@/lib/presale'
import { AccrocheDemo } from '@/components/dashboard/AccrocheDemo'

export default async function HooksPage() {
  const presaleCount = await getPresaleCount()

  return (
    <Suspense fallback={<div className="text-text-secondary">Chargement...</div>}>
      <AccrocheDemo presaleCount={presaleCount} />
    </Suspense>
  )
}
