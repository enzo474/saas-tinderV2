# 🔥 DatingBoost - Optimisation profil Tinder par IA

Application SaaS qui génère des plans d'optimisation personnalisés pour profils Tinder, incluant 4 bios optimisées et 5 photos générées par IA.

## ✨ Fonctionnalités

- 🎯 **A/B Testing** - 2 parcours d'onboarding testés en parallèle
- 🤖 **Génération de bios** - 4 bios personnalisées par Claude AI
- 📸 **Photos IA** - 5 photos optimisées générées par IA
- 💳 **Paiement Stripe** - Offre unique à 7,90€
- 📊 **Métriques personnalisées** - Analyse du potentiel du profil
- 🔐 **Authentification sécurisée** - Supabase Auth (magic link)

## 🚀 Démarrage rapide

### 1. Lire la documentation

**👉 Commence par `INDEX.md` pour savoir par où commencer !**

Les guides principaux :
- `TODO-LANCEMENT.md` - Checklist rapide pour lancer
- `GUIDE-DEPLOIEMENT.md` - Guide complet de déploiement
- `RESUME-REFACTORING.md` - Architecture et modifications

### 2. Configuration

1. **Base de données Supabase**
   ```bash
   # Exécuter les migrations SQL dans l'ordre
   supabase-setup.sql
   supabase-add-personality.sql
   supabase-add-premium-columns.sql
   supabase-add-ab-variant.sql
   ```

2. **Variables d'environnement**
   ```bash
   cp .env.example .env.local
   # Remplir toutes les variables (voir .env.local)
   ```

3. **Installation**
   ```bash
   npm install
   npm run dev
   ```

## 📚 Documentation complète

Tous les guides sont dans le dossier racine :
- `INDEX.md` - Point d'entrée de la documentation
- `TODO-LANCEMENT.md` - Checklist rapide
- `GUIDE-DEPLOIEMENT.md` - Déploiement production
- `CHECKLIST-LANCEMENT.md` - Vérifications détaillées
- `RESUME-REFACTORING.md` - Architecture technique

## 🛠️ Stack technique

- **Framework** : Next.js 14 (App Router)
- **Base de données** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth
- **Storage** : Supabase Storage
- **Paiement** : Stripe Checkout
- **IA** : Claude API (Anthropic)
- **Photos IA** : NanoBanana API
- **Styling** : Tailwind CSS
- **TypeScript** : Strict mode

## 🎯 A/B Testing

L'app teste 2 parcours d'onboarding :
- **Variant A** - Onboarding complet (9 étapes)
- **Variant B** - Onboarding simplifié (8 étapes)

Assignment déterministe basé sur `userId` (50/50).

## 📄 License

Propriétaire - Tous droits réservés

## 🤝 Support

Pour toute question, consulte la documentation dans `INDEX.md`
