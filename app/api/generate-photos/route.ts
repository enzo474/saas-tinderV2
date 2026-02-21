import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { buildPhotoPrompt, PhotoType, UserContext } from '@/lib/nanobanana/prompts'
import { generateImageNanoBanana } from '@/lib/nanobanana/api'
import { requireAndDeductCredits } from '@/lib/credits-server'
import { CREDIT_COSTS } from '@/lib/credits'

/**
 * Génère une photo avec NanoBanana Pro API
 * Crée un record en DB avec taskId pour tracking asynchrone
 */
async function generateOnePhoto(
  userId: string,
  analysisId: string,
  sourcePhotosUrls: string[],
  photoNumber: number,
  photoType: PhotoType,
  userContext: UserContext,
  styleId?: string
): Promise<string> {
  const supabaseAdmin = createServiceRoleClient()
  
  const prompt = buildPhotoPrompt(photoType, userContext)
  
  const callbackUrl = process.env.NEXT_PUBLIC_CALLBACK_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/api/nanobanana/callback`
  
  if (!callbackUrl) {
    throw new Error('Callback URL is not configured')
  }

  // Appeler NanoBanana Pro API
  const response = await generateImageNanoBanana({
    prompt,
    imageUrls: sourcePhotosUrls,
    resolution: '2K',
    aspectRatio: '9:16',
    callBackUrl: callbackUrl,
  })

  const taskId = response.data.taskId

  // Créer un placeholder URL temporaire
  const placeholderUrl = `https://placeholder.com/generating/${taskId}.png`

  // Stocker en DB avec le taskId pour tracking
  const { data: imageRecord, error: insertError } = await supabaseAdmin
    .from('generated_images')
    .insert({
      user_id: userId,
      analysis_id: analysisId,
      image_url: placeholderUrl, // Sera mis à jour par le webhook
      photo_number: photoNumber,
      style_id: styleId || null,
      prompt_used: prompt,
      generation_type: 'initial',
      nanobanana_task_id: taskId,
    })
    .select()
    .single()

  if (insertError) {
    throw new Error(`Failed to create image record: ${insertError.message}`)
  }

  console.log(`[NanoBanana] Image generation started: taskId=${taskId}, photoType=${photoType}`)

  return placeholderUrl
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Vérifier authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // 2. Récupérer l'analyse
    let { data: analysis } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .single()

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    // 3. Vérifications de sécurité
    if (!analysis.paid_at) {
      return NextResponse.json({ error: 'Paiement requis' }, { status: 403 })
    }

    // Bypass pour l'admin (tests illimités)
    const isAdmin = user.email === process.env.ADMIN_EMAIL
    if (analysis.image_generation_used && !isAdmin) {
      return NextResponse.json({ error: 'Génération déjà utilisée pour cet achat' }, { status: 400 })
    }

    // Si l'admin regénère, on reset d'abord les données
    if (isAdmin && analysis.image_generation_used) {
      await supabase
        .from('analyses')
        .update({
          generated_photos_urls: null,
          image_generation_used: false,
        })
        .eq('id', analysis.id)
      
      // Recharger l'analysis après reset
      const { data: freshAnalysis } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', analysis.id)
        .eq('user_id', user.id)
        .single()
      
      if (freshAnalysis) {
        analysis = freshAnalysis
      }
    }

    // 4. Vérifier et décompter les crédits (sauf pour admin)
    const totalCost = CREDIT_COSTS.IMAGE_GENERATION * 5 // 50 crédits pour 5 images
    
    if (!isAdmin) {
      try {
        await requireAndDeductCredits(user.id, totalCost)
      } catch (creditError: any) {
        return NextResponse.json({ 
          error: creditError.message,
          type: 'insufficient_credits'
        }, { status: 402 })
      }
    }

    // 5. Récupérer les photos sources
    const { sourcePhotos } = await req.json()
    
    if (!sourcePhotos || !Array.isArray(sourcePhotos)) {
      return NextResponse.json({ error: 'Photos sources manquantes' }, { status: 400 })
    }
    if (sourcePhotos.length < 4 || sourcePhotos.length > 6) {
      return NextResponse.json({ error: 'Il faut entre 4 et 6 photos sources' }, { status: 400 })
    }

    // 6. Upload photos sources vers Supabase Storage pour obtenir des URLs publiques
    const supabaseAdmin = createServiceRoleClient()
    const sourcePhotoUrls: string[] = []

    for (let i = 0; i < sourcePhotos.length; i++) {
      const photo = sourcePhotos[i]
      const buffer = Buffer.from(photo.data, 'base64')
      const fileName = `${user.id}/source-photos/${analysis.id}/source-${i}.jpg`

      const { error: uploadError } = await supabaseAdmin.storage
        .from('uploads')
        .upload(fileName, buffer, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (uploadError) {
        throw new Error(`Failed to upload source photo ${i}: ${uploadError.message}`)
      }

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('uploads')
        .getPublicUrl(fileName)

      sourcePhotoUrls.push(publicUrl)
    }

    // 7. Construire le contexte utilisateur
    const userContext: UserContext = {
      vibe: analysis.vibe || [],
      lifestyle: analysis.lifestyle || [],
      sport: analysis.sport,
      job: analysis.job,
      target_women: analysis.target_women || [],
      passions: analysis.passions || [],
    }

    // 8. Lancer la génération des 5 photos via NanoBanana (asynchrone)
    const photoTypes: PhotoType[] = ['main', 'lifestyle', 'social', 'passion', 'elegant']
    const placeholderUrls: string[] = []

    for (let i = 0; i < photoTypes.length; i++) {
      try {
        const photoUrl = await generateOnePhoto(
          user.id,
          analysis.id,
          sourcePhotoUrls,
          i + 1, // photo_number: 1 to 5
          photoTypes[i],
          userContext
        )
        placeholderUrls.push(photoUrl)
        // Petite pause entre chaque appel API
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error: any) {
        console.error(`Failed to generate ${photoTypes[i]}:`, error)
        
        // En cas d'échec, rembourser les crédits si pas admin
        if (!isAdmin) {
          try {
            const { addCredits } = await import('@/lib/credits')
            await addCredits(user.id, totalCost)
            console.log(`Refunded ${totalCost} credits to user ${user.id} after generation failure`)
          } catch (refundError) {
            console.error('Failed to refund credits:', refundError)
          }
        }
        
        throw error
      }
    }

    // 9. Mettre à jour la DB avec placeholders (seront mis à jour par webhooks)
    const { error: updateError } = await supabase
      .from('analyses')
      .update({
        generated_photos_urls: placeholderUrls, // Placeholders temporaires
        image_generation_used: true,
      })
      .eq('id', analysis.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Génération lancée avec succès',
      photos: placeholderUrls, // Placeholders
      analysisId: analysis.id,
      status: 'pending', // Les images réelles seront disponibles via webhook
    })
  } catch (error: any) {
    console.error('Generate photos error:', error)
    return NextResponse.json({ 
      error: error.message,
      type: error.type || 'generation_error'
    }, { status: 500 })
  }
}
