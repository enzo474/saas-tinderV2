import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { generateImageNanoBanana } from '@/lib/nanobanana/api'
import { requireAndDeductCredits, addCredits } from '@/lib/credits-server'
import { CREDIT_COSTS } from '@/lib/credits'

/**
 * POST /api/regenerate-image
 * Régénère/modifie une image existante avec un prompt libre
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
    const { sourceImageUrl, referenceImageUrl, customPrompt } = await req.json()
    
    if (!sourceImageUrl || typeof sourceImageUrl !== 'string') {
      return NextResponse.json({ error: 'URL de l\'image source requise' }, { status: 400 })
    }

    if (!customPrompt || typeof customPrompt !== 'string' || customPrompt.trim().length < 10) {
      return NextResponse.json({ error: 'Prompt de modification requis (minimum 10 caractères)' }, { status: 400 })
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

    // 4. Traiter l'image source
    let finalImageUrl: string

    // Si c'est une base64 (upload), uploader vers Storage
    if (sourceImageUrl.startsWith('data:image')) {
      try {
        const buffer = Buffer.from(sourceImageUrl.split(',')[1], 'base64')
        const fileName = `${user.id}/regenerate/${Date.now()}.jpg`
        
        const { error: uploadError } = await supabaseAdmin.storage
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

        finalImageUrl = publicUrl
      } catch (uploadError: any) {
        await addCredits(user.id, cost)
        return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
      }
    } else {
      // C'est déjà une URL publique, l'utiliser directement
      finalImageUrl = sourceImageUrl
    }

    // 4b. Traiter l'image de référence (Image 2) si fournie
    let finalReferenceUrl: string | null = null
    if (referenceImageUrl && typeof referenceImageUrl === 'string') {
      if (referenceImageUrl.startsWith('data:image')) {
        try {
          const buffer = Buffer.from(referenceImageUrl.split(',')[1], 'base64')
          const fileName = `${user.id}/regenerate/ref-${Date.now()}.jpg`
          const { error: uploadError } = await supabaseAdmin.storage
            .from('uploads')
            .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true })
          if (uploadError) throw new Error(uploadError.message)
          const { data: { publicUrl } } = supabaseAdmin.storage.from('uploads').getPublicUrl(fileName)
          finalReferenceUrl = publicUrl
        } catch (e: any) {
          console.warn('Reference image upload failed, continuing without it:', e.message)
        }
      } else {
        finalReferenceUrl = referenceImageUrl
      }
    }

    // 5. Construire le prompt de modification
    const hasReference = !!finalReferenceUrl
    const imageContext = hasReference
      ? `Image 1 is the base image to modify. Image 2 is the reference showing the desired result. `
      : `Image 1 is the image to modify. `
    const prompt = `${imageContext}Instructions: ${customPrompt.trim()}. Keep the person's face and identity identical. Maintain the same person in the image. Preserve facial features, skin tone, and overall appearance while applying the requested modifications.`

    // 6. Créer une "analyse" factice ou utiliser une existante
    let { data: analysis } = await supabase
      .from('analyses')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const analysisId = analysis?.id || null

    // 7. Créer d'abord le record en DB pour obtenir son ID
    const { data: insertedRecord, error: insertError } = await supabaseAdmin
      .from('generated_images')
      .insert({
        user_id: user.id,
        analysis_id: analysisId,
        image_url: 'https://placeholder.com/generating/pending.png',
        photo_number: 1,
        style_id: null,
        prompt_used: prompt,
        generation_type: 'regeneration',
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
      const imageUrls = finalReferenceUrl
        ? [finalImageUrl, finalReferenceUrl]
        : [finalImageUrl]

      const response = await generateImageNanoBanana({
        prompt: prompt,
        imageUrls,
        callBackUrl: callbackUrl,
      })

      const taskId = response.data.taskId

      // Stocker le taskId (si la colonne existe)
      await supabaseAdmin
        .from('generated_images')
        .update({ nanobanana_task_id: taskId })
        .eq('id', imageRecordId)

      console.log(`[Regenerate Image] Started: taskId=${taskId}, recordId=${imageRecordId}`)

      return NextResponse.json({
        success: true,
        message: 'Modification lancée avec succès',
        taskId: imageRecordId, // On retourne l'imageRecordId comme "taskId" pour le polling
        info: 'L\'image modifiée sera disponible dans quelques minutes sur votre dashboard.'
      })

    } catch (genError: any) {
      console.error('NanoBanana regeneration error:', genError)
      await supabaseAdmin.from('generated_images').delete().eq('id', imageRecordId)
      await addCredits(user.id, cost)
      return NextResponse.json({ error: `Modification échouée: ${genError.message}` }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Regenerate image error:', error)
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 })
  }
}
