# 🚀 GUIDE DE DÉPLOIEMENT - DatingBoost

Ce guide détaille toutes les étapes pour déployer DatingBoost en production.

---

## 1️⃣ Préparer la base de données Supabase

### Accéder au Dashboard
1. Va sur [https://supabase.com](https://supabase.com)
2. Sélectionne ton projet
3. Clique sur **SQL Editor** dans le menu de gauche

### Exécuter les migrations SQL (dans l'ordre)

#### Migration 1 : Structure principale
```sql
-- Copier le contenu de supabase-setup.sql
```
Cliquer sur **RUN** ➜ Attendre "Success"

#### Migration 2 : Colonne personality
```sql
-- Copier le contenu de supabase-add-personality.sql
```
Cliquer sur **RUN** ➜ Attendre "Success"

#### Migration 3 : Colonnes premium
```sql
-- Copier le contenu de supabase-add-premium-columns.sql
```
Cliquer sur **RUN** ➜ Attendre "Success"

#### Migration 4 : Colonne ab_variant
```sql
-- Copier le contenu de supabase-add-ab-variant.sql
```
Cliquer sur **RUN** ➜ Attendre "Success"

### Vérifier la table
Dans **SQL Editor**, exécuter :
```sql
SELECT * FROM analyses LIMIT 1;
```
Tu devrais voir toutes les colonnes (même si vide).

---

## 2️⃣ Configurer Supabase Storage

### Créer le bucket uploads
1. Dans le Dashboard, clique sur **Storage** (menu gauche)
2. Clique sur **New bucket**
3. Nom : `uploads`
4. Public : ✅ **Activé** (pour que les photos soient accessibles)
5. Clique sur **Create bucket**

### Configurer les RLS (Row Level Security)
1. Clique sur le bucket `uploads`
2. Va dans **Policies**
3. Clique sur **New Policy**
4. Choisis **Custom policy**
5. Nom : `Users can access their own folder`
6. Policy definition :
```sql
(storage.foldername(name))[1] = auth.uid()
```
7. Target roles : `authenticated`
8. **IMPORTANT** : Activer les 4 permissions (SELECT, INSERT, UPDATE, DELETE)
9. Clique sur **Save**

---

## 3️⃣ Configurer Stripe

### Créer le produit
1. Va sur [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Clique sur **Products** dans le menu
3. Clique sur **Add product**
4. Nom : `Plan d'optimisation Tinder`
5. Description : `Génération de 4 bios personnalisées + 5 photos IA optimisées`
6. Prix : `7.90` EUR
7. Type : **One-time** (paiement unique)
8. Clique sur **Save product**
9. **IMPORTANT** : Copie le **Price ID** (commence par `price_...`)

### Configurer le webhook
1. Dans Stripe Dashboard, clique sur **Developers** → **Webhooks**
2. Clique sur **Add endpoint**
3. URL : `https://TON-DOMAINE.com/api/stripe/webhook`
   - En local : utiliser Stripe CLI (voir section ci-dessous)
4. Description : `DatingBoost payment webhook`
5. Events to send :
   - Clique sur **Select events**
   - Cherche et coche : `checkout.session.completed`
   - Clique sur **Add events**
6. Clique sur **Add endpoint**
7. **IMPORTANT** : Copie le **Signing secret** (commence par `whsec_...`)

### Test en local (webhook)
Installer Stripe CLI :
```bash
brew install stripe/stripe-cli/stripe
```

Connecter Stripe CLI :
```bash
stripe login
```

Lancer le forwarding :
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copie le **webhook signing secret** affiché dans le terminal.

---

## 4️⃣ Variables d'environnement

### En développement (.env.local)

Crée/édite le fichier `.env.local` à la racine du projet :

```bash
# Supabase (depuis Dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Stripe (depuis Dashboard Stripe)
STRIPE_SECRET_KEY=sk_test_...          # Mode test
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...        # Depuis CLI en local
STRIPE_PRICE_PLAN=price_...            # Price ID copié avant

# Claude API (depuis console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-api03-...

# NanoBanana (optionnel, pour photos IA)
NANOBANANA_API_KEY=                    # Laisser vide si pas encore
NANOBANANA_API_URL=https://nanobananaapi.ai/api

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_AB_VARIANT_B_PERCENT=50    # 50% vers Onboarding B

# Admin (bypass paiement en test)
ADMIN_EMAIL=ton-email@gmail.com
```

### En production (Vercel/Netlify)

Dans le dashboard de ton hébergeur, ajouter les mêmes variables **SAUF** :
- `STRIPE_SECRET_KEY` → Utiliser `sk_live_...` (mode live)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → Utiliser `pk_live_...`
- `STRIPE_WEBHOOK_SECRET` → Utiliser le secret du webhook production
- `NEXT_PUBLIC_APP_URL` → URL production (ex: `https://datingboost.com`)

---

## 5️⃣ Tester en local

### Lancer le serveur
```bash
npm run dev
```

### Lancer le webhook Stripe (dans un autre terminal)
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Tester le parcours complet
1. Ouvre `http://localhost:3000`
2. Authentifie-toi avec un email de test
3. Complète l'onboarding
4. Vérifie les résultats
5. Clique sur "Voir mon plan"
6. Utilise la carte test Stripe : `4242 4242 4242 4242`
7. Vérifie la redirection vers `/success`
8. Attends la génération du plan Claude (15-30s)
9. Vérifie l'affichage des 4 bios

---

## 6️⃣ Déployer sur Vercel

### Via GitHub (recommandé)

1. Pousse ton code sur GitHub :
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TON-USERNAME/datingboost.git
git push -u origin main
```

2. Va sur [https://vercel.com](https://vercel.com)
3. Clique sur **New Project**
4. Importe ton repo GitHub
5. Configure les variables d'environnement :
   - Copie toutes les variables depuis `.env.local`
   - **ATTENTION** : Utilise les clés Stripe **live** (sk_live_, pk_live_)
6. Framework Preset : **Next.js**
7. Clique sur **Deploy**

### Configuration post-déploiement

1. Une fois déployé, copie l'URL de production (ex: `https://datingboost.vercel.app`)
2. Retourne dans **Vercel > Settings > Environment Variables**
3. Édite `NEXT_PUBLIC_APP_URL` avec l'URL de production
4. **Redéploie** l'app (Settings > Deployments > Redeploy)

---

## 7️⃣ Configurer le webhook Stripe en production

1. Retourne sur **Stripe Dashboard** → **Developers** → **Webhooks**
2. Ajoute un nouveau endpoint avec l'URL de production :
   ```
   https://datingboost.vercel.app/api/stripe/webhook
   ```
3. Événement : `checkout.session.completed`
4. Copie le nouveau **webhook signing secret**
5. Retourne dans **Vercel > Settings > Environment Variables**
6. Édite `STRIPE_WEBHOOK_SECRET` avec le nouveau secret
7. **Redéploie** l'app

---

## 8️⃣ Passer Stripe en mode Live

### Activer le mode live
1. Dans Stripe Dashboard, clique sur **Activate your account** (en haut)
2. Remplis les informations requises :
   - Informations business
      - Coordonnées bancaires (pour recevoir les paiements)
   - Documents légaux
3. Une fois activé, tu verras un toggle **Test/Live** en haut à gauche

### Utiliser les clés live
1. Active le mode **Live** (toggle)
2. Va dans **Developers** → **API keys**
3. Copie les nouvelles clés :
   - `STRIPE_SECRET_KEY` (sk_live_...)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_...)
4. Mets à jour les variables dans Vercel
5. **Redéploie** l'app

---

## 9️⃣ Vérifications finales

### Checklist pré-production
- [ ] SQL migrations exécutées sur Supabase
- [ ] Bucket `uploads` créé avec RLS
- [ ] Produit Stripe créé (7,90€)
- [ ] Webhook Stripe configuré (production URL)
- [ ] Variables d'env configurées en production
- [ ] `NEXT_PUBLIC_APP_URL` pointe vers l'URL de production
- [ ] Mode live Stripe activé (si prêt)
- [ ] Test d'un parcours complet en production
- [ ] Paiement test réussi (mode test ou live)
- [ ] Plan Claude généré correctement
- [ ] Photos téléchargeables

### Test de paiement réel
1. Utilise ta propre carte bancaire
2. Paie les 7,90€
3. Vérifie que le paiement apparaît dans Stripe Dashboard
4. Vérifie que le plan est bien généré
5. Si tout OK → **Prêt pour les vrais users !**

---

## 🔟 Monitorer l'application

### Logs Vercel
- Va dans **Vercel > Deployments** → Clique sur le dernier déploiement
- Onglet **Functions** pour voir les logs des API routes

### Logs Stripe
- **Stripe Dashboard** → **Developers** → **Logs**
- Vérifie que les webhooks arrivent bien (statut 200)

### Logs Supabase
- **Supabase Dashboard** → **Logs**
- Vérifie les requêtes API et les erreurs

---

## 🆘 Troubleshooting

### Erreur "Table analyses does not exist"
→ Exécute `supabase-setup.sql` dans SQL Editor

### Erreur "Permission denied for bucket uploads"
→ Vérifie les RLS sur le bucket (section 2)

### Webhook Stripe ne fonctionne pas
→ Vérifie que `STRIPE_WEBHOOK_SECRET` est bien configuré
→ Vérifie les logs Stripe (Dashboard > Developers > Logs)

### Photos ne s'affichent pas
→ Vérifie que le bucket `uploads` est **public**
→ Vérifie les RLS

### Plan Claude ne se génère pas
→ Vérifie `ANTHROPIC_API_KEY` dans les variables d'env
→ Vérifie les logs Vercel Functions

---

## ✅ Félicitations !

Ton app DatingBoost est maintenant en production et prête à accueillir des utilisateurs réels ! 🎉

N'oublie pas de :
- Monitorer les conversions A/B (Onboarding 1 vs 2)
- Ajouter des analytics (Plausible, Posthog)
- Mettre en place un système de feedback utilisateur
