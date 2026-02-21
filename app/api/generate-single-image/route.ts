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

    // 7. Générer l'image via NanoBanana avec le prompt du style uniquement
    const callbackUrl = process.env.NEXT_PUBLIC_CALLBACK_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/api/nanobanana/callback`
    
    if (!callbackUrl) {
      await addCredits(user.id, cost)
      return NextResponse.json({ error: 'Callback URL non configurée' }, { status: 500 })
    }

    try {
      // Utiliser UNIQUEMENT le prompt_template du style (pas de customPrompt)
      const prompt = style.prompt_template

      console.log(`[Generate Single Image] Starting generation with style: ${style.style_name}`)

      // Appeler NanoBanana
      const response = await generateImageNanoBanana({
        prompt: prompt,
        imageUrls: sourcePhotoUrls,
        callBackUrl: callbackUrl,
      })

      const taskId = response.data.taskId

      // Créer record en DB avec taskId
      const placeholderUrl = `https://placeholder.com/generating/${taskId}.png`

      const { error: insertError } = await supabaseAdmin
        .from('generated_images')
        .insert({
          user_id: user.id,
          analysis_id: analysisId,
          image_url: placeholderUrl,
          photo_number: 1, // Pas de numéro spécifique pour génération custom
          style_id: style.id,
          prompt_used: prompt,
          generation_type: 'custom',
          nanobanana_task_id: taskId,
        })

      if (insertError) {
        console.error(`Failed to insert image record for task ${taskId}:`, insertError)
      }

      console.log(`[Single Image Generation] Started: taskId=${taskId}, style=${style.style_name}`)

      return NextResponse.json({
        success: true,
        message: 'Génération lancée avec succès',
        taskId: taskId,
        info: 'L\'image sera disponible dans quelques minutes sur votre dashboard.'
      })

    } catch (genError: any) {
      console.error('NanoBanana generation error:', genError)
      
      // Refund credits
      await addCredits(user.id, cost)
      
      return NextResponse.json({ 
        error: `Génération échouée: ${genError.message}` 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Generate single image error:', error)
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 })
  }
}
