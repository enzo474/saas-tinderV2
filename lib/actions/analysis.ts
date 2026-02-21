'use server'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function saveAnalysisStep1(analysisId: string, targetMatches: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { error } = await supabase
    .from('analyses')
    .update({ target_matches: targetMatches })
    .eq('id', analysisId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function uploadTinderPhotos(analysisId: string, files: File[]) {
  // Verify user identity via cookie-based client
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  // Use service role client for storage uploads (bypasses RLS, safe since user is verified above)
  const adminClient = createServiceRoleClient()

  const urls: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileName = `${user.id}/tinder-photos/${analysisId}/${i}.jpg`
    
    const { error: uploadError } = await adminClient.storage
      .from('uploads')
      .upload(fileName, file, { upsert: true })

    if (uploadError) throw new Error(uploadError.message)

    const { data: { publicUrl } } = adminClient.storage
      .from('uploads')
      .getPublicUrl(fileName)

    urls.push(publicUrl)
  }

  // Update analysis
  const { error: updateError } = await adminClient
    .from('analyses')
    .update({ photos_urls: urls })
    .eq('id', analysisId)
    .eq('user_id', user.id)

  if (updateError) throw new Error(updateError.message)

  return { urls }
}


// DEPRECATED: Bio actuelle supprimée de l'onboarding 1
// Conservé pour référence et compatibilité avec anciennes données
// export async function saveAnalysisStep3(analysisId: string, bio: string) {
//   const supabase = await createClient()
//   
//   const { data: { user } } = await supabase.auth.getUser()
//   if (!user) redirect('/auth')
//
//   const { error } = await supabase
//     .from('analyses')
//     .update({ current_bio: bio })
//     .eq('id', analysisId)
//     .eq('user_id', user.id)
//
//   if (error) return { error: error.message }
//   return { success: true }
// }


export async function saveAnalysisStep4(analysisId: string, data: {
  relationshipGoal: string
  targetWomen: string[]
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { error } = await supabase
    .from('analyses')
    .update({
      relationship_goal: data.relationshipGoal,
      target_women: data.targetWomen
    })
    .eq('id', analysisId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function saveAnalysisStep5(analysisId: string, data: {
  height?: number
  job: string
  sport: string
  personality: string
  lifestyle: string[]
  vibe: string[]
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Build update object, only include height if provided
  const updateData: any = {
    job: data.job,
    sport: data.sport,
    personality: data.personality,
    lifestyle: data.lifestyle,
    vibe: data.vibe
  }
  
  if (data.height !== undefined) {
    updateData.height = data.height
  }

  const { error } = await supabase
    .from('analyses')
    .update(updateData)
    .eq('id', analysisId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function saveAnalysisStep6(analysisId: string, data: {
  anecdotes: string[]
  passions: string[]
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { error } = await supabase
    .from('analyses')
    .update({
      anecdotes: data.anecdotes,
      passions: data.passions
    })
    .eq('id', analysisId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

function rand(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min)
}

function getBaseRange(currentMatches: string) {
  if (currentMatches === '0-2') return { min: 18, max: 32 }
  if (currentMatches === '3-5') return { min: 28, max: 42 }
  if (currentMatches === '6-10') return { min: 38, max: 55 }
  return { min: 52, max: 68 } // 10+
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value))
}

export async function calculateAndSaveScores(analysisId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Get analysis
  const { data: analysis } = await supabase
    .from('analyses')
    .select('current_matches')
    .eq('id', analysisId)
    .eq('user_id', user.id)
    .single()

  if (!analysis?.current_matches) {
    return { error: 'Données manquantes' }
  }

  const base = getBaseRange(analysis.current_matches)

  // Generate scores with slight variations
  let photoScore = rand(base.min, base.max)
  let bioScore = rand(base.min - 3, base.max + 5)
  let coherenceScore = rand(base.min - 5, base.max)

  // Clamp scores
  photoScore = clamp(photoScore)
  bioScore = clamp(bioScore)
  coherenceScore = clamp(coherenceScore)

  // Ensure scores are different (5-18 points apart)
  const scores = [photoScore, bioScore, coherenceScore].sort((a, b) => a - b)
  const diff = scores[2] - scores[0]
  
  if (diff < 5) {
    // Adjust to ensure minimum 5 points difference
    bioScore = photoScore + rand(5, 10)
    coherenceScore = photoScore - rand(5, 10)
    bioScore = clamp(bioScore)
    coherenceScore = clamp(coherenceScore)
  }

  const totalScore = Math.round((photoScore + bioScore + coherenceScore) / 3)

  // Positionnement : plage 5–95 %, corrélée au score mais avec forte variabilité
  const positioningMin = Math.max(5, totalScore - 45)
  const positioningMax = Math.min(95, totalScore + 20)
  const positioningPercent = rand(positioningMin, positioningMax)

  const { error } = await supabase
    .from('analyses')
    .update({
      photo_score: photoScore,
      bio_score: bioScore,
      coherence_score: coherenceScore,
      total_score: totalScore,
      positioning_percent: positioningPercent,
      status: 'complete'
    })
    .eq('id', analysisId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  return {
    photoScore,
    bioScore,
    coherenceScore,
    totalScore,
    positioningPercent
  }
}
