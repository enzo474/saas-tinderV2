import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { generateImageNanoBanana } from '@/lib/nanobanana/api'
import { requireAndDeductCredits, addCredits } from '@/lib/credits-server'
import { CREDIT_COSTS } from '@/lib/credits'

/**
 * POST /api/generate-single-image
 * Génère 1 image IA nouvelle avec un style sélectionné
 * Coût : 10 crédits
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    // 1. Vérifier authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // 2. Parser body
    const { sourcePhotos, styleId } = await req.json()
    
    if (!sourcePhotos || !Array.isArray(sourcePhotos) || sourcePhotos.length < 4 || sourcePhotos.length > 6) {
      return NextResponse.json({ error: '4-6 photos sources requises' }, { status: 400 })
    }

    if (!styleId || typeof styleId !== 'string') {
      return NextResponse.json({ error: 'Style requis' }, { status: 400 })
    }

    // 3. Vérifier et déduire crédits (10 crédits pour 1 image)
    const cost = CREDIT_COSTS.IMAGE_GENERATION
    
    try {
      await requireAndDeductCredits(user.id, cost)
    } catch (creditError: any) {
      return NextResponse.json({ 
        error: creditError.message,
        type: 'insufficient_credits'
      }, { status: 402 })
    }

    // 4. Upload photos sources vers Supabase Storage
    const sourcePhotoUrls: string[] = []
    
    try {
      for (let i = 0; i < sourcePhotos.length; i++) {
        const base64 = sourcePhotos[i]
        const buffer = Buffer.from(base64.split(',')[1], 'base64')
        
        const fileName = `${user.id}/sources/${Date.now()}_${i}.jpg`
        
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('uploads')
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true,
          })

        if (uploadError) {
          throw new Error(`Upload error: ${uploadError.message}`)
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('uploads')
          .getPublicUrl(fileName)

        sourcePhotoUrls.push(publicUrl)
      }
    } catch (uploadError: any) {
      // Refund credits en cas d'erreur upload
      await addCredits(user.id, cost)
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // 5. Récupérer le style depuis la DB
    const { data: style, error: styleError } = await supabaseAdmin
      .from('photo_styles')
      .select('*')
      .eq('id', styleId)
      .single()

    if (styleError || !style) {
      await addCredits(user.id, cost)
      return NextResponse.json({ error: 'Style invalide' }, { status: 400 })
    }

    if (!style.is_active) {
      await addCredits(user.id, cost)
      return NextResponse.json({ error: 'Style inactif' }, { status: 400 })
    }

    // 6. Créer une "analyse" factice ou utiliser une existante pour lier les images
    let { data: analysis } = await supabase
      .from('analyses')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const analysisId = analysis?.id || null

    // 7. Créer d'abord le record en DB pour obtenir son ID
    const prompt = style.prompt_template
    const placeholderUrl = `https://placeholder.com/generating/pending.png`

    const { data: insertedRecord, error: insertError } = await supabaseAdmin
      .from('generated_images')
      .insert({
        user_id: user.id,
        analysis_id: analysisId,
        image_url: placeholderUrl,
        photo_number: 1,
        style_id: style.id,
        prompt_used: prompt,
        generation_type: 'custom',
      })
      .select('id')
      .single()

    if (insertError || !insertedRecord) {
      await addCredits(user.id, cost)
      console.error('Failed to create image record:', insertError)
      return NextResponse.json({ error: 'Erreur création du record' }, { status: 500 })
    }

    const imageRecordId = insertedRecord.id

    // 8. Appeler NanoBanana avec l'ID du record dans l'URL callback
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crushmaxxing.com'
    const callbackUrl = `${appUrl}/api/nanobanana/callback?imageId=${imageRecordId}`

    try {
      console.log(`[Generate Single Image] Starting generation: style=${style.style_name}, recordId=${imageRecordId}`)

      const response = await generateImageNanoBanana({
        prompt: prompt,
        imageUrls: sourcePhotoUrls,
        callBackUrl: callbackUrl,
      })

      const taskId = response.data.taskId

      // Stocker le taskId dans le record (si la colonne existe)
      await supabaseAdmin
        .from('generated_images')
        .update({ nanobanana_task_id: taskId })
        .eq('id', imageRecordId)

      console.log(`[Single Image Generation] Started: taskId=${taskId}, recordId=${imageRecordId}`)

      return NextResponse.json({
        success: true,
        message: 'Génération lancée avec succès',
        taskId: imageRecordId, // On retourne l'imageRecordId comme "taskId" pour le polling
        info: 'L\'image sera disponible dans quelques minutes sur votre dashboard.'
      })

    } catch (genError: any) {
      console.error('NanoBanana generation error:', genError)
      // Supprimer le record créé + rembourser
      await supabaseAdmin.from('generated_images').delete().eq('id', imageRecordId)
      await addCredits(user.id, cost)
      return NextResponse.json({ error: `Génération échouée: ${genError.message}` }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Generate single image error:', error)
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 })
  }
}
