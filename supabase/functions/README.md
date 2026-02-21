# Supabase Edge Functions - Cleanup Storage

## Description

Edge Function qui nettoie automatiquement les fichiers de plus de 24h dans Supabase Storage pour optimiser les coûts.

## Fichiers concernés

- Photos selfies (uploads)
- Photos Tinder (uploads)  
- Photos sources IA (uploads)
- Photos générées par IA (uploads)

## Configuration

- **TTL**: 24 heures
- **Cron**: Toutes les heures (`0 * * * *`)
- **Bucket**: `uploads`

## Déploiement

### 1. Se connecter à Supabase

```bash
npx supabase login
```

### 2. Lier le projet

```bash
npx supabase link --project-ref pnmajvnkvyjlkbscwsto
```

### 3. Déployer la fonction

```bash
npx supabase functions deploy cleanup-storage
```

### 4. Vérifier le déploiement

```bash
npx supabase functions list
```

## Test manuel

### Via CLI

```bash
npx supabase functions invoke cleanup-storage
```

### Via curl

```bash
curl -X POST https://pnmajvnkvyjlkbscwsto.supabase.co/functions/v1/cleanup-storage \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Configuration du cron job

### Option 1: Automatique (config.toml)

Le fichier `supabase/config.toml` contient déjà la configuration du cron :

```toml
[functions.cleanup-storage.schedule]
cron = "0 * * * *"
```

### Option 2: Manuel (Supabase Dashboard)

1. Aller dans **Edge Functions**
2. Sélectionner `cleanup-storage`
3. Onglet **Schedules**
4. Ajouter cron : `0 * * * *` (toutes les heures)

## Monitoring

Les logs sont disponibles dans :
- **Supabase Dashboard** > Edge Functions > cleanup-storage > Logs

Informations loggées :
- Nombre de dossiers utilisateurs trouvés
- Fichiers supprimés par dossier
- Total de fichiers supprimés
- Date de coupure (cutoffDate)

## Réponse API

### Succès

```json
{
  "success": true,
  "filesDeleted": 42,
  "cutoffDate": "2024-02-15T20:00:00.000Z"
}
```

### Erreur

```json
{
  "error": "Error message"
}
```

## Sécurité

- Utilise `SUPABASE_SERVICE_ROLE_KEY` (accès complet)
- `verify_jwt = false` car appelé par cron (pas d'auth user)
- Bucket ciblé : `uploads` uniquement

## Performance

- Limite : 1000 fichiers par liste
- Suffisant pour l'échelle actuelle
- Si besoin de scaler : implémenter pagination

## Notes

- Le message d'avertissement TTL 24h est déjà présent dans l'UI (`/success`)
- Les URLs en DB ne sont pas nullifiées (optionnel)
- Alternative lifecycle policies S3 non disponible sur Supabase
