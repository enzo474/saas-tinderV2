import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isUserAdmin } from '@/lib/credits-server'

/**
 * POST /api/admin/reset-onboarding
 * Supprime toutes les analyses de l'admin pour recommencer l'onboarding
 * (Admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est admin
    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    // Supprimer TOUTES les analyses de l'admin
    const { error } = await supabase
      .from('analyses')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[ADMIN] Onboarding reset for user: ${user.email}`)

    return NextResponse.json({ 
      success: true,
      message: 'Onboarding réinitialisé avec succès' 
    })
  } catch (error: any) {
    console.error('Reset onboarding error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
