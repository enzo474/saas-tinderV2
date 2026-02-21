import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/photo-styles
 * Retourne tous les styles (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est admin
    const { data: userData } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer tous les styles
    const { data: styles, error } = await supabase
      .from('photo_styles')
      .select('*')
      .order('photo_number')
      .order('display_order')

    if (error) {
      throw error
    }

    return NextResponse.json({ styles })
  } catch (error: any) {
    console.error('Get styles error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/admin/photo-styles
 * Crée un nouveau style (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est admin
    const { data: userData } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await req.json()
    const {
      photo_number,
      style_name,
      style_description,
      preview_image_url,
      prompt_template,
      is_active,
      display_order,
    } = body

    // Validation
    if (!photo_number || !style_name || !preview_image_url || !prompt_template) {
      return NextResponse.json({ 
        error: 'Champs requis manquants' 
      }, { status: 400 })
    }

    // Créer le style
    const { data: style, error } = await supabaseAdmin
      .from('photo_styles')
      .insert({
        photo_number,
        style_name,
        style_description: style_description || null,
        preview_image_url,
        prompt_template,
        is_active: is_active ?? true,
        display_order: display_order || 0,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ style }, { status: 201 })
  } catch (error: any) {
    console.error('Create style error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
