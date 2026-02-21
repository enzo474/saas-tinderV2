# DatingBoost Dashboard V2 - État d'avancement

## ✅ Phases complétées (1, 2, 4, 6, 7, 9, 11)

### PHASE 1 : Fondations ✅
- ✅ Migration SQL créée : `supabase-credits-system.sql`
- ✅ Système de crédits implémenté : `lib/credits.ts`
- ✅ Webhook Stripe mis à jour pour ajouter 130 crédits au premier achat
- ✅ Tables créées : `generated_images`, `generated_bios`, `photo_styles`

### PHASE 2 : Migration NanoBanana Pro ✅
- ✅ Service API NanoBanana : `lib/nanobanana/api.ts`
- ✅ Génération d'images remplacée de Gemini vers NanoBanana
- ✅ Webhook callback créé : `/api/nanobanana/callback`
- ✅ Variables d'environnement ajoutées dans `.env.local`

### PHASE 4 : Produits Stripe ✅
- ✅ Prix passé de 7,90€ à 9,90€
- ✅ Page pricing mise à jour
- ✅ Actions pour recharge de crédits créées
- ✅ Packs 50 et 100 crédits configurés

### PHASE 6 : Dashboard Layout ✅
- ✅ Layout dashboard avec sidebar
- ✅ Header avec affichage crédits + bouton recharge
- ✅ Navigation entre sections
- ✅ Modal de recharge de crédits

### PHASE 7 : Section HOME ✅
- ✅ Page `/dashboard/home` avec galeries
- ✅ Composant `ImageGallery` (download d'images)
- ✅ Composant `BioList` (copie de bios)
- ✅ API `/api/user/credits` pour polling

### PHASE 9 : Générateur de Bio ✅
- ✅ Page `/dashboard/bio` avec formulaire complet
- ✅ API `/api/generate-bio` avec Claude
- ✅ Prompts optimisés : `lib/prompts/bio.ts`
- ✅ Décompte automatique de 2 crédits par bio

### PHASE 11 : Section Accroche (Locked) ✅
- ✅ Page placeholder `/dashboard/hooks`
- ✅ UI "Bientôt disponible"

---

## 🚧 Phases restantes (3, 8, 10, 12)

### PHASE 3 : Refonte Success Page (Step-by-step) ❌
**Complexité** : Élevée  
**Estimation** : 3-4h

**À faire :**
1. Modifier `/app/success/SuccessContent.tsx` pour un flow step-by-step
2. Créer `components/photo-generation/StyleSelector.tsx`
3. Créer `components/photo-generation/PhotoStepFlow.tsx`
4. Créer `components/photo-generation/RegenerateModal.tsx`

**État actuel :** Upload 4-6 photos → Génération des 5 photos d'un coup  
**État cible :** Upload → Photo 1 (choix 3 styles) → Photo 2 (choix 4 styles) → Photos 3-5 (auto) → Dashboard

### PHASE 8 : Générateur d'Images Custom ❌
**Complexité** : Moyenne  
**Estimation** : 2-3h

**À faire :**
1. Créer `/app/dashboard/images/page.tsx`
2. Créer `components/image-generator/StylePicker.tsx` (fetch styles depuis DB)
3. Créer `components/image-generator/CustomPromptInput.tsx`
4. Créer `/api/generate-custom-images/route.ts`

**Logique :**
- Upload 4-6 photos sources
- Sélection de 5 styles (un par photo, dynamique depuis `photo_styles`)
- Prompt custom optionnel
- Vérification crédits (50 crédits pour 5 images)
- Génération via NanoBanana

### PHASE 10 : Rendu Profil (Preview) ❌
**Complexité** : Élevée  
**Estimation** : 3-4h

**À faire :**
1. Créer `/app/dashboard/profile/page.tsx`
2. Créer `components/profile-preview/AppSelector.tsx` (Tinder/Fruitz/Happn/Hinge)
3. Créer `components/profile-preview/ImageSelector.tsx` (max 5 images)
4. Créer `components/profile-preview/FeedPreview.tsx` (mock UI app)
5. Créer `components/profile-preview/DragDropReorder.tsx` (réorganisation)

**Dépendances :**
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

### PHASE 12 : Panel Admin ❌
**Complexité** : Moyenne  
**Estimation** : 2-3h

**À faire :**
1. Créer `/app/admin/photo-styles/page.tsx`
2. Créer `components/admin/StyleCard.tsx`
3. Créer `components/admin/StyleForm.tsx`
4. Créer `/api/admin/photo-styles/route.ts` (CRUD)
5. Ajouter middleware de protection route `/admin/*`

---

## 📋 Étapes pour continuer

### 1. Exécuter les migrations SQL
```bash
# Se connecter à Supabase Dashboard
# Aller dans "SQL Editor"
# Exécuter le fichier supabase-credits-system.sql
```

### 2. Configurer les variables d'environnement
Dans `.env.local`, remplacer :
```bash
NANOBANANA_API_KEY=YOUR_API_KEY_HERE
STRIPE_PRICE_CREDITS_50=YOUR_STRIPE_PRICE_ID_HERE
STRIPE_PRICE_CREDITS_100=YOUR_STRIPE_PRICE_ID_HERE
```

### 3. Créer les produits Stripe
Dans Stripe Dashboard, créer 3 produits :
1. **Plan initial** : 9,90€ (metadata: `product_type=initial_plan`)
2. **Pack 50 crédits** : 5,00€ (metadata: `product_type=credit_pack_50`)
3. **Pack 100 crédits** : 8,90€ (metadata: `product_type=credit_pack_100`)

Mettre à jour les IDs dans `.env.local`.

### 4. Tester le flow actuel
1. S'inscrire/Se connecter
2. Compléter l'onboarding
3. Payer (9,90€) → reçoit 130 crédits
4. Aller sur `/dashboard/home`
5. Tester la génération de bio (2 crédits)
6. Tester la recharge de crédits

---

## 🔧 Corrections nécessaires

### Fix: Callback URL pour NanoBanana
Dans `.env.local`, mettre à jour quand déployé en production :
```bash
# Development
NEXT_PUBLIC_CALLBACK_URL=http://localhost:3000/api/nanobanana/callback

# Production
NEXT_PUBLIC_CALLBACK_URL=https://votredomaine.com/api/nanobanana/callback
```

### Fix: Seed des styles de photos
Les URLs des images de preview dans `supabase-credits-system.sql` sont des placeholders.  
Il faudra :
1. Upload des vraies images de preview sur Supabase Storage
2. Mettre à jour les `preview_image_url` dans `photo_styles`
3. Écrire des prompts réalistes pour chaque style

---

## 🚀 Prochaines étapes recommandées

1. **Tester les fondations** (Phases 1, 2, 4, 6, 7, 9) avant de continuer
2. **Implémenter Phase 8** (Générateur Images Custom) - fonctionnel sans step-by-step
3. **Implémenter Phase 12** (Panel Admin) - pour gérer facilement les styles
4. **Implémenter Phase 3** (Success Step-by-step) - complexe mais important UX
5. **Implémenter Phase 10** (Rendu Profil) - feature bonus cool

---

## 📦 Dépendances à installer

```bash
npm install @dnd-kit/core @dnd-kit/sortable  # Pour Phase 10 (drag & drop)
npm install jszip                              # Pour téléchargement ZIP (optionnel)
```

---

## ⚠️ Points d'attention

### 1. RLS Supabase
Les policies RLS sont configurées dans `supabase-credits-system.sql`.  
Vérifier que :
- Les utilisateurs peuvent lire leurs propres `generated_images` et `generated_bios`
- Les utilisateurs authentifiés peuvent lire les `photo_styles` actifs
- Seul l'admin peut modifier les `photo_styles`

### 2. Crédits NanoBanana vs Crédits App
- **Crédits App (DB)** : Crédits de l'utilisateur dans l'app (130 initiaux, rechargeables)
- **Crédits NanoBanana (API)** : Crédits de votre compte NanoBanana (à surveiller)

Vérifier régulièrement vos crédits NanoBanana via :
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.nanobananaapi.ai/api/v1/common/credit
```

### 3. Décompte automatique
Les crédits sont déduits **avant** la génération.  
En cas d'échec API, ils sont **remboursés automatiquement**.

### 4. Webhook Stripe
Le webhook doit être configuré dans Stripe Dashboard :
```
URL: https://votredomaine.com/api/stripe/webhook
Events: checkout.session.completed
```

---

## 🎯 État final attendu

Après toutes les phases :
- ✅ Paiement 9,90€ → 130 crédits
- ✅ Génération step-by-step de 5 photos IA avec choix styles
- ✅ Générateur de bio illimité (2 crédits/bio)
- ✅ Générateur d'images custom (10 crédits/image)
- ✅ Rendu profil avec preview app et drag & drop
- ✅ Panel admin pour gérer les styles
- ✅ Recharge de crédits (packs 50 et 100)
- ✅ Dashboard HOME avec historique complet

---

**Bon courage pour la suite ! 🚀**
