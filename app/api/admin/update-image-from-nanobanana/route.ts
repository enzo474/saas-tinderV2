import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { isUserAdmin } from '@/lib/credits-server'
import { downloadImage } from '@/lib/nanobanana/api'

/**
 * Endpoint admin pour mettre à jour manuellement une image générée
 * avec l'URL retournée par NanoBanana
 * 
 * Usage: POST /api/admin/update-image-from-nanobanana
 * Body: { taskId: "xxx", resultImageUrl: "https://..." }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    // Vérifier authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que c'est bien un admin
    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Accès refusé - Admin uniquement' }, { status: 403 })
    }

    const { taskId, resultImageUrl } = await req.json()

    if (!taskId) {
      return NextResponse.json({ error: 'taskId requis' }, { status: 400 })
    }

    if (!resultImageUrl) {
      return NextResponse.json({ error: 'resultImageUrl requis' }, { status: 400 })
    }

    console.log(`[ADMIN] Updating image manually for taskId: ${taskId}`)
    console.log(`[ADMIN] Result URL: ${resultImageUrl}`)

    // 1. Trouver l'entrée generated_images correspondante au taskId
    const { data: imageRecord, error: fetchError } = await supabaseAdmin
      .from('generated_images')
      .select('*')
      .eq('nanobanana_task_id', taskId)
      .single()

    if (fetchError || !imageRecord) {
      console.error(`[ADMIN] Image record not found for taskId: ${taskId}`, fetchError)
      return NextResponse.json({ 
        error: 'Image record not found',
        taskId,
        details: fetchError?.message 
      }, { status: 404 })
    }

    console.log(`[ADMIN] Found image record:`, {
      id: imageRecord.id,
      userId: imageRecord.user_id,
      currentUrl: imageRecord.image_url,
    })

    // 2. Télécharger l'image depuis l'URL NanoBanana
    console.log(`[ADMIN] Downloading image from: ${resultImageUrl}`)
    let imageBuffer: Buffer
    try {
      imageBuffer = await downloadImage(resultImageUrl)
      console.log(`[ADMIN] Image downloaded successfully, size: ${imageBuffer.length} bytes`)
    } catch (downloadError: any) {
      console.error(`[ADMIN] Failed to download image:`, downloadError)
      return NextResponse.json({ 
        error: 'Failed to download image',
        details: downloadError.message 
      }, { status: 500 })
    }

    // 3. Upload vers Supabase Storage
    const fileName = `${imageRecord.user_id}/${taskId}.png`
    console.log(`[ADMIN] Uploading to Supabase Storage: generated-photos/${fileName}`)
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('uploads')
      .upload(`generated-photos/${fileName}`, imageBuffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      console.error(`[ADMIN] Failed to upload to Supabase:`, uploadError)
      return NextResponse.json({ 
        error: 'Failed to upload image',
        details: uploadError.message 
      }, { status: 500 })
    }

    console.log(`[ADMIN] Image uploaded successfully to: ${uploadData.path}`)

    // 4. Obtenir l'URL publique
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('uploads')
      .getPublicUrl(`generated-photos/${fileName}`)

    const finalImageUrl = publicUrlData.publicUrl
    console.log(`[ADMIN] Public URL: ${finalImageUrl}`)

    // 5. Mettre à jour le record avec l'URL finale
    const { error: updateError } = await supabaseAdmin
      .from('generated_images')
      .update({
        image_url: finalImageUrl,
      })
      .eq('id', imageRecord.id)

    if (updateError) {
      console.error(`[ADMIN] Failed to update image record:`, updateError)
      return NextResponse.json({ 
        error: 'Failed to update image record',
        details: updateError.message 
      }, { status: 500 })
    }

    console.log(`[ADMIN] Successfully updated image record for taskId: ${taskId}`)
    console.log(`[ADMIN] Final URL: ${finalImageUrl}`)

    return NextResponse.json({
      success: true,
      message: 'Image mise à jour avec succès',
      taskId,
      finalImageUrl,
      imageRecordId: imageRecord.id,
    })

  } catch (error: any) {
    console.error('[ADMIN] Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Erreur interne',
      message: error.message 
    }, { status: 500 })
  }
}
