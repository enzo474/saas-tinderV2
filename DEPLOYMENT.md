# Guide de déploiement - Edge Function cleanup-storage

## 🚀 Déploiement rapide (recommandé)

J'ai créé un script qui automatise toutes les étapes. Dans ton terminal :

```bash
cd /Users/macenzo/Documents/saas-tinderV2
bash deploy-cleanup-storage.sh
```

Le script va :
1. ✅ Vérifier que Supabase CLI est installé
2. 🔐 Te connecter à Supabase (ouvrira un navigateur)
3. 🔗 Lier ton projet
4. 📁 Vérifier que tous les fichiers sont présents
5. 🚀 Déployer la fonction
6. 🧪 Tester la fonction

---

## 📝 Déploiement manuel (si le script ne fonctionne pas)

### Étape 1 : Installer Supabase CLI

**Option A - Via Homebrew (recommandé sur macOS)** :
```bash
brew install supabase/tap/supabase
```

**Option B - Via npm** :
```bash
npm install -g supabase
```

Vérifier l'installation :
```bash
supabase --version
```

### Étape 2 : Se connecter à Supabase

```bash
supabase login
```

Un navigateur s'ouvrira pour te connecter.

### Étape 3 : Lier le projet

```bash
supabase link --project-ref pnmajvnkvyjlkbscwsto
```

Tu devras entrer le mot de passe de ta base de données.

### Étape 4 : Déployer la fonction

```bash
supabase functions deploy cleanup-storage
```

### Étape 5 : Tester

```bash
supabase functions invoke cleanup-storage
```

---

## ⚙️ Configuration du cron job

Après le déploiement, configure le cron job dans le Dashboard Supabase :

1. Va sur : https://supabase.com/dashboard/project/pnmajvnkvyjlkbscwsto/functions
2. Clique sur `cleanup-storage`
3. Onglet **Schedules**
4. Ajoute un nouveau schedule :
   - **Cron expression** : `0 * * * *` (toutes les heures)
   - **Timezone** : UTC
5. Sauvegarde

---

## 🐛 Dépannage

### Erreur : `npm error canceled`

Tu as probablement annulé l'installation. Réessaie avec `npx` :
```bash
npx supabase functions deploy cleanup-storage
```

### Erreur : `command not found: supabase`

Supabase CLI n'est pas installé. Utilise :
```bash
brew install supabase/tap/supabase
```

### Erreur : `project not linked`

```bash
supabase link --project-ref pnmajvnkvyjlkbscwsto
```

### Erreur : `function not found`

Vérifie que les fichiers existent :
```bash
ls -la supabase/functions/cleanup-storage/
```

Tu dois voir :
- `index.ts`
- `deno.json`

---

## ✅ Vérification finale

Une fois déployé, vérifie dans le Dashboard :

1. **Edge Functions** > cleanup-storage existe
2. **Logs** > aucune erreur
3. **Schedules** > cron `0 * * * *` est configuré
4. **Settings** > `verify_jwt` est `false`

---

## 🧪 Test manuel

Pour tester sans attendre le cron :

**Via CLI** :
```bash
supabase functions invoke cleanup-storage
```

**Via curl** :
```bash
curl -X POST https://pnmajvnkvyjlkbscwsto.supabase.co/functions/v1/cleanup-storage \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBubWFqdm5rdnlqbGtic2N3c3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjY0NTUsImV4cCI6MjA4Njc0MjQ1NX0.2LGUowAIQGfSltuWr6IdCSSEhjW_kZ93wsaYYBBFxuY"
```

**Réponse attendue** :
```json
{
  "success": true,
  "filesDeleted": 0,
  "cutoffDate": "2024-02-16T21:00:00.000Z"
}
```

---

## 📦 Alternative : Déploiement via Dashboard

Si le CLI ne fonctionne vraiment pas :

1. Va sur https://supabase.com/dashboard/project/pnmajvnkvyjlkbscwsto/functions
2. **New Function**
3. Nom : `cleanup-storage`
4. Copie le contenu de `supabase/functions/cleanup-storage/index.ts`
5. **Deploy**
6. Configure le schedule dans l'onglet **Schedules**
