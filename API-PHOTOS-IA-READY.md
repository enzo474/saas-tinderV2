# ✅ API Photos IA - Corrections terminées

## 🎯 Résumé des modifications

### Bugs corrigés

1. ✅ **Vérification product_type obsolète supprimée**
   - Fichier : `app/api/generate-photos/route.ts`
   - Lignes 71-73 supprimées
   - Raison : Le système de 2 offres (7,90€ et 14,90€) a été remplacé par une offre unique à 7,90€ incluant bio + photos IA

2. ✅ **Route photo-status corrigée (GET → POST)**
   - Fichier : `app/api/photo-status/route.ts`
   - Changement de méthode HTTP : GET → POST
   - `analysisId` récupéré depuis le body au lieu des query params
   - Raison : Correspondance avec les appels client dans `SuccessContent.tsx`

### Fichiers modifiés

- `app/api/generate-photos/route.ts` - Suppression vérification product_type
- `app/api/photo-status/route.ts` - Changement GET → POST + body parsing

---

## 🚀 Prochaines étapes

### 1. Configuration immédiate

Ajoute ta clé API NanoBanana dans `.env.local` :

```bash
NANOBANANA_API_KEY=ta_cle_api_ici
```

Puis redémarre le serveur :

```bash
npm run dev
```

### 2. Test

Suis le guide complet : **`GUIDE-TEST-PHOTOS-IA.md`**

Quick test :
1. Complète l'onboarding
2. Paie 7,90€ (carte test : `4242 4242 4242 4242`)
3. Sur `/success`, attends le plan Claude
4. Upload 4-6 photos sources
5. Lance la génération
6. Attends 2-5 minutes
7. Télécharge tes 5 photos IA ! 🎉

### 3. Affinage des prompts

Une fois que tu as testé et vu les résultats, affine les prompts dans :
- `lib/nanobanana/prompts.ts`

Les prompts sont structurés par type de photo :
- **main** - Photo principale (portrait confiant)
- **lifestyle** - Photo dynamique
- **social** - Photo conviviale
- **passion** - Photo activité/hobby
- **elegant** - Photo sophistiquée

### 4. Landing page

Quand les photos IA fonctionnent bien, tu pourras créer une belle landing page marketing.

---

## 🔧 Commandes utiles

### Réinitialiser la génération photos (pour retester)

```sql
-- Dans Supabase Dashboard > SQL Editor
UPDATE analyses 
SET 
  source_photos_urls = NULL,
  generated_photos_urls = NULL,
  nanobanana_task_ids = NULL,
  image_generation_started_at = NULL,
  image_generation_used = false
WHERE user_id = auth.uid();
```

### Réinitialiser tout (onboarding + photos)

```sql
DELETE FROM analyses WHERE user_id = auth.uid();
```

---

## 📊 Architecture

### Flow de génération

1. **Upload photos sources** → Stockées en base64 temporairement
2. **Appel `/api/generate-photos`** → 5 appels NanoBanana en séquence
3. **Stockage task_ids** → Sauvegardés en DB
4. **Polling `/api/photo-status`** → Toutes les 3 secondes
5. **Téléchargement images** → Depuis NanoBanana vers Supabase Storage
6. **Affichage** → 5 photos prêtes à télécharger

### Colonnes DB utilisées

- `nanobanana_task_ids` (TEXT[]) - IDs des 5 tâches NanoBanana
- `generated_photos_urls` (TEXT[]) - URLs finales (Supabase Storage)
- `image_generation_used` (BOOLEAN) - Flag anti-abus (1 génération = 1 paiement)
- `image_generation_started_at` (TIMESTAMPTZ) - Timestamp début
- `source_photos_urls` (TEXT[]) - URLs photos sources (optionnel)

---

## ✅ Status

**L'API photos IA est maintenant prête à l'emploi !**

Il te suffit de :
1. Ajouter ta clé API NanoBanana
2. Tester le flow complet
3. Affiner les prompts selon les résultats

Bon test ! 🚀
