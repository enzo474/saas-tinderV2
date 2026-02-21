# 🚀 Guide Rapide - Panel Admin

## 📍 Vous êtes ici

Toutes les fonctionnalités pour le panel admin ont été implémentées. Voici comment les utiliser :

---

## ⚡ Démarrage en 3 Étapes

### 1️⃣ Créer votre profil admin

**Dans Supabase SQL Editor :**

```sql
-- Copier/coller ce code et l'exécuter

INSERT INTO user_profiles (id, credits, role)
SELECT id, 999999, 'admin'
FROM auth.users
WHERE email = 'enzo.ambrosiano38920@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  credits = 999999;

-- Vérifier que ça a marché
SELECT u.email, p.role, p.credits
FROM auth.users u
JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'enzo.ambrosiano38920@gmail.com';
```

✅ **Résultat attendu :**
- role: `admin`
- credits: `999999`

---

### 2️⃣ Se connecter

Connectez-vous avec : `enzo.ambrosiano38920@gmail.com`

---

### 3️⃣ Accéder au panel admin

**Deux options :**

1. **Via la sidebar :** Cliquez sur "Admin Panel" 🛡️ (tout en bas)
2. **Via l'URL :** Allez sur `/admin`

---

## 🎯 Fonctionnalités Disponibles

### ♾️ Crédits Illimités

**Où le voir :**
- Header dashboard : affiche "∞ illimités"

**Ce que ça fait :**
- Vous pouvez générer autant d'images et de bios que vous voulez
- Les crédits ne diminuent jamais
- Pas de limite

---

### 🔄 Reset Onboarding Complet

**Où :** Page `/admin` → Bouton orange "Reset Onboarding Complet"

**Ce que ça fait :**
- Supprime toutes vos analyses
- Vous ramène au début (`/onboarding/intro`)
- Permet de refaire tout le parcours

**Quand l'utiliser :**
- Tester les modifications de l'onboarding
- Vérifier le flow complet
- Simuler un nouvel utilisateur

---

### 🗑️ Reset Génération Photos

**Où :** Page `/admin` → Bouton bleu "Reset Génération Photos"

**Ce que ça fait :**
- Réinitialise uniquement le flag de génération
- Vous pouvez régénérer 5 nouvelles photos
- Sans refaire tout l'onboarding

**Quand l'utiliser :**
- Tester uniquement la génération de photos
- Vérifier différents styles
- Tester NanoBanana API

---

### ⚙️ Gérer Styles Photos

**Où :** Page `/admin` → Bouton violet "Gérer les Styles de Photos"

**Ce que ça fait :**
- Accès au CRUD complet des styles
- Créer, modifier, supprimer des styles
- Gérer les prompts et les previews

---

## 📍 Navigation

```
/admin                    ← Panel admin principal
/admin/photo-styles       ← Gestion des styles
/dashboard/home           ← Dashboard principal
/dashboard/image          ← Générateur d'images
/dashboard/bio            ← Générateur de bios
/success                  ← Plan d'optimisation (avec génération photos)
/onboarding/intro         ← Début de l'onboarding
```

---

## 🎨 Ce que vous verrez

### Header (avec crédits illimités)
```
┌──────────────────────────────┐
│ ∞  ∞  illimités              │
└──────────────────────────────┘
```

### Sidebar (avec lien admin)
```
┌──────────────────────┐
│ 🏠 Accueil           │
│ 👁️ Rendu Profil      │
│ 🎨 Générateur Images │
│ ✍️ Générateur Bio    │
│ ✨ Accroche [Bientôt]│
├──────────────────────┤
│ 🛡️ Admin Panel    ✨ │  ← Nouveau !
└──────────────────────┘
```

### Page Admin
```
Panel Admin - Outils de Test
════════════════════════════

┌─ Statut Administrateur ────┐
│ Email: enzo...@gmail.com   │
│ Rôle: [ADMIN]              │
│ Crédits: ∞ Illimités       │
│ Onboarding: ✓ Complété     │
│ Photos: ✓ Générées         │
└────────────────────────────┘

┌─ Outils de Test Rapide ────┐
│ [🔄 Reset Onboarding]      │
│ [🗑️ Reset Photos]          │
│ [⚙️ Gérer Styles]          │
└────────────────────────────┘
```

---

## 🧪 Scénarios de Test

### Test A : Onboarding complet

```
1. /admin → "Reset Onboarding"
2. Refaire tout l'onboarding
3. Vérifier chaque étape
4. Générer les 5 photos (crédits non déduits)
5. Vérifier le résultat sur /success
```

### Test B : Génération photos uniquement

```
1. /admin → "Reset Génération Photos"
2. Aller sur /success
3. Cliquer "Générer mes 5 photos IA"
4. Tester différents styles
5. Vérifier que les crédits restent "∞"
```

### Test C : Dashboard créateur

```
1. Aller sur /dashboard/image
2. Générer 10 images différentes
3. Aller sur /dashboard/bio
4. Générer 10 bios différentes
5. Aller sur /dashboard/home
6. Vérifier que tout est sauvegardé
7. Constater que les crédits sont toujours "∞"
```

---

## 🐛 Dépannage

### ❌ "Accès refusé - Admin uniquement"

**Problème :** Votre compte n'est pas admin

**Solution :**
1. Vérifier que le SQL a été exécuté
2. Vérifier dans Supabase que `user_profiles.role = 'admin'`
3. Se déconnecter et se reconnecter

---

### ❌ Les crédits diminuent quand même

**Problème :** Le bypass ne fonctionne pas

**Solution :**
1. Vérifier que `user_profiles.role = 'admin'` (pas 'Admin' ou 'ADMIN')
2. Vérifier dans la console browser si des erreurs s'affichent
3. Recharger la page (F5)

---

### ❌ Le lien "Admin Panel" n'apparaît pas

**Problème :** La sidebar ne détecte pas le statut admin

**Solution :**
1. Vérifier que `user_profiles.role = 'admin'`
2. Se déconnecter et se reconnecter
3. Vider le cache navigateur

---

## 📚 Documentation Complète

Pour plus de détails :

- `ADMIN_PANEL_COMPLETE.md` : Documentation complète avec captures d'écran
- `IMPLEMENTATION_SUMMARY.md` : Résumé technique détaillé
- `README_ADMIN_IMPLEMENTATION.md` : Vue d'ensemble de l'implémentation

---

## ✅ Checklist Avant de Commencer

- [ ] Script SQL exécuté dans Supabase
- [ ] Vérification du rôle admin dans la base de données
- [ ] Connexion avec le bon email
- [ ] Accès à `/admin` fonctionne
- [ ] "∞ illimités" s'affiche dans le header
- [ ] Lien "Admin Panel" visible dans la sidebar

---

## 🎉 C'est Tout !

Vous êtes maintenant prêt à tester toutes les fonctionnalités de DatingBoost **sans limite** !

**Bon testing ! 🚀**

---

**Note :** Si vous avez des questions ou rencontrez un problème, vérifiez d'abord la section "Dépannage" ci-dessus.
