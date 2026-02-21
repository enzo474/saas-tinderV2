# ✅ Correction du problème de migration SQL

## 🔍 Problème identifié

L'erreur `ERROR: 42501: must be owner of table users` était causée par une tentative de modification directe de la table `auth.users` dans Supabase, qui est une table système protégée.

## ✨ Solution implémentée

Création d'une table séparée `user_profiles` pour stocker les crédits et le rôle utilisateur, avec une relation 1:1 avec `auth.users`.

### Architecture

```
auth.users (Supabase Auth)
    ↓ 1:1
user_profiles (Notre table)
    ├── id (UUID, FK → auth.users.id)
    ├── credits (INTEGER)
    ├── role (TEXT: 'user' | 'admin')
    ├── created_at
    └── updated_at
```

## 📦 Fichiers créés/modifiés

### Nouveaux fichiers SQL

1. **`supabase-credits-system-fixed.sql`** ✅
   - Migration complète et corrigée
   - Table `user_profiles` au lieu de colonnes dans `auth.users`
   - Trigger automatique pour créer un profil à chaque nouvel utilisateur
   - 305 lignes, prêt à exécuter

2. **`supabase-cleanup.sql`** ✅
   - Script pour nettoyer la base si besoin
   - Supprime toutes les tables, fonctions et triggers
   - À utiliser uniquement si vous voulez recommencer à zéro

3. **`supabase-useful-queries.sql`** ✅
   - Collection de 50+ requêtes utiles
   - Gestion utilisateurs, crédits, images, bios, styles
   - Statistiques, debugging, maintenance

### Fichiers TypeScript modifiés

1. **`lib/credits.ts`** ✅
   - `getUserCredits()` : `auth.users` → `user_profiles`

2. **`app/admin/photo-styles/page.tsx`** ✅
   - Vérification role admin via `user_profiles`

3. **`app/api/admin/photo-styles/route.ts`** ✅
   - 2 vérifications admin mises à jour

4. **`app/api/admin/photo-styles/[id]/route.ts`** ✅
   - 3 vérifications admin mises à jour (PUT, PATCH, DELETE)

### Documentation

1. **`MIGRATION_FIXED_GUIDE.md`** ✅
   - Guide complet étape par étape
   - Commandes SQL à exécuter
   - Tests à effectuer
   - Troubleshooting

## 🚀 Marche à suivre

### Étape 1 : Nettoyer (optionnel)

Si vous avez déjà tenté la migration, exécutez dans Supabase SQL Editor :

```sql
-- Copier-coller le contenu de supabase-cleanup.sql
```

### Étape 2 : Exécuter la migration corrigée

1. Ouvrir `supabase-credits-system-fixed.sql`
2. Copier tout le contenu
3. Supabase Dashboard → SQL Editor → Coller → Run

### Étape 3 : Créer votre profil admin

```sql
-- Créer le profil (utilisateurs existants)
INSERT INTO user_profiles (id, credits, role)
SELECT id, 0, 'user'
FROM auth.users
WHERE email = 'enzo.ambrosiano38920@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Le définir comme admin
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'enzo.ambrosiano38920@gmail.com');

-- Ajouter 130 crédits
SELECT add_credits(
  (SELECT id FROM auth.users WHERE email = 'enzo.ambrosiano38920@gmail.com')::uuid, 
  130
);
```

### Étape 4 : Vérifier

```sql
SELECT u.email, p.credits, p.role, p.created_at
FROM auth.users u
JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'enzo.ambrosiano38920@gmail.com';
```

**Résultat attendu :**
- email : `enzo.ambrosiano38920@gmail.com`
- credits : `130`
- role : `admin`

### Étape 5 : Tester l'application

```bash
npm run dev
```

1. **Dashboard** : `http://localhost:3000/dashboard/home`
   - Vérifier : Header affiche 130 crédits

2. **Panel Admin** : `http://localhost:3000/admin/photo-styles`
   - Vérifier : Vous voyez 8 styles (3+4+1+1+1)
   - Tester : Modifier un style

3. **Générateur Bio** : `http://localhost:3000/dashboard/bio`
   - Générer une bio
   - Vérifier : Crédits passent de 130 → 128

## ✨ Avantages de la nouvelle architecture

| Aspect | Avant (❌) | Maintenant (✅) |
|--------|-----------|-----------------|
| Permissions | Erreur 42501 | Fonctionne |
| Séparation | Auth + métier mélangés | Tables séparées |
| Migrations futures | Impossible | Facile |
| Nouveau user | Rien | Profil auto-créé |
| Maintenance | Difficile | Queries pratiques |

## 📊 Ce qui a été créé

### Tables (4)
- `user_profiles` - Crédits et rôles
- `generated_images` - Historique images IA
- `generated_bios` - Historique bios
- `photo_styles` - Styles administrables

### Fonctions PostgreSQL (6)
- `check_user_credits()` - Vérifier crédits
- `deduct_credits()` - Décompter (atomique)
- `add_credits()` - Ajouter (avec upsert)
- `create_user_profile()` - Trigger création
- `update_user_profiles_updated_at()` - Trigger MAJ
- `update_photo_styles_updated_at()` - Trigger MAJ

### RLS Policies (6)
- Users : Lire leur profil
- Users : MAJ leur profil
- Users : Lire leurs images
- Service : Insérer images
- Users : Lire leurs bios
- Service : Insérer bios

### Seed Data (8 styles)
- Photo 1 : 3 styles
- Photo 2 : 4 styles
- Photos 3, 4, 5 : 1 style chacune

## 🔗 Prochaines étapes

Une fois la migration exécutée :

1. ✅ **Configurer NanoBanana**
   - Obtenir clé API
   - Ajouter dans `.env.local`

2. ✅ **Créer produits Stripe**
   - Plan initial 9,90€ (130 crédits)
   - Pack 50 crédits (5,00€)
   - Pack 100 crédits (8,90€)

3. ✅ **Tester flow complet**
   - Inscription → Paiement → Dashboard
   - Génération photos (50 crédits)
   - Génération bio (2 crédits)
   - Recharge crédits

Voir `IMPLEMENTATION_COMPLETE.md` pour tous les détails.

## 📚 Documentation disponible

| Fichier | Contenu |
|---------|---------|
| `MIGRATION_FIXED_GUIDE.md` | Guide d'exécution détaillé |
| `supabase-credits-system-fixed.sql` | Migration corrigée (305 lignes) |
| `supabase-cleanup.sql` | Script de nettoyage |
| `supabase-useful-queries.sql` | 50+ requêtes utiles |
| `IMPLEMENTATION_COMPLETE.md` | État complet du projet |

## 🆘 Support

En cas de problème, consulter :

1. **`MIGRATION_FIXED_GUIDE.md`** → Section Troubleshooting
2. **`supabase-useful-queries.sql`** → Requêtes de debugging
3. Les logs de l'application (`npm run dev`)
4. La console Supabase (Database → Logs)

---

**✅ La correction est complète et prête à être exécutée !**

Tous les fichiers ont été créés/modifiés. Il ne reste plus qu'à exécuter la migration SQL dans Supabase Dashboard.
