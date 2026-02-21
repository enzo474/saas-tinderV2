# Guide d'exécution de la migration SQL corrigée

## ✅ Fichiers modifiés

Les fichiers suivants ont été mis à jour pour utiliser `user_profiles` au lieu de `auth.users` :

1. ✅ `supabase-credits-system-fixed.sql` - Nouvelle migration SQL
2. ✅ `lib/credits.ts` - getUserCredits() utilise user_profiles
3. ✅ `app/admin/photo-styles/page.tsx` - Vérification role admin
4. ✅ `app/api/admin/photo-styles/route.ts` - 2 vérifications admin
5. ✅ `app/api/admin/photo-styles/[id]/route.ts` - 3 vérifications admin

## 📋 Étapes d'exécution

### 1. Nettoyer les objets partiellement créés (optionnel)

Si vous avez déjà tenté d'exécuter l'ancienne migration, nettoyez d'abord :

```sql
-- Dans Supabase SQL Editor
DROP TABLE IF EXISTS generated_images CASCADE;
DROP TABLE IF EXISTS generated_bios CASCADE;
DROP FUNCTION IF EXISTS check_user_credits(UUID, INTEGER);
DROP FUNCTION IF EXISTS deduct_credits(UUID, INTEGER);
DROP FUNCTION IF EXISTS add_credits(UUID, INTEGER);
```

### 2. Exécuter la migration corrigée

1. Ouvrir le fichier `supabase-credits-system-fixed.sql`
2. Copier **tout le contenu** (305 lignes)
3. Aller dans Supabase Dashboard → SQL Editor
4. Coller et cliquer sur **Run**

### 3. Vérifier que tout est créé

Exécuter ces requêtes pour vérifier :

```sql
-- Vérifier les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'generated_images', 'generated_bios', 'photo_styles')
ORDER BY table_name;
```

**Résultat attendu** : 4 tables

```sql
-- Vérifier les styles
SELECT photo_number, COUNT(*) as nb_styles 
FROM photo_styles 
GROUP BY photo_number 
ORDER BY photo_number;
```

**Résultat attendu** :
- Photo 1 : 3 styles
- Photo 2 : 4 styles
- Photo 3, 4, 5 : 1 style chacune

### 4. Créer un profil pour votre compte

Le trigger `on_auth_user_created` créera automatiquement un profil pour les **nouveaux** utilisateurs. Pour les utilisateurs existants, il faut créer manuellement :

```sql
-- Remplacer par votre email
INSERT INTO user_profiles (id, credits, role)
SELECT id, 0, 'user'
FROM auth.users
WHERE email = 'enzo.ambrosiano38920@gmail.com'
ON CONFLICT (id) DO NOTHING;
```

### 5. Définir votre compte comme admin

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'enzo.ambrosiano38920@gmail.com');
```

### 6. Ajouter des crédits de test

```sql
SELECT add_credits(
  (SELECT id FROM auth.users WHERE email = 'enzo.ambrosiano38920@gmail.com')::uuid, 
  130
);
```

### 7. Vérifier votre profil

```sql
SELECT u.email, p.credits, p.role, p.created_at
FROM auth.users u
JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'enzo.ambrosiano38920@gmail.com';
```

**Résultat attendu** :
- email : `enzo.ambrosiano38920@gmail.com`
- credits : `130`
- role : `admin`

## 🧪 Tester l'application

### 1. Démarrer le serveur

```bash
npm run dev
```

### 2. Tester l'affichage des crédits

1. Se connecter sur `http://localhost:3000/auth`
2. Aller sur `http://localhost:3000/dashboard/home`
3. Vérifier que le header affiche **130 crédits**

### 3. Tester le panel admin

1. Aller sur `http://localhost:3000/admin/photo-styles`
2. Vérifier que vous voyez 8 styles au total
3. Tester le bouton "Modifier" sur un style

### 4. Tester le générateur de bio

1. Aller sur `http://localhost:3000/dashboard/bio`
2. Remplir le formulaire et générer une bio
3. Vérifier que les crédits passent de 130 à 128

## 🔍 Différences clés entre l'ancienne et la nouvelle migration

| Aspect | Ancienne version | Nouvelle version ✅ |
|--------|------------------|---------------------|
| Stockage credits | `auth.users.credits` | `user_profiles.credits` |
| Stockage role | `auth.users.role` | `user_profiles.role` |
| Permissions | ❌ Erreur 42501 | ✅ Fonctionne |
| Trigger auto-creation | ❌ Non | ✅ Oui (nouveaux users) |
| Séparation concerns | ❌ Auth + métier mélangés | ✅ Séparation claire |

## ⚠️ Points importants

1. **Utilisateurs existants** : Doivent avoir un profil créé manuellement (étape 4)
2. **Nouveaux utilisateurs** : Profil créé automatiquement par le trigger
3. **RLS policies** : Les policies sur `photo_styles` référencent maintenant `user_profiles`
4. **Fonctions PostgreSQL** : Toutes mises à jour pour utiliser `user_profiles`

## 🎯 Prochaines étapes

Une fois la migration exécutée avec succès :

1. ✅ Configurer les variables d'environnement (`.env.local`)
   - `NANOBANANA_API_KEY`
   - `STRIPE_PRICE_CREDITS_50`
   - `STRIPE_PRICE_CREDITS_100`

2. ✅ Créer les produits Stripe
   - Plan initial 9,90€
   - Pack 50 crédits 5,00€
   - Pack 100 crédits 8,90€

3. ✅ Tester le flow complet end-to-end

Voir `IMPLEMENTATION_COMPLETE.md` pour les détails.

## 🆘 Troubleshooting

### Erreur "user_profiles does not exist"

La table n'a pas été créée. Vérifier que vous avez bien exécuté la migration complète.

### Aucun profil trouvé pour mon compte

Exécuter l'étape 4 pour créer manuellement le profil.

### Panel admin inaccessible (403)

Vérifier que votre rôle est bien "admin" :

```sql
SELECT u.email, p.role 
FROM auth.users u 
JOIN user_profiles p ON u.id = p.id 
WHERE u.email = 'votre@email.com';
```

### Les crédits ne s'affichent pas

Vérifier que le profil existe et a des crédits :

```sql
SELECT * FROM user_profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'votre@email.com');
```

---

**✅ Correction complétée !** La migration est maintenant compatible avec les restrictions de Supabase sur `auth.users`.
