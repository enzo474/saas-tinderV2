# ✅ TODO AVANT LANCEMENT

Checklist rapide des étapes critiques à faire avant de lancer l'app en production.

---

## 🔴 ÉTAPES OBLIGATOIRES

### 1. Base de données Supabase
Dashboard → SQL Editor → Exécuter dans l'ordre :

```bash
# 1. Structure principale
✅ supabase-setup.sql

# 2. Colonne personality
✅ supabase-add-personality.sql

# 3. Colonnes premium (photos IA)
✅ supabase-add-premium-columns.sql

# 4. Colonne ab_variant (A/B test)
✅ supabase-add-ab-variant.sql
```

**Vérifier** : `SELECT * FROM analyses;` doit fonctionner (même si vide)

---

### 2. Storage Supabase
Dashboard → Storage :

- [ ] Créer bucket `uploads`
- [ ] Activer **Public**
- [ ] Ajouter RLS : `(storage.foldername(name))[1] = auth.uid()`
- [ ] Activer les 4 permissions (SELECT, INSERT, UPDATE, DELETE)

**Vérifier** : Upload test dans le bucket doit fonctionner

---

### 3. Stripe Configuration
Dashboard Stripe → Products :

- [ ] Créer produit "Plan d'optimisation Tinder"
- [ ] Prix : **7,90€**
- [ ] Type : **One-time**
- [ ] Copier **Price ID** (commence par `price_...`)
- [ ] Coller dans `.env.local` → `STRIPE_PRICE_PLAN`

Dashboard Stripe → Developers → Webhooks :

- [ ] Ajouter endpoint : `{URL}/api/stripe/webhook`
- [ ] Événement : `checkout.session.completed`
- [ ] Copier **Webhook Secret** (commence par `whsec_...`)
- [ ] Coller dans `.env.local` → `STRIPE_WEBHOOK_SECRET`

**En local** : Lancer `stripe listen --forward-to localhost:3000/api/stripe/webhook`

---

### 4. Variables d'environnement

Fichier `.env.local` à la racine du projet :

```bash
# Supabase (Dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Stripe
STRIPE_SECRET_KEY=sk_test_...  # ou sk_live_ en prod
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # ou pk_live_
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PLAN=price_...

# Claude
ANTHROPIC_API_KEY=sk-ant-api03-...

# NanoBanana (optionnel)
NANOBANANA_API_KEY=
NANOBANANA_API_URL=https://nanobananaapi.ai/api

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000  # ou URL prod
NEXT_PUBLIC_AB_VARIANT_B_PERCENT=50

# Admin
ADMIN_EMAIL=ton-email@gmail.com
```

**Vérifier** : Aucune variable vide (sauf NANOBANANA_API_KEY si pas de photos IA)

---

## 🟡 TESTS OBLIGATOIRES

### Test Variant A (Onboarding 1)
- [ ] Créer un compte avec email test 1
- [ ] Vérifier redirection `/start` → `/onboarding/intro`
- [ ] Compléter les 3 étapes onboarding
- [ ] Compléter les 6 étapes analyse
- [ ] Vérifier page `/results`
- [ ] Cliquer "Voir mon plan" → `/pricing`
- [ ] Payer avec carte test : `4242 4242 4242 4242`
- [ ] Vérifier redirection `/success`
- [ ] Attendre génération plan Claude (15-30s)
- [ ] Vérifier affichage des 4 bios

### Test Variant B (Onboarding 2)
- [ ] Créer un compte avec email test 2
- [ ] Vérifier redirection `/start` → `/ob2/intro`
- [ ] Compléter les 3 étapes onboarding
- [ ] Compléter les 8 étapes analyse (simplifiée)
- [ ] Même flow que Variant A ensuite

### Test Photos IA (si NANOBANANA_API_KEY)
- [ ] Sur `/success` après paiement
- [ ] Upload 4-6 photos sources
- [ ] Vérifier génération des 5 photos
- [ ] Télécharger 1 photo individuelle
- [ ] Télécharger toutes (ZIP)

---

## 🟢 DÉPLOIEMENT PRODUCTION

### Vercel (recommandé)

1. **Push sur GitHub** :
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

2. **Import dans Vercel** :
- Aller sur [vercel.com](https://vercel.com)
- New Project → Importer repo
- Configurer variables d'env (copier depuis `.env.local`)
- **ATTENTION** : Utiliser clés Stripe **live** (sk_live_, pk_live_)
- Deploy

3. **Configuration post-déploiement** :
- Copier URL de production
- Mettre à jour `NEXT_PUBLIC_APP_URL` dans Vercel
- Redéployer

4. **Webhook Stripe production** :
- Stripe Dashboard → Webhooks
- Ajouter endpoint avec URL production : `https://datingboost.vercel.app/api/stripe/webhook`
- Copier nouveau webhook secret
- Mettre à jour `STRIPE_WEBHOOK_SECRET` dans Vercel
- Redéployer

---

## 🔵 APRÈS LE DÉPLOIEMENT

### Vérifications finales
- [ ] Ouvrir l'URL de production
- [ ] Tester un parcours complet (A ou B)
- [ ] Vérifier paiement test Stripe
- [ ] Vérifier génération plan Claude
- [ ] Vérifier photos téléchargeables
- [ ] Vérifier les logs Vercel (Functions)
- [ ] Vérifier les logs Stripe (Webhooks)

### Activer mode Live Stripe (quand prêt)
- [ ] Stripe Dashboard → Activer compte
- [ ] Remplir informations business
- [ ] Passer en mode **Live** (toggle)
- [ ] Copier nouvelles clés (sk_live_, pk_live_)
- [ ] Mettre à jour dans Vercel
- [ ] Redéployer
- [ ] **Tester avec ta propre carte** (7,90€ réels)

---

## 📊 MONITORING

### Dashboards à surveiller
- **Vercel** : Logs des Functions
- **Stripe** : Logs Webhooks (doivent être statut 200)
- **Supabase** : Logs API et Storage
- **Claude** : Usage API (coût par requête)
- **NanoBanana** : Usage API (si activé)

### Métriques A/B à tracker
- Taux de complétion Onboarding A vs B
- Taux de conversion paiement A vs B
- Temps moyen de complétion
- Feedback utilisateurs

---

## 🎉 LANCEMENT !

Une fois toutes les étapes ci-dessus validées :

✅ **Ton app est prête pour accueillir des utilisateurs réels !**

Prochaines étapes suggérées :
- Ajouter analytics (Plausible, Posthog)
- Créer une landing page marketing
- Mettre en place des notifications email
- Lancer une campagne d'acquisition
- Monitorer et optimiser les conversions A/B

---

**Guide complet** : Voir `GUIDE-DEPLOIEMENT.md`
**Checklist détaillée** : Voir `CHECKLIST-LANCEMENT.md`
**Résumé technique** : Voir `RESUME-REFACTORING.md`
