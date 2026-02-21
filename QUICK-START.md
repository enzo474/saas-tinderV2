# ⚡ Quick Start - DatingBoost

Guide ultra-rapide pour lancer l'app en 5 minutes.

---

## 1️⃣ Installation (30 secondes)

```bash
npm install
```

---

## 2️⃣ Configuration Supabase (2 minutes)

### A. Exécuter les migrations SQL

Dashboard Supabase > SQL Editor > Copier-coller dans l'ordre :

1. `supabase-setup.sql`
2. `supabase-add-personality.sql`
3. `supabase-add-premium-columns.sql`
4. `supabase-add-ab-variant.sql`

Cliquer **RUN** après chaque migration.

### B. Créer le bucket Storage

Dashboard Supabase > Storage :
1. New bucket → Nom : `uploads`
2. Cocher **Public**
3. Create bucket
4. Policies → New Policy → Custom
5. Nom : `Users can access their own folder`
6. Policy : `(storage.foldername(name))[1] = auth.uid()`
7. Target roles : `authenticated`
8. Activer les 4 permissions (SELECT, INSERT, UPDATE, DELETE)
9. Save

---

## 3️⃣ Configuration Stripe (1 minute)

Dashboard Stripe > Products :
1. Add product
2. Nom : `Plan d'optimisation Tinder`
3. Prix : `7.90` EUR
4. Type : One-time
5. Save → Copier le **Price ID**

Dashboard Stripe > Developers > Webhooks :
1. Add endpoint : `http://localhost:3000/api/stripe/webhook`
2. Events : `checkout.session.completed`
3. Add endpoint → Copier le **Webhook Secret**

---

## 4️⃣ Variables d'environnement (1 minute)

Copier `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

Remplir dans `.env.local` :

```bash
# Supabase (Dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PLAN=price_...

# Claude
ANTHROPIC_API_KEY=sk-ant-api03-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_AB_VARIANT_B_PERCENT=50
ADMIN_EMAIL=ton-email@gmail.com
```

---

## 5️⃣ Lancer l'app (30 secondes)

### Terminal 1 : App
```bash
npm run dev
```

### Terminal 2 : Webhook Stripe
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## ✅ C'EST PRÊT !

Ouvre `http://localhost:3000` et teste l'app !

### Test rapide :
1. Clique sur "Se connecter"
2. Entre un email de test
3. Vérifie ton email pour le magic link
4. Complète l'onboarding
5. Paie avec carte test : `4242 4242 4242 4242`
6. Vérifie la génération du plan

---

## 📚 Besoin de plus d'infos ?

- **Documentation complète** : `INDEX.md`
- **Guide de déploiement** : `GUIDE-DEPLOIEMENT.md`
- **Checklist détaillée** : `CHECKLIST-LANCEMENT.md`

---

Bonne chance ! 🚀
