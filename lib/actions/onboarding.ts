'use server'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAbVariant } from '@/lib/utils/ab-test'

export async function getOrCreateAnalysis() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  // Check if user already has an analysis
  let { data: analysis } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Create one if not
  if (!analysis) {
    // Assign A/B variant deterministically
    const abVariant = getAbVariant(user.id)
    
    const { data: newAnalysis } = await supabase
      .from('analyses')
      .insert({ 
        user_id: user.id,
        ab_variant: abVariant
      })
      .select()
      .single()
    
    analysis = newAnalysis
  }

  return analysis
}

export async function saveOnboardingStep1(data: {
  analysisId: string
  currentMatches: string
  tinderSeniority: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  const { error } = await supabase
    .from('analyses')
    .update({
      current_matches: data.currentMatches,
      tinder_seniority: data.tinderSeniority,
    })
    .eq('id', data.analysisId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function uploadSelfie(analysisId: string, file: File) {
  // Verify user identity via cookie-based client
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Non authentifié')
  }

  // Use service role client for storage upload (bypasses RLS, safe since user is verified above)
  const adminClient = createServiceRoleClient()

  const fileName = `${user.id}/selfies/${analysisId}.jpg`
  const { error: uploadError } = await adminClient.storage
    .from('uploads')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data: { publicUrl } } = adminClient.storage
    .from('uploads')
    .getPublicUrl(fileName)

  const { error: updateError } = await adminClient
    .from('analyses')
    .update({ selfie_url: publicUrl })
    .eq('id', analysisId)
    .eq('user_id', user.id)

  if (updateError) {
    throw new Error(updateError.message)
  }

  return { url: publicUrl }
}

function rand(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1))
}

export async function calculateAndSaveMetrics(analysisId: string, currentMatches: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  let visualPotential: number
  let currentExploitation: number

  if (currentMatches === '0-2') {
    visualPotential = rand(7.0, 8.0)
    currentExploitation = rand(1.0, 3.0)
  } else if (currentMatches === '3-5') {
    visualPotential = rand(7.5, 8.5)
    currentExploitation = rand(2.0, 4.0)
  } else if (currentMatches === '6-10') {
    visualPotential = rand(8.0, 9.0)
    currentExploitation = rand(4.0, 6.0)
  } else { // 10+
    visualPotential = rand(9.0, 10.0)
    currentExploitation = rand(6.0, 7.0)
  }

  // Ensure exploitation < potential
  if (currentExploitation >= visualPotential) {
    currentExploitation = visualPotential - rand(0.5, 1.5)
  }

  const inexploitedPercent = Math.round(
    ((visualPotential - currentExploitation) / visualPotential) * 100
  )

  const { error } = await supabase
    .from('analyses')
    .update({
      visual_potential: visualPotential,
      current_exploitation: currentExploitation,
      inexploited_percent: inexploitedPercent,
    })
    .eq('id', analysisId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return {
    visualPotential,
    currentExploitation,
    inexploitedPercent,
  }
}
