import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { generateImageNanoBanana } from '@/lib/nanobanana/api'
import { requireAndDeductCredits, addCredits } from '@/lib/credits-server'
import { CREDIT_COSTS } from '@/lib/credits'

/**
 * POST /api/generate-custom-images
 * Génère 5 images IA custom avec styles sélectionnés par l'utilisateur
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
    const { sourcePhotos, styleIds, customPrompt } = await req.json()
    
    if (!sourcePhotos || !Array.isArray(sourcePhotos) || sourcePhotos.length < 4 || sourcePhotos.length > 6) {
      return NextResponse.json({ error: '4-6 photos sources requises' }, { status: 400 })
    }

    if (!styleIds || !Array.isArray(styleIds) || styleIds.length !== 5) {
      return NextResponse.json({ error: '5 styles requis' }, { status: 400 })
    }

    // 3. Vérifier et déduire crédits (50 crédits = 5 images × 10 crédits)
    const totalCost = CREDIT_COSTS.IMAGE_GENERATION * 5
    
    try {
      await requireAndDeductCredits(user.id, totalCost)
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
          .from('generated-images')
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true,
          })

        if (uploadError) {
          throw new Error(`Upload error: ${uploadError.message}`)
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('generated-images')
          .getPublicUrl(fileName)

        sourcePhotoUrls.push(publicUrl)
      }
    } catch (uploadError: any) {
      // Refund credits en cas d'erreur upload
      await addCredits(user.id, totalCost)
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // 5. Récupérer les styles depuis la DB
    const { data: styles, error: stylesError } = await supabaseAdmin
      .from('photo_styles')
      .select('*')
      .in('id', styleIds)

    if (stylesError || !styles || styles.length !== 5) {
      await addCredits(user.id, totalCost)
      return NextResponse.json({ error: 'Styles invalides' }, { status: 400 })
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

    // 7. Générer les 5 images via NanoBanana
    const callbackUrl = process.env.NEXT_PUBLIC_CALLBACK_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/api/nanobanana/callback`
    
    if (!callbackUrl) {
      await addCredits(user.id, totalCost)
      return NextResponse.json({ error: 'Callback URL non configurée' }, { status: 500 })
    }

    const generatedTaskIds: string[] = []

    try {
      for (let i = 0; i < 5; i++) {
        const style = styles[i]
        
        // Construire le prompt : template + custom prompt
        let finalPrompt = style.prompt_template
        if (customPrompt) {
          finalPrompt += `\n\nInstructions supplémentaires: ${customPrompt}`
        }

        // Appeler NanoBanana
        const response = await generateImageNanoBanana({
          prompt: finalPrompt,
          imageUrls: sourcePhotoUrls,
          resolution: '2K',
          aspectRatio: '9:16',
          callBackUrl: callbackUrl,
        })

        const taskId = response.data.taskId
        generatedTaskIds.push(taskId)

        // Créer record en DB avec taskId
        const placeholderUrl = `https://placeholder.com/generating/${taskId}.png`

        const { error: insertError } = await supabaseAdmin
          .from('generated_images')
          .insert({
            user_id: user.id,
            analysis_id: analysisId,
            image_url: placeholderUrl,
            photo_number: i + 1,
            style_id: style.id,
            prompt_used: finalPrompt,
            generation_type: 'custom',
            nanobanana_task_id: taskId,
          })

        if (insertError) {
          console.error(`Failed to insert image record for task ${taskId}:`, insertError)
        }

        console.log(`[Custom Generation] Image ${i + 1}/5 started: taskId=${taskId}, style=${style.style_name}`)
      }
    } catch (genError: any) {
      console.error('NanoBanana generation error:', genError)
      
      // Refund credits
      await addCredits(user.id, totalCost)
      
      return NextResponse.json({ 
        error: `Génération échouée: ${genError.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Génération lancée avec succès',
      taskIds: generatedTaskIds,
      info: 'Les images seront disponibles dans quelques minutes sur votre dashboard.'
    })

  } catch (error: any) {
    console.error('Generate custom images error:', error)
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 })
  }
}
