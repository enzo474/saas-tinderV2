import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserCredits } from '@/lib/credits-server'

/**
 * GET /api/user/credits
 * Retourne les crédits de l'utilisateur authentifié
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const credits = await getUserCredits(user.id)

    return NextResponse.json({ 
      credits,
      userId: user.id 
    })
  } catch (error: any) {
    console.error('Get credits error:', error)
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}
