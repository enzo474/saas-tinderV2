import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/generation-status?taskId=xxx
 * Retourne le statut de la génération : pending | ready | not_found
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const taskId = req.nextUrl.searchParams.get('taskId')
    if (!taskId) {
      return NextResponse.json({ error: 'taskId requis' }, { status: 400 })
    }

    const { data: imageRecord, error } = await supabase
      .from('generated_images')
      .select('image_url')
      .eq('nanobanana_task_id', taskId)
      .eq('user_id', user.id)
      .single()

    if (error || !imageRecord) {
      return NextResponse.json({ status: 'not_found' }, { status: 200 })
    }

    const isPlaceholder =
      !imageRecord.image_url ||
      imageRecord.image_url.includes('placeholder.com') ||
      imageRecord.image_url.includes('placeholder')

    if (isPlaceholder) {
      return NextResponse.json({ status: 'pending' })
    }

    return NextResponse.json({
      status: 'ready',
      imageUrl: imageRecord.image_url,
    })
  } catch (err: any) {
    console.error('Generation status error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
