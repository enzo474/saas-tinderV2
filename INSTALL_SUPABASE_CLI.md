# 🚀 Installation rapide Supabase CLI

## ⚡ Méthode la plus simple (si tu as Homebrew)

Ouvre ton terminal et copie-colle cette commande :

```bash
brew install supabase/tap/supabase
```

Vérifie que c'est installé :

```bash
supabase --version
```

**C'est tout !** Passe directement au déploiement.

---

## 📦 Si tu n'as pas Homebrew

### Option 1 : Installer Homebrew d'abord (recommandé)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Puis installe Supabase CLI :

```bash
brew install supabase/tap/supabase
```

### Option 2 : Installer via npm

```bash
npm install -g supabase
```

Si tu vois une erreur de permission :

```bash
sudo npm install -g supabase
```

---

## ✅ Vérifier l'installation

```bash
supabase --version
```

Tu devrais voir quelque chose comme : `1.200.3`

---

## 🎯 Prochaine étape : Déploiement

Une fois Supabase CLI installé, lance simplement :

```bash
cd /Users/macenzo/Documents/saas-tinderV2
bash deploy-cleanup-storage.sh
```

Le script va :
1. Te connecter à Supabase
2. Lier ton projet
3. Déployer la fonction cleanup-storage
4. Tester que tout fonctionne

---

## 🆘 Aide rapide

Lance ce script pour vérifier ton environnement :

```bash
bash install-supabase-cli.sh
```

Il va te dire :
- Si Homebrew est installé
- Si Supabase CLI est installé
- Quelle commande utiliser pour installer

---

## 📋 Commandes complètes (copie-colle)

```bash
# 1. Installer Supabase CLI
brew install supabase/tap/supabase

# 2. Vérifier
supabase --version

# 3. Déployer
cd /Users/macenzo/Documents/saas-tinderV2
bash deploy-cleanup-storage.sh
```

---

## 🎉 Après l'installation

Dernière étape : Configure le cron job dans le Dashboard Supabase

1. Va sur : https://supabase.com/dashboard/project/pnmajvnkvyjlkbscwsto/functions
2. Clique sur `cleanup-storage`
3. Onglet "Schedules"
4. Ajoute : `0 * * * *`
5. Sauvegarde

**Et voilà ! Le nettoyage automatique sera actif** ✨
