import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: analysis } = await supabase
      .from('analyses')
      .select('full_plan')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!analysis) {
      return NextResponse.json({ error: 'Analyse non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ full_plan: analysis.full_plan })
  } catch (error: any) {
    console.error('Error fetching plan:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération du plan' },
      { status: 500 }
    )
  }
}
