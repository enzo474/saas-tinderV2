import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TTL_HOURS = 24

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - TTL_HOURS)
    
    console.log(`Cleaning files older than ${cutoffDate.toISOString()}`)
    
    let totalDeleted = 0
    const bucket = 'uploads'
    
    // List all user folders
    const { data: userFolders, error: listError } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000 })
    
    if (listError) {
      throw listError
    }
    
    console.log(`Found ${userFolders?.length || 0} user folders`)
    
    // For each user folder, check subfolders
    for (const userFolder of userFolders || []) {
      if (!userFolder.name) continue
      
      // List subfolders (selfies, tinder-photos, source-photos, generated-photos)
      const { data: subFolders } = await supabase.storage
        .from(bucket)
        .list(userFolder.name, { limit: 1000 })
      
      for (const subFolder of subFolders || []) {
        if (!subFolder.name) continue
        
        const folderPath = `${userFolder.name}/${subFolder.name}`
        
        // List files in subfolder
        const { data: files } = await supabase.storage
          .from(bucket)
          .list(folderPath, { limit: 1000 })
        
        if (!files) continue
        
        // Filter files older than TTL
        const filesToDelete = files
          .filter(file => {
            const fileDate = new Date(file.created_at)
            return fileDate < cutoffDate
          })
          .map(file => `${folderPath}/${file.name}`)
        
        if (filesToDelete.length > 0) {
          console.log(`Deleting ${filesToDelete.length} files from ${folderPath}`)
          
          const { error: deleteError } = await supabase.storage
            .from(bucket)
            .remove(filesToDelete)
          
          if (deleteError) {
            console.error(`Error deleting files: ${deleteError.message}`)
          } else {
            totalDeleted += filesToDelete.length
          }
        }
      }
    }
    
    console.log(`Total files deleted: ${totalDeleted}`)
    
    return new Response(
      JSON.stringify({
        success: true,
        filesDeleted: totalDeleted,
        cutoffDate: cutoffDate.toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Cleanup error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
