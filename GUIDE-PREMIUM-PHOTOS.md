# Guide : Offre Premium Photos IA (14,90€)

## ✅ Implémentation terminée

### Fichiers créés

#### Base de données
- `supabase-add-premium-columns.sql` - Migration SQL pour ajouter les colonnes premium

#### Configuration
- Variables d'environnement ajoutées dans `.env.local` et `.env.example` :
  - `NANOBANANA_API_KEY`
  - `NANOBANANA_API_URL`

#### Backend
- `lib/nanobanana/prompts.ts` - Construction des prompts IA pour 5 types de photos
- `app/api/generate-photos/route.ts` - API pour lancer la génération
- `app/api/photo-status/route.ts` - API pour polling du statut

#### Frontend - Composants
- `components/ai-photos/PhotoUpload.tsx` - Upload drag & drop 4-6 photos
- `components/ai-photos/GenerationProgress.tsx` - Affichage progression avec 5 barres
- `components/ai-photos/GeneratedPhotos.tsx` - Affichage des 5 photos + download

#### Frontend - Pages
- `app/success/premium/page.tsx` - Page serveur avec vérifications
- `app/success/premium/PremiumContent.tsx` - Composant client avec gestion des états

#### Utilitaires
- `lib/utils/base64.ts` - Conversion File → Base64
- `lib/utils/download.ts` - Download individuel + ZIP avec JSZip

#### Fichiers modifiés
- `middleware.ts` - Routing premium + redirection automatique
- `app/pricing/actions.ts` - Redirection admin selon product_type

### Dépendances installées
- `jszip` - Création de ZIP pour téléchargement groupé
- `@types/jszip` - Types TypeScript
- `react-dropzone` - Drag & drop d'images

## 🧪 Guide de test

### Étape 1 : Exécuter la migration SQL

```bash
# Exécuter dans Supabase SQL Editor
cat supabase-add-premium-columns.sql
```

### Étape 2 : Configurer NanoBanana

Dans `.env.local`, ajouter votre clé API :
```env
NANOBANANA_API_KEY=votre_cle_api_nanobanana
```

### Étape 3 : Tester le flow complet

1. **Se connecter en tant qu'admin** (bypass Stripe)
   - Email : `enzo.ambrosiano38920@gmail.com`

2. **Compléter l'onboarding si nécessaire**
   - Ou utiliser `/api/analysis/reset-all` pour recommencer

3. **Aller sur la page pricing**
   - URL : `http://localhost:3000/pricing`

4. **Choisir l'offre "Plan + Photos" (14,90€)**
   - En tant qu'admin, vous serez redirigé vers `/success/premium`

5. **Upload des photos sources (4-6 photos)**
   - Drag & drop ou cliquer pour sélectionner
   - Formats acceptés : JPG, PNG (max 10MB)

6. **Observer la génération**
   - 5 barres de progression individuelles
   - Progression globale 0-100%
   - Polling automatique toutes les 8 secondes
   - Durée estimée : 2-4 minutes

7. **Télécharger les photos générées**
   - Téléchargement individuel par photo
   - Téléchargement groupé (ZIP)

### États possibles

1. **upload** : Zone de drop pour uploader les photos sources
2. **generating** : Affichage de la progression avec polling
3. **completed** : Affichage des 5 photos finales avec boutons download

### Points de sécurité testés

- ✅ Redirection si non authentifié
- ✅ Redirection si pas de paiement
- ✅ Redirection si mauvais product_type
- ✅ Une seule génération par achat (`image_generation_used`)
- ✅ Reprise génération en cours si page rechargée
- ✅ Timeout à 10 minutes

### Endpoints API

**POST `/api/generate-photos`**
- Body : `{ sourcePhotos: string[] }` (array de base64)
- Retourne : `{ taskIds: string[], analysisId: string }`

**GET `/api/photo-status?analysisId=xxx`**
- Retourne :
  - En cours : `{ status: 'processing', globalProgress: 60, completedCount: 3, tasks: [...] }`
  - Terminé : `{ status: 'completed', photos: string[] }`

## 🎯 Types de photos générées

1. **Main** - Photo principale (portrait pro, golden hour)
2. **Lifestyle** - Photo lifestyle (voyage, sport, café)
3. **Social** - Photo sociale (restaurant, bar, événement)
4. **Passion** - Photo activité (sport/hobby de l'utilisateur)
5. **Elegant** - Photo élégante (upscale, blazer, rooftop)

Chaque prompt utilise le contexte utilisateur (vibe, lifestyle, sport, job, target_women) pour personnaliser le résultat.

## 🔧 Dépannage

### Erreur : "NanoBanana API configuration missing"
→ Vérifier que `NANOBANANA_API_KEY` et `NANOBANANA_API_URL` sont dans `.env.local`

### Erreur : "Offre premium requise"
→ S'assurer que `product_type = 'plan_photos'` dans la DB

### Polling ne termine jamais
→ Vérifier les logs NanoBanana dans la console serveur
→ Timeout automatique à 10 minutes

### Photos ne s'affichent pas
→ Vérifier que les URLs Supabase Storage sont accessibles
→ Vérifier les permissions RLS sur le bucket `uploads`

## 📝 Prochaines étapes (optionnel)

- [ ] Ajouter RLS policies pour `source-photos` et `generated-photos`
- [ ] Implémenter retry logic si une des 5 générations échoue
- [ ] Ajouter analytics pour tracker le taux de succès
- [ ] Optimiser les prompts selon les retours utilisateurs
- [ ] Ajouter preview des photos avant génération
