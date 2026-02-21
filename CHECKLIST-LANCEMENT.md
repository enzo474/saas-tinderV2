# ✅ CHECKLIST PRÉ-LANCEMENT - DatingBoost

## 📊 Base de données Supabase

### Table analyses
- [ ] Table `analyses` créée (`supabase-setup.sql` exécuté)
- [ ] Colonne `personality` ajoutée (`supabase-add-personality.sql` exécuté)
- [ ] Colonnes premium ajoutées (`supabase-add-premium-columns.sql` exécuté)
- [ ] Colonne `ab_variant` ajoutée (`supabase-add-ab-variant.sql` exécuté)
- [ ] RLS (Row Level Security) activées

**SQL à exécuter dans Supabase Dashboard > SQL Editor** :
1. ✅ `supabase-setup.sql`
2. ✅ `supabase-add-personality.sql`
3. ✅ `supabase-add-premium-columns.sql`
4. ✅ `supabase-add-ab-variant.sql`

### Storage
- [ ] Bucket `uploads` créé
- [ ] RLS configurées (auth users only)

---

## 🔐 Variables d'environnement

Fichier `.env.local` - Vérifier que toutes sont renseignées :

### Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

### Stripe
- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRICE_PLAN` (price_ID du produit 7,90€)

### APIs externes
- [ ] `ANTHROPIC_API_KEY` (Claude)
- [ ] `NANOBANANA_API_KEY` (Photos IA - optionnel)
- [ ] `NANOBANANA_API_URL`

### App
- [ ] `NEXT_PUBLIC_APP_URL` (ex: http://localhost:3000 en dev)
- [ ] `NEXT_PUBLIC_AB_VARIANT_B_PERCENT` (50 par défaut)
- [ ] `ADMIN_EMAIL`

---

## 💳 Stripe Configuration

### Produit
- [ ] Créer un produit "Plan d'optimisation Tinder" à 7,90€
- [ ] Copier le Price ID dans `.env.local` (`STRIPE_PRICE_PLAN`)

### Webhook
- [ ] Configurer webhook Stripe vers `{URL}/api/stripe/webhook`
- [ ] Événements à écouter : `checkout.session.completed`
- [ ] Copier le Webhook Secret dans `.env.local`

**URL de test en local** : Utiliser Stripe CLI
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 🧪 Tests fonctionnels à faire

### 1. Authentification
- [ ] Connexion via email magic link fonctionne
- [ ] Redirection vers `/start` après authentification

### 2. A/B Testing
- [ ] `/start` redirige vers `/onboarding/intro` ou `/ob2/intro`
- [ ] Le variant est sauvegardé dans `analyses.ab_variant`

### 3. Onboarding 1 (9 étapes)
- [ ] Étape 1-3 : Matchs, Selfie, Analyse → OK
- [ ] `/analysis/intro` est skippée (supprimée)
- [ ] Étape 1-6 : Objectif, Photos, Relation, Positionnement, Anecdotes, Analyse → OK
- [ ] Redirection finale vers `/results`

### 4. Onboarding 2 (8 étapes)
- [ ] Étape 1-3 : Matchs, Selfie, Analyse → OK
- [ ] Étape 4-8 : Photos (min 1), Relation, Positionnement (sans taille), Anecdotes (2 champs), Analyse → OK
- [ ] Redirection finale vers `/results`

### 5. Génération du plan
- [ ] Page `/results` affiche les métriques
- [ ] Clic sur "Voir mon plan" → redirection `/pricing`
- [ ] Après paiement → génération du plan Claude
- [ ] Plan affiché sur `/success`

### 6. Génération photos IA
- [ ] Upload 4-6 photos sources
- [ ] Appel API NanoBanana
- [ ] Polling du statut
- [ ] Affichage des 5 photos générées
- [ ] Boutons téléchargement fonctionnels (individuel + ZIP)

### 7. Paiement Stripe
- [ ] Redirection vers Stripe Checkout
- [ ] Paiement test avec carte `4242 4242 4242 4242`
- [ ] Webhook reçu correctement
- [ ] Redirection vers `/success` après paiement

---

## 🔒 Sécurité

### Row Level Security (RLS)
- [ ] Politique `analyses` : Users can only see their own analyses
- [ ] Politique `uploads` bucket : Users can only access their own files

### Secrets
- [ ] Aucune clé API exposée côté client
- [ ] Service Role Key utilisée uniquement côté serveur
- [ ] Webhook Stripe vérifié avec le secret

---

## 🚀 Performance

- [x] Images Next.js optimisées
- [x] Dynamic imports sur PhotoUpload, GenerationProgress, GeneratedPhotos
- [x] SSR désactivé sur composants client (`'use client'`)
- [x] Polling intelligent pour génération photos

---

## 📝 Checklist finale avant lancement

### Développement
- [ ] `npm run dev` démarre sans erreur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)

### Test du parcours complet
- [ ] S'authentifier avec un nouvel email
- [ ] Compléter un onboarding (A ou B)
- [ ] Voir les résultats
- [ ] Payer (mode test)
- [ ] Voir le plan complet
- [ ] Générer les photos IA
- [ ] Télécharger les photos

### Déploiement
- [ ] Variables d'environnement configurées en production
- [ ] Webhook Stripe configuré vers URL production
- [ ] Build Next.js réussit (`npm run build`)
- [ ] App déployée (Vercel/Netlify/autre)

---

## 🎯 Résultat final

Après ces vérifications, l'app sera prête pour :
- ✅ Accueillir des utilisateurs réels
- ✅ A/B testing automatique (Onboarding 1 vs 2)
- ✅ Génération de plans personnalisés
- ✅ Génération de photos IA
- ✅ Paiements sécurisés
- ✅ Téléchargement illimité des photos

---

## 📌 Notes importantes

1. **Mode Stripe** : Commence en mode test, passe en live quand prêt
2. **NanoBanana API** : Configure la clé quand tu veux activer les photos IA
3. **Storage TTL** : Peut être ajouté plus tard si besoin d'optimiser les coûts
4. **Admin bypass** : L'email admin peut tester sans payer

---

## 🐛 En cas de problème

### Erreur d'authentification
→ Vérifier Supabase Auth activé et email provider configuré

### Erreur de paiement
→ Vérifier Stripe keys et webhook secret

### Photos IA ne se génèrent pas
→ Vérifier NanoBanana API key et URL

### Erreur de build
→ `npm run type-check` pour voir les erreurs TypeScript
