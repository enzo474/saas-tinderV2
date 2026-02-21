import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { analysisId } = await req.json()
    
    if (!analysisId) {
      return NextResponse.json({ error: 'analysisId requis' }, { status: 400 })
    }

    const { data: analysis } = await supabase
      .from('analyses')
      .select('generated_photos_urls, image_generation_used')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single()

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    // Avec Google AI Studio, les photos sont générées de manière synchrone
    // Cette route sert juste à retourner les photos déjà stockées
    if (analysis.image_generation_used && analysis.generated_photos_urls?.length === 5) {
      return NextResponse.json({
        completed: true,
        progress: 100,
        tasks: Array(5).fill({ status: 'completed' }),
        photos: analysis.generated_photos_urls,
      })
    }

    // Si pas encore généré ou en cours
    return NextResponse.json({
      completed: false,
      progress: 0,
      tasks: Array(5).fill({ status: 'pending' }),
    })
  } catch (error: any) {
    console.error('Photo status error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
