# ✅ FIX - Erreur "next/headers" dans composants client

## Problème

**Erreur :** `You're importing a component that needs "next/headers". That only works in a Server Component`

**Cause :** Le fichier `lib/credits.ts` importait `createClient` et `createServiceRoleClient` qui utilisent `cookies()` de `next/headers`. Ce fichier était ensuite importé dans des composants client, ce qui causait l'erreur.

## Solution Appliquée

J'ai séparé le fichier `lib/credits.ts` en deux :

### 1. `lib/credits.ts` (CONSTANTES UNIQUEMENT - safe pour client et serveur)

```typescript
export const CREDIT_COSTS = { ... }
export const CREDIT_PACKS = { ... }
export function calculateImageGenerationCost(imageCount: number): number
export function formatCredits(credits: number): string
```

**Usage :** Peut être importé n'importe où (client ou serveur)

### 2. `lib/credits-server.ts` (FONCTIONS SERVEUR UNIQUEMENT)

```typescript
export async function isUserAdmin(userId: string): Promise<boolean>
export async function getUserCredits(userId: string): Promise<number>
export async function checkCredits(userId: string, cost: number): Promise<boolean>
export async function deductCredits(userId: string, cost: number): Promise<boolean>
export async function addCredits(userId: string, amount: number): Promise<void>
export async function requireAndDeductCredits(userId: string, cost: number): Promise<void>
```

**Usage :** Uniquement dans les API routes et Server Components

## Fichiers Modifiés (9)

1. ✅ `lib/credits.ts` - Conserve uniquement les constantes et fonctions pures
2. ✅ `lib/credits-server.ts` - Nouveau fichier avec toutes les fonctions serveur
3. ✅ `app/api/generate-custom-images/route.ts` - Import mis à jour
4. ✅ `app/dashboard/layout.tsx` - Import mis à jour
5. ✅ `app/api/user/credits/route.ts` - Import mis à jour
6. ✅ `app/api/stripe/webhook/route.ts` - Import mis à jour
7. ✅ `app/api/admin/reset-onboarding/route.ts` - Import mis à jour
8. ✅ `app/api/admin/reset-photo-generation/route.ts` - Import mis à jour
9. ✅ `app/api/generate-bio/route.ts` - Import mis à jour
10. ✅ `app/dashboard/bio/page.tsx` - Import mis à jour
11. ✅ `app/api/generate-photos/route.ts` - Import mis à jour

## Règle à Retenir

```typescript
// ❌ MAUVAIS - Dans un composant client
'use client'
import { getUserCredits } from '@/lib/credits' // Erreur !

// ✅ BON - Dans un composant client
'use client'
import { CREDIT_COSTS } from '@/lib/credits' // OK (constante)

// ✅ BON - Dans une API route ou Server Component
import { getUserCredits } from '@/lib/credits-server' // OK
import { CREDIT_COSTS } from '@/lib/credits' // OK
```

## Vérification

- ✅ 0 erreur de linting
- ✅ Séparation claire client/serveur
- ✅ Tous les imports mis à jour

## Résultat

L'erreur est maintenant **corrigée** et votre interface devrait se charger correctement ! 🎉

Redémarrez votre serveur dev si nécessaire :
```bash
Ctrl+C
npm run dev
```
