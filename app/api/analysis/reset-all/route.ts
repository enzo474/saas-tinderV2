import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Get analysis to get file paths before deletion
    const { data: analysis } = await supabase
      .from('analyses')
      .select('id, selfie_url')
      .eq('user_id', user.id)
      .single()

    if (analysis) {
      // Delete selfie from storage if exists
      if (analysis.selfie_url) {
        const fileName = `${user.id}/selfies/${analysis.id}.jpg`
        await supabase.storage.from('uploads').remove([fileName])
      }

      // Delete tinder photos from storage if any
      const { data: files } = await supabase.storage
        .from('uploads')
        .list(`${user.id}/tinder-photos/${analysis.id}`)
      
      if (files && files.length > 0) {
        const filePaths = files.map(f => `${user.id}/tinder-photos/${analysis.id}/${f.name}`)
        await supabase.storage.from('uploads').remove(filePaths)
      }

      // Delete analysis from database
      const { error } = await supabase
        .from('analyses')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Analyse réinitialisée avec succès' 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
