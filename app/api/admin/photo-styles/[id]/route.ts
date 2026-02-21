import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

/**
 * PUT /api/admin/photo-styles/[id]
 * Met à jour un style (admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/228ef050-cfb7-4157-ae07-e20cb469c801', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'app/api/admin/photo-styles/[id]/route.ts:PUT',
        message: 'Update style input',
        data: { paramsId: id, body },
        hypothesisId: 'H-input',
        runId: 'styles-update',
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    // Mettre à jour le style
    const { data: style, error } = await supabaseAdmin
      .from('photo_styles')
      .update({
        photo_number,
        style_name,
        style_description: style_description || null,
        preview_image_url,
        prompt_template,
        is_active,
        display_order,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/228ef050-cfb7-4157-ae07-e20cb469c801', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'app/api/admin/photo-styles/[id]/route.ts:PUT',
          message: 'Update style DB error',
          data: { paramsId: id, dbError: error.message },
          hypothesisId: 'H-db',
          runId: 'styles-update',
          timestamp: Date.now(),
        }),
      }).catch(() => {})
      // #endregion
      throw error
    }

    return NextResponse.json({ style })
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/228ef050-cfb7-4157-ae07-e20cb469c801', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'app/api/admin/photo-styles/[id]/route.ts:PUT',
        message: 'Update style catch error',
        data: { paramsId: id, errorMessage: error?.message },
        hypothesisId: 'H-catch',
        runId: 'styles-update',
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    console.error('Update style error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/photo-styles/[id]
 * Met à jour partiellement un style (admin only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Mettre à jour avec les champs fournis seulement
    const { data: style, error } = await supabaseAdmin
      .from('photo_styles')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ style })
  } catch (error: any) {
    console.error('Patch style error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/photo-styles/[id]
 * Supprime un style (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Supprimer le style
    const { error } = await supabaseAdmin
      .from('photo_styles')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete style error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
