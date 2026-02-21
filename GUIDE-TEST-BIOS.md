# Guide de Test - Génération de Bios Multiples

## Modifications apportées

Le système génère maintenant **4 bios différentes** au lieu d'une seule, permettant à l'utilisateur de tester différentes accroches et de choisir celle qui fonctionne le mieux.

## Structure des bios générées

Chaque bio comprend :
- **text** : La bio complète (max 25 mots, 2 lignes)
- **type** : Le type utilisé (Absurde, Tension, Mystère, Direct)
- **why** : Explication courte de pourquoi ce type correspond à la personnalité

## Les 4 types de bios

1. **TYPE ABSURDE** - Humour décalé
   - Exemple : "Je cuisine comme un chef. Un chef de chantier"
   
2. **TYPE TENSION** - Taquinerie légère
   - Exemple : "Je ne suis pas pour toi si Friends c'est pas ta came"
   
3. **TYPE MYSTÈRE** - Intrigue immédiate
   - Exemple : "3 secrets : un vrai, deux faux. À toi de deviner"
   
4. **TYPE DIRECT** - Confiance assumée
   - Exemple : "Mode d'emploi : 1 café, 2 rires, 0 prise de tête"

## Comment tester

1. **Réinitialiser l'onboarding** :
```javascript
fetch('/api/analysis/reset-all', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}).then(res => res.json()).then(data => {
  console.log(data)
  window.location.href = '/onboarding/intro'
})
```

2. **Refaire tout le flow** avec de vraies informations

3. **À l'étape 5** : Remplir le champ personnalité avec une description complète (300 caractères)
   - Exemple : "Je suis plutôt sarcastique, j'aime l'humour noir et je me prends jamais au sérieux. Direct dans mes propos mais toujours respectueux. Un peu geek sur les bords, fan de tech et de débats absurdes."

4. **Payer** (code promo ou bypass admin)

5. **Vérifier les 4 bios** générées sur `/success`
   - Chaque bio doit être différente
   - Chaque bio doit avoir un type différent
   - Toutes doivent être ultra-courtes (max 2 lignes)
   - Chaque bio doit avoir un bouton "Copier cette bio"

## Avantages

- L'utilisateur peut **tester différentes accroches** sur Tinder
- Il peut voir **quelle approche génère le plus de matchs**
- Il a le **choix** plutôt qu'une seule option imposée
- Les 4 bios sont **toutes adaptées à sa personnalité** mais avec des angles différents

## Format JSON attendu

```json
{
  "diagnostic": "string",
  "photos_order_recommendation": "string",
  "optimized_bios": [
    {
      "text": "Bio ultra-courte max 25 mots",
      "type": "Absurde",
      "why": "Explication courte"
    },
    {
      "text": "Bio ultra-courte max 25 mots",
      "type": "Tension",
      "why": "Explication courte"
    },
    {
      "text": "Bio ultra-courte max 25 mots",
      "type": "Mystère",
      "why": "Explication courte"
    },
    {
      "text": "Bio ultra-courte max 25 mots",
      "type": "Direct",
      "why": "Explication courte"
    }
  ],
  "match_projection": {
    "current_weekly": 2,
    "projected_weekly": 8,
    "explanation": "string"
  },
  "signature_positioning": "string"
}
```

## Commande pour reset le plan (si besoin)

```javascript
fetch('/api/analysis/reset-plan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ analysisId: 'TON_ANALYSIS_ID' })
}).then(res => res.json()).then(data => console.log(data))
```
