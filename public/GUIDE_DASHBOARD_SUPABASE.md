# 🎯 GUIDE COMPLET - Créer la fonction cleanup-storage dans Dashboard

## 📍 Tu es sur la bonne page !

Tu as déjà ouvert : https://supabase.com/dashboard/project/pnmajvnkvyjlkbscwsto/functions

Parfait ! Maintenant suis ces étapes **une par une** :

---

## ✅ ÉTAPE 1 : Ouvrir l'éditeur

Sur la page que tu vois, clique sur le bouton **"Open Editor"** dans la section "Via Editor".

---

## ✅ ÉTAPE 2 : Créer nouvelle fonction

Un éditeur va s'ouvrir. Tu verras un bouton **"Deploy a new function"** ou **"New function"**.

**Clique dessus.**

---

## ✅ ÉTAPE 3 : Nommer la fonction

Dans le champ **"Function name"**, tape exactement :

```
cleanup-storage
```

---

## ✅ ÉTAPE 4 : Copier le code

Tu vas voir un éditeur de code avec du code par défaut.

**SÉLECTIONNE TOUT LE CODE (Cmd+A) et SUPPRIME-LE.**

Ensuite, **COPIE CE CODE COMPLET** (tout, de la ligne 1 à la fin) :

```typescript
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
```

**COLLE-LE** dans l'éditeur (Cmd+V).

---

## ✅ ÉTAPE 5 : Déployer

Clique sur le bouton **"Deploy"** en bas à droite de l'éditeur.

⏳ Attends 5-10 secondes pendant le déploiement.

Tu verras un message de confirmation ✅

---

## ✅ ÉTAPE 6 : Configurer le cron (exécution automatique)

Maintenant tu es sur la page de ta fonction `cleanup-storage`.

1. Clique sur l'onglet **"Schedules"** (en haut)

2. Clique sur **"Add schedule"** ou **"New schedule"**

3. Dans le formulaire qui apparaît :

   **Cron expression** : Tape exactement
   ```
   0 * * * *
   ```

   **Timezone** : Sélectionne **UTC** dans la liste déroulante

   **Description** (optionnel) : Tu peux écrire
   ```
   Nettoyage automatique toutes les heures
   ```

4. Clique sur **"Save"** ou **"Add"**

---

## ✅ ÉTAPE 7 : Désactiver JWT verification

**IMPORTANT** : Cette étape est cruciale !

1. Clique sur l'onglet **"Settings"** (en haut)

2. Trouve le paramètre **"Verify JWT"** ou **"JWT verification"**

3. **Désactive-le** (mets le toggle sur OFF)

4. Sauvegarde

💡 Pourquoi ? Car la fonction est appelée par le cron (pas par un utilisateur), donc pas besoin de JWT.

---

## ✅ ÉTAPE 8 : Tester

Pour vérifier que tout fonctionne :

1. Retourne dans l'onglet **"Details"**

2. Clique sur **"Invoke function"** ou **"Test"**

3. Tu devrais voir une réponse comme :

```json
{
  "success": true,
  "filesDeleted": 0,
  "cutoffDate": "2024-02-16T22:00:00.000Z"
}
```

`filesDeleted: 0` est normal car il n'y a probablement pas encore de fichiers de plus de 24h.

---

## 🎉 C'EST TERMINÉ !

✅ La fonction `cleanup-storage` est déployée
✅ Le cron `0 * * * *` est configuré  
✅ La fonction s'exécutera automatiquement toutes les heures
✅ Les fichiers de plus de 24h seront supprimés

**Le refactoring complet est 100% terminé !** 🎊

---

## 📋 Checklist rapide

Avant de fermer, vérifie que tu as bien :

- [ ] Créé la fonction nommée `cleanup-storage`
- [ ] Collé le code complet
- [ ] Cliqué sur "Deploy"
- [ ] Configuré le cron `0 * * * *` dans "Schedules"
- [ ] Désactivé "Verify JWT" dans "Settings"
- [ ] Testé avec "Invoke function"

Si tu as coché toutes les cases : **BRAVO !** 🎉

---

## 🆘 Besoin d'aide ?

Si tu es bloqué à une étape, dis-moi exactement où tu es coincé et je t'aide.
