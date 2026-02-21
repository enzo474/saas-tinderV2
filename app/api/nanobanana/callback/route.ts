import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * Webhook NanoBanana — doit répondre en < 15s sinon NanoBanana considère le callback comme échoué.
 *
 * Stratégie : stocker l'URL NanoBanana DIRECTEMENT dans image_url et retourner 200 immédiatement.
 * Pas de téléchargement ni d'upload Supabase ici (trop lent).
 */
export async function POST(req: NextRequest) {
  const start = Date.now()
  const imageId = req.nextUrl.searchParams.get('imageId')

  console.log(`[CB] ← Received — imageId=${imageId} (${new Date().toISOString()})`)

  let rawBody: string
  try {
    rawBody = await req.text()
    console.log(`[CB] Raw body (${rawBody.length} chars):`, rawBody.substring(0, 500))
  } catch (e: any) {
    console.error('[CB] Failed to read body:', e.message)
    return NextResponse.json({ error: 'Cannot read body' }, { status: 400 })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch (e: any) {
    console.error('[CB] JSON parse error:', e.message, '| raw:', rawBody.substring(0, 200))
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  console.log(`[CB] Parsed — code=${payload?.code}, taskId=${payload?.data?.taskId}, imageId=${imageId}`)

  // Répondre tout de suite si la génération a échoué
  if (payload?.code !== 200) {
    console.error(`[CB] Generation failed — code=${payload?.code}, msg=${payload?.msg}`)
    if (imageId) {
      const supabase = createServiceRoleClient()
      await supabase
        .from('generated_images')
        .update({ image_url: `error:${payload?.code}:${payload?.msg}` })
        .eq('id', imageId)
    }
    return NextResponse.json({ received: true })
  }

  // Extraire l'URL résultat (plusieurs formats possibles)
  const info = payload?.data?.info
  const resultImageUrl: string | undefined =
    info?.resultImageUrl ||
    (Array.isArray(info?.result_urls) ? info.result_urls[0] : info?.result_urls) ||
    (Array.isArray(payload?.data?.result_urls) ? payload.data.result_urls[0] : payload?.data?.result_urls) ||
    payload?.data?.resultImageUrl

  console.log(`[CB] resultImageUrl=${resultImageUrl}`)

  if (!resultImageUrl) {
    console.error('[CB] No image URL found in payload:', JSON.stringify(payload))
    return NextResponse.json({ error: 'No result image URL' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()

  // Trouver le record — par imageId (priorité) ou par nanobanana_task_id (fallback)
  let imageRecord: any = null

  if (imageId) {
    console.log(`[CB] Looking up by id=${imageId}`)
    const { data, error } = await supabase
      .from('generated_images')
      .select('id, user_id, analysis_id')
      .eq('id', imageId)
      .single()
    console.log(`[CB] Lookup by id → found=${!!data}, error=${error?.message}`)
    imageRecord = data
  }

  if (!imageRecord && payload?.data?.taskId) {
    const taskId = payload.data.taskId
    console.log(`[CB] Fallback lookup by nanobanana_task_id=${taskId}`)
    const { data, error } = await supabase
      .from('generated_images')
      .select('id, user_id, analysis_id')
      .eq('nanobanana_task_id', taskId)
      .single()
    console.log(`[CB] Lookup by taskId → found=${!!data}, error=${error?.message}`)
    imageRecord = data
  }

  if (!imageRecord) {
    console.error(`[CB] Record not found — imageId=${imageId}, taskId=${payload?.data?.taskId}`)
    // On retourne quand même 200 pour que NanoBanana ne retente pas indéfiniment
    return NextResponse.json({ received: true, warning: 'record not found' })
  }

  // Mettre à jour image_url avec l'URL NanoBanana directement (< 1s)
  console.log(`[CB] Updating record ${imageRecord.id} with URL: ${resultImageUrl}`)
  const { error: updateError } = await supabase
    .from('generated_images')
    .update({ image_url: resultImageUrl })
    .eq('id', imageRecord.id)

  if (updateError) {
    console.error(`[CB] Update failed:`, updateError.message)
    return NextResponse.json({ error: 'Update failed', details: updateError.message }, { status: 500 })
  }

  const elapsed = Date.now() - start
  console.log(`[CB] ✅ Done in ${elapsed}ms — record=${imageRecord.id}, url=${resultImageUrl}`)

  return NextResponse.json({ success: true, imageUrl: resultImageUrl })
}
