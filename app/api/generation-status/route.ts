import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

const NANOBANANA_RECORD_URL = 'https://api.nanobananaapi.ai/api/v1/nanobanana/record-info'

/**
 * GET /api/generation-status?taskId=xxx
 *
 * 1. Cherche le record par id (imageRecordId) ou par nanobanana_task_id
 * 2. Si image encore placeholder ET nanobanana_task_id disponible :
 *    → interroge directement l'API NanoBanana pour récupérer l'URL
 *    → met à jour la DB si l'image est prête
 * 3. Retourne : { status: 'pending' | 'ready' | 'not_found', imageUrl? }
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const taskId = req.nextUrl.searchParams.get('taskId')
    if (!taskId) {
      return NextResponse.json({ error: 'taskId requis' }, { status: 400 })
    }

    // 1. Chercher le record — par id (nouvelle méthode) puis par nanobanana_task_id
    let record: { id: string; image_url: string; nanobanana_task_id?: string | null } | null = null

    const byId = await supabase
      .from('generated_images')
      .select('id, image_url, nanobanana_task_id')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single()

    if (byId.data) {
      record = byId.data
    } else {
      const byTaskId = await supabase
        .from('generated_images')
        .select('id, image_url, nanobanana_task_id')
        .eq('nanobanana_task_id', taskId)
        .eq('user_id', user.id)
        .single()
      record = byTaskId.data || null
    }

    if (!record) {
      return NextResponse.json({ status: 'not_found' })
    }

    const isPlaceholder =
      !record.image_url ||
      record.image_url.includes('placeholder.com') ||
      record.image_url.startsWith('error:')

    // 2. Image déjà prête
    if (!isPlaceholder) {
      return NextResponse.json({ status: 'ready', imageUrl: record.image_url })
    }

    // 3. Image encore en attente → interroger NanoBanana directement si on a le taskId
    const nanoTaskId = record.nanobanana_task_id
    if (nanoTaskId && process.env.NANOBANANA_API_KEY) {
      try {
        const nanoRes = await fetch(`${NANOBANANA_RECORD_URL}?taskId=${nanoTaskId}`, {
          headers: {
            Authorization: `Bearer ${process.env.NANOBANANA_API_KEY}`,
            'Content-Type': 'application/json',
          },
          next: { revalidate: 0 },
        })

        if (nanoRes.ok) {
          const nanoData = await nanoRes.json()
          console.log(`[Status] NanoBanana record-info for ${nanoTaskId}:`, JSON.stringify(nanoData).substring(0, 300))

          // successFlag: 1 = SUCCESS
          if (nanoData.code === 200 && nanoData.data?.successFlag === 1) {
            const imageUrl =
              nanoData.data.response?.resultImageUrl ||
              nanoData.data.response?.originImageUrl

            if (imageUrl) {
              // Mettre à jour la DB via service role
              await supabaseAdmin
                .from('generated_images')
                .update({ image_url: imageUrl })
                .eq('id', record.id)

              console.log(`[Status] ✅ Image récupérée via polling NanoBanana: ${imageUrl}`)
              return NextResponse.json({ status: 'ready', imageUrl })
            }
          }

          // Échec de génération
          if (nanoData.data?.successFlag === 2 || nanoData.data?.successFlag === 3) {
            console.error(`[Status] NanoBanana generation failed: flag=${nanoData.data.successFlag}`)
            return NextResponse.json({ status: 'failed', error: nanoData.data.errorMessage || 'Generation failed' })
          }
        }
      } catch (nanoError: any) {
        console.error('[Status] NanoBanana record-info error:', nanoError.message)
        // On continue et retourne pending
      }
    }

    return NextResponse.json({ status: 'pending' })

  } catch (err: any) {
    console.error('Generation status error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
