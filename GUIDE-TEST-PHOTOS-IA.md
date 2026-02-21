# 📸 Guide de test - Génération photos IA

## ✅ Corrections appliquées

Les bugs suivants ont été corrigés :
1. ✅ Suppression de la vérification `product_type` obsolète dans `app/api/generate-photos/route.ts`
2. ✅ Changement de GET → POST dans `app/api/photo-status/route.ts`
3. ✅ Récupération de `analysisId` depuis le body au lieu des query params

---

## 🔧 Configuration

### 1. Ajouter la clé API NanoBanana

Dans `.env.local`, ajoute ta clé API :

```bash
NANOBANANA_API_KEY=ta_cle_api_ici
```

### 2. Redémarrer le serveur

```bash
npm run dev
```

---

## 🧪 Test du flow complet

### Étape 1 : Réinitialiser ton analyse (optionnel)

Si tu veux recommencer depuis le début :

```sql
-- Dans Supabase Dashboard > SQL Editor
DELETE FROM analyses WHERE user_id = auth.uid();
```

### Étape 2 : Compléter l'onboarding

1. Va sur `http://localhost:3000`
2. Authentifie-toi
3. Complète l'onboarding (A ou B)
4. Arrive sur `/results`

### Étape 3 : Payer

1. Clique sur "Voir mon plan"
2. Sur `/pricing`, clique sur "Payer 7,90€"
3. Utilise la carte test Stripe : `4242 4242 4242 4242`
4. Tu es redirigé vers `/success`

### Étape 4 : Attendre la génération du plan Claude

1. Sur `/success`, tu vois d'abord l'écran de loading "On prépare ton plan personnalisé..."
2. Attends 15-30 secondes
3. Le plan Claude s'affiche avec les 4 bios

### Étape 5 : Générer les photos IA

1. Après le plan, tu vois "Génère tes 5 photos IA optimisées"
2. Clique sur "Upload des photos" ou glisse-dépose **4 à 6 photos** de toi
3. Les photos doivent être :
   - Claires et nettes
   - Bien éclairées
   - Visage visible
   - Variées (différentes poses, environnements)
4. Clique sur "Générer mes 5 photos IA"

### Étape 6 : Attendre la génération

1. Tu vois l'écran de progression avec 5 tâches
2. Le polling se fait automatiquement toutes les 3 secondes
3. Chaque photo prend environ 30-60 secondes
4. Temps total : **2-5 minutes** pour les 5 photos

### Étape 7 : Télécharger les photos

1. Une fois terminé, tu vois "Tes photos sont prêtes ! 🎉"
2. Tu peux :
   - Télécharger chaque photo individuellement
   - Télécharger toutes les photos en ZIP
3. Les photos restent disponibles (pas de TTL pour le moment)

---

## 🐛 Debugging

### Vérifier les logs Vercel/Console

Dans le terminal où tourne `npm run dev`, tu verras :

**Génération lancée :**
```
POST /api/generate-photos
→ 5 tasks lancées avec taskIds
```

**Polling :**
```
POST /api/photo-status
→ Status: processing, completedCount: X/5
```

**Terminé :**
```
POST /api/photo-status
→ Status: completed, 5 photos uploadées vers Supabase
```

### Erreurs possibles

#### "NanoBanana API configuration missing"
→ La clé `NANOBANANA_API_KEY` n'est pas dans `.env.local`

#### "Paiement requis"
→ Tu n'as pas payé ou `paid_at` n'est pas défini dans la DB

#### "Génération déjà utilisée pour cet achat"
→ Tu as déjà généré des photos. Réinitialise avec :
```sql
UPDATE analyses 
SET image_generation_used = false,
    nanobanana_task_ids = NULL,
    generated_photos_urls = NULL
WHERE user_id = auth.uid();
```

#### "NanoBanana API error: ..."
→ Problème avec l'API NanoBanana (rate limit, quota, mauvaise clé, etc.)
→ Vérifie ta clé API et ton quota sur le dashboard NanoBanana

---

## 📊 Vérifier dans Supabase

### Table `analyses`

Requête pour voir l'état de ta génération :

```sql
SELECT 
  nanobanana_task_ids,
  generated_photos_urls,
  image_generation_used,
  image_generation_started_at,
  source_photos_urls
FROM analyses
WHERE user_id = auth.uid();
```

**Pendant la génération :**
- `nanobanana_task_ids` : Array de 5 task IDs
- `generated_photos_urls` : NULL
- `image_generation_used` : false
- `image_generation_started_at` : timestamp

**Après la génération :**
- `nanobanana_task_ids` : Array de 5 task IDs
- `generated_photos_urls` : Array de 5 URLs Supabase
- `image_generation_used` : true

### Storage `uploads`

Les photos générées sont dans :
```
uploads/{user_id}/generated-photos/{analysis_id}/0.jpg
uploads/{user_id}/generated-photos/{analysis_id}/1.jpg
uploads/{user_id}/generated-photos/{analysis_id}/2.jpg
uploads/{user_id}/generated-photos/{analysis_id}/3.jpg
uploads/{user_id}/generated-photos/{analysis_id}/4.jpg
```

---

## 🎨 Améliorer les prompts

Une fois que tu as testé et vu les résultats, tu peux affiner les prompts dans :

**`lib/nanobanana/prompts.ts`**

Les prompts actuels sont structurés ainsi :
- **BASE** : Préservation de l'identité + style général + vibe
- **main** : Photo principale (portrait confiant)
- **lifestyle** : Photo dynamique lifestyle
- **social** : Photo sociale/conviviale
- **passion** : Photo activité/hobby
- **elegant** : Photo élégante/sophistiquée

### Variables injectées du contexte utilisateur :
- `vibe` : Vibes sélectionnées (ex: "mysterious and adventurous")
- `lifestyle` : Lifestyle choisi (voyage, sport, urbain)
- `sport` : Sport pratiqué
- `job` : Métier
- `target_women` : Type de femmes ciblées

### Exemples d'améliorations :

**Pour des photos plus naturelles :**
```typescript
const BASE = `Photorealistic portrait of a man.
Ultra-realistic, no AI artifacts, authentic photography.
Preserve exact facial features 100% - no idealization.
Natural skin texture, real lighting, genuine expression.`
```

**Pour cibler un style précis :**
```typescript
main: `${BASE}
Style: Modern lifestyle photography, GQ magazine aesthetic.
Sharp focus on eyes, slight bokeh background.
Professional but approachable.`
```

**Pour mieux utiliser le contexte :**
```typescript
social: `${BASE}
Setting: ${ctx.target_women.includes('Intellectuelle') ? 'library or art gallery' : 'upscale bar or rooftop'}.
Expression: matching the target demographic preferences.`
```

---

## ✅ Checklist de test

- [ ] Clé API NanoBanana configurée
- [ ] Serveur redémarré
- [ ] Onboarding complété
- [ ] Paiement effectué (7,90€ test)
- [ ] Plan Claude généré (4 bios)
- [ ] 4-6 photos sources uploadées
- [ ] Génération lancée (5 tasks)
- [ ] Polling fonctionne (progression visible)
- [ ] 5 photos générées et affichées
- [ ] Téléchargement individuel fonctionne
- [ ] Téléchargement ZIP fonctionne
- [ ] Photos visibles dans Supabase Storage

---

## 🚀 Prochaines étapes

Une fois que la génération fonctionne :

1. **Tester avec différents profils** - Vérifier que les prompts s'adaptent bien au contexte
2. **Affiner les prompts** - Améliorer progressivement selon les résultats
3. **Optimiser les photos sources** - Guidelines pour les utilisateurs (éclairage, pose, etc.)
4. **Créer la landing page** - Marketing pour attirer les utilisateurs

---

Bon test ! 🎉
