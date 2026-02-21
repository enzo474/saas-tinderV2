import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ImageGallery } from '@/components/dashboard/ImageGallery'

const styleToSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

export default async function ImageFolderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  let items: { id: string; image_url: string; photo_number: number; generation_type: string; created_at: string }[] = []
  let label = ''

  if (slug === 'image-reprise') {
    const { data } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', user.id)
      .eq('generation_type', 'regeneration')
      .order('created_at', { ascending: false })
    items = (data || []).filter(
      (img) => img.image_url && !img.image_url.includes('placeholder.com') && !img.image_url.includes('undefined')
    )
    label = 'Image reprise'
  } else {
    const { data: styles } = await supabase.from('photo_styles').select('id, style_name')
    const styleBySlug = new Map<string, { id: string; style_name: string }>()
    for (const s of styles || []) {
      styleBySlug.set(styleToSlug(s.style_name), { id: s.id, style_name: s.style_name })
    }
    const match = styleBySlug.get(slug)
    if (!match) {
      if (slug === 'sans-style') {
        const { data } = await supabase
          .from('generated_images')
          .select('*')
          .eq('user_id', user.id)
          .is('style_id', null)
          .neq('generation_type', 'regeneration')
          .order('created_at', { ascending: false })
        items = (data || []).filter(
          (img) => img.image_url && !img.image_url.includes('placeholder.com') && !img.image_url.includes('undefined')
        )
        label = 'Sans style'
      } else {
        notFound()
      }
    } else {
      const { data } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', user.id)
        .eq('style_id', match.id)
        .order('created_at', { ascending: false })
      items = (data || []).filter(
        (img) => img.image_url && !img.image_url.includes('placeholder.com') && !img.image_url.includes('undefined')
      )
      label = match.style_name
    }
  }

  if (items.length === 0 && slug !== 'image-reprise') notFound()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href="/dashboard/home"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l&apos;accueil
      </Link>
      <div>
        <h1 className="font-montserrat font-bold text-white text-xl md:text-2xl mb-1">{label}</h1>
        <p className="text-text-secondary text-sm">
          {items.length} image{items.length > 1 ? 's' : ''} dans ce dossier
        </p>
      </div>
      <ImageGallery initialImages={items} userId={user.id} />
    </div>
  )
}
