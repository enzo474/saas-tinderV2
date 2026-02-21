# Guide de Démarrage Rapide — DatingBoost

## Prérequis

- Node.js 18+ installé
- Compte Supabase (gratuit sur supabase.com)
- Compte Stripe (mode test gratuit)
- Clé API Anthropic (Claude)

## Installation

1. **Cloner et installer les dépendances**

```bash
cd /Users/macenzo/Documents/saas-tinderV2
npm install
```

2. **Configuration Supabase**

a. Créer un projet sur [supabase.com](https://supabase.com)

b. Dans le SQL Editor, exécuter le fichier `supabase-setup.sql`

c. Dans Storage, créer un bucket `uploads` (privé) et ajouter les politiques :

```sql
-- Policy pour l'upload
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy pour la lecture
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

d. (Optionnel) Activer Google OAuth dans Authentication > Providers

3. **Configuration Stripe**

a. Aller sur [dashboard.stripe.com](https://dashboard.stripe.com)

b. Créer 2 produits (mode test) :
   - "Plan d'optimisation stratégique" : 7.90 EUR (one-time)
   - "Plan + Photos optimisées" : 14.90 EUR (one-time)

c. Copier les Price IDs

d. Dans Developers > Webhooks, ajouter :
   - Endpoint : `http://localhost:3000/api/stripe/webhook` (pour le dev)
   - Événement : `checkout.session.completed`

4. **Configuration Variables d'environnement**

Éditer `.env.local` avec vos vraies valeurs :

```bash
# Supabase (trouvez-les dans Settings > API de votre projet)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe (mode test pour le développement)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PLAN=price_xxx
STRIPE_PRICE_PLAN_PHOTOS=price_xxx

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. **Lancer l'application**

```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## Test du Webhook Stripe en local

Pour tester les paiements en local, utiliser Stripe CLI :

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks vers votre serveur local
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copier le webhook signing secret affiché et le mettre dans STRIPE_WEBHOOK_SECRET
```

## Flux de test complet

1. Ouvrir http://localhost:3000
2. Cliquer sur "Commencer l'Analyse Gratuite"
3. S'inscrire avec un email
4. Compléter l'onboarding partie 1 (3 étapes)
5. Compléter l'analyse partie 2 (7 étapes)
6. Voir les résultats sur /results
7. Aller sur /pricing
8. Utiliser une carte de test Stripe : `4242 4242 4242 4242`
9. Voir le plan généré par Claude sur /success

## Cartes de test Stripe

- Succès : `4242 4242 4242 4242`
- Échec : `4000 0000 0000 0002`
- Authentification 3D : `4000 0025 0000 3155`

Date d'expiration : n'importe quelle date future
CVC : n'importe quel 3 chiffres

## Déploiement sur Vercel

1. Pusher le code sur GitHub

```bash
git init
git add .
git commit -m "Initial commit - DatingBoost app"
git remote add origin https://github.com/votre-username/datingboost.git
git push -u origin main
```

2. Importer sur Vercel depuis GitHub

3. Configurer les variables d'environnement dans Vercel (mêmes que .env.local)

4. Mettre à jour `NEXT_PUBLIC_APP_URL` avec votre domaine Vercel

5. Mettre à jour le webhook Stripe avec votre domaine de production

## Support

Pour toute question, vérifier :
- Les logs de la console navigateur
- Les logs Supabase (Logs & Queries)
- Les logs Stripe (Developers > Logs)
- Les logs Vercel (si déployé)

## Sécurité en Production

Avant de déployer en production :

1. ✅ Utiliser les clés Stripe en mode **Live** (pas test)
2. ✅ Configurer le webhook Stripe avec votre domaine de production
3. ✅ Activer RLS sur toutes les tables Supabase
4. ✅ Restreindre les permissions Storage Supabase
5. ✅ Ne jamais committer `.env.local` (déjà dans .gitignore)
6. ✅ Configurer un domaine custom (pas .vercel.app)
7. ✅ Activer HTTPS (automatique sur Vercel)
