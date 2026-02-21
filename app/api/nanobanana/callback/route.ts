import { NextRequest, NextResponse } from 'next/server'
import { validateCallbackPayload, downloadImage } from '@/lib/nanobanana/api'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * Webhook pour recevoir les images générées par NanoBanana Pro
 * 
 * Appelé automatiquement par NanoBanana quand une image est prête
 * 
 * Payload reçu:
 * {
 *   code: 200,
 *   data: {
 *     taskId: string,
 *     info: {
 *       resultImageUrl: string
 *     }
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()

    // Récupérer l'imageId passé en query param (nouvelle méthode fiable)
    const imageId = req.nextUrl.searchParams.get('imageId')

    let payload: any
    try {
      payload = JSON.parse(rawBody)
    } catch (parseError) {
      console.error('[NanoBanana Callback] Failed to parse JSON:', parseError)
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    if (!payload || !payload.data) {
      console.error('[NanoBanana Callback] Missing data field:', payload)
      return NextResponse.json({ error: 'Invalid payload structure' }, { status: 400 })
    }

    const taskId = payload.data?.taskId || 'unknown'

    // Gérer l'échec de génération
    if (payload.code !== 200) {
      console.error(`[NanoBanana Callback] Generation failed: code=${payload.code}, msg=${payload.msg}, taskId=${taskId}`)
      // Marquer l'image comme échouée si on a l'imageId
      if (imageId) {
        const supabase = createServiceRoleClient()
        await supabase
          .from('generated_images')
          .update({ image_url: 'https://placeholder.com/error/failed.png' })
          .eq('id', imageId)
      }
      return NextResponse.json({ received: true })
    }

    // Extraire l'URL de l'image générée
    let resultImageUrl: string | undefined

    if (payload.data.info?.resultImageUrl) {
      resultImageUrl = payload.data.info.resultImageUrl
    } else if (payload.data.info?.result_urls) {
      const r = payload.data.info.result_urls
      resultImageUrl = Array.isArray(r) ? r[0] : r
    } else if (payload.data.result_urls) {
      const r = payload.data.result_urls
      resultImageUrl = Array.isArray(r) ? r[0] : r
    } else if (payload.data.resultImageUrl) {
      resultImageUrl = payload.data.resultImageUrl
    }

    if (!resultImageUrl) {
      console.error('[NanoBanana Callback] No result image URL in payload:', JSON.stringify(payload))
      return NextResponse.json({ error: 'No result image URL' }, { status: 400 })
    }

    console.log(`[NanoBanana Callback] Received — imageId=${imageId}, taskId=${taskId}, url=${resultImageUrl}`)

    const supabase = createServiceRoleClient()

    // 1. Trouver le record — priorité à imageId (passé dans l'URL), fallback sur nanobanana_task_id
    let imageRecord: any = null
    let fetchError: any = null

    if (imageId) {
      const res = await supabase
        .from('generated_images')
        .select('*')
        .eq('id', imageId)
        .single()
      imageRecord = res.data
      fetchError = res.error
    }

    if (!imageRecord && taskId !== 'unknown') {
      // Fallback: chercher par nanobanana_task_id
      const res = await supabase
        .from('generated_images')
        .select('*')
        .eq('nanobanana_task_id', taskId)
        .single()
      imageRecord = res.data
      fetchError = res.error
    }

    if (!imageRecord) {
      console.error(`[NanoBanana Callback] Record not found — imageId=${imageId}, taskId=${taskId}`, fetchError)
      return NextResponse.json({ error: 'Image record not found' }, { status: 404 })
    }

    // 2. Télécharger l'image depuis l'URL NanoBanana
    console.log(`[NanoBanana Callback] Downloading image from: ${resultImageUrl}`)
    let imageBuffer: Buffer
    try {
      imageBuffer = await downloadImage(resultImageUrl)
    } catch (downloadError: any) {
      console.error(`[NanoBanana Callback] Failed to download image:`, downloadError)
      return NextResponse.json({ error: 'Failed to download image' }, { status: 500 })
    }

    // 3. Upload vers Supabase Storage
    const fileName = `${imageRecord.user_id}/${taskId}.png`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(`generated-photos/${fileName}`, imageBuffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      console.error(`[NanoBanana Callback] Failed to upload to Supabase:`, uploadError)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    // 4. Obtenir l'URL publique
    const { data: publicUrlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(`generated-photos/${fileName}`)

    const finalImageUrl = publicUrlData.publicUrl

    // 5. Mettre à jour le record avec l'URL finale
    const { error: updateError } = await supabase
      .from('generated_images')
      .update({
        image_url: finalImageUrl,
      })
      .eq('id', imageRecord.id)

    if (updateError) {
      console.error(`[NanoBanana Callback] Failed to update image record:`, updateError)
      return NextResponse.json({ error: 'Failed to update image record' }, { status: 500 })
    }

    console.log(`[NanoBanana Callback] Successfully processed taskId: ${taskId}, Final URL: ${finalImageUrl}`)

    // 6. Vérifier si toutes les 5 images sont prêtes pour cet utilisateur
    const { data: allImages } = await supabase
      .from('generated_images')
      .select('image_url, photo_number')
      .eq('user_id', imageRecord.user_id)
      .eq('analysis_id', imageRecord.analysis_id)
      .order('photo_number')

    if (allImages && allImages.length === 5) {
      const allReady = allImages.every(img => img.image_url && !img.image_url.includes('placeholder'))
      
      if (allReady) {
        // Toutes les images sont prêtes, mettre à jour l'analyse
        const imageUrls = allImages.map(img => img.image_url)
        
        await supabase
          .from('analyses')
          .update({
            generated_photos_urls: imageUrls,
          })
          .eq('id', imageRecord.analysis_id)

        console.log(`[NanoBanana Callback] All 5 images ready for analysis: ${imageRecord.analysis_id}`)
      }
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl: finalImageUrl 
    })

  } catch (error: any) {
    console.error('[NanoBanana Callback] Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 })
  }
}
