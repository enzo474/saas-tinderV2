import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isUserAdmin } from '@/lib/credits-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Vérifier authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que c'est bien un admin
    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Accès refusé - Admin uniquement' }, { status: 403 })
    }

    // Reset la génération d'images pour l'admin
    const { error } = await supabase
      .from('analyses')
      .update({
        generated_photos_urls: null,
        image_generation_used: false,
      })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[ADMIN] Photo generation reset for user: ${user.email}`)

    return NextResponse.json({ success: true, message: 'Génération d\'images réinitialisée' })
  } catch (error: any) {
    console.error('Reset photo generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
