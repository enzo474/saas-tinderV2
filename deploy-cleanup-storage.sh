#!/bin/bash

# Script de déploiement Supabase Edge Function - cleanup-storage
# À exécuter dans le terminal : bash deploy-cleanup-storage.sh

set -e  # Arrêter en cas d'erreur

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║   Déploiement Edge Function cleanup-storage                     ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
PROJECT_REF="pnmajvnkvyjlkbscwsto"

echo "📦 Étape 1/6 : Vérification de Supabase CLI"
echo "─────────────────────────────────────────────────────────────────"

if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI n'est pas installé${NC}"
    echo ""
    echo "Choisis une méthode d'installation :"
    echo "  1) Via Homebrew (recommandé sur macOS)"
    echo "     brew install supabase/tap/supabase"
    echo ""
    echo "  2) Via npm"
    echo "     npm install -g supabase"
    echo ""
    echo "Puis relance ce script."
    exit 1
else
    VERSION=$(supabase --version)
    echo -e "${GREEN}✅ Supabase CLI installé : $VERSION${NC}"
fi

echo ""
echo "🔐 Étape 2/6 : Connexion à Supabase"
echo "─────────────────────────────────────────────────────────────────"
echo "Un navigateur va s'ouvrir pour te connecter..."
supabase login

echo ""
echo "🔗 Étape 3/6 : Liaison avec le projet"
echo "─────────────────────────────────────────────────────────────────"
echo "Project ref: $PROJECT_REF"
supabase link --project-ref $PROJECT_REF

echo ""
echo "📁 Étape 4/6 : Vérification des fichiers"
echo "─────────────────────────────────────────────────────────────────"

if [ ! -f "supabase/functions/cleanup-storage/index.ts" ]; then
    echo -e "${RED}❌ Fichier index.ts manquant${NC}"
    exit 1
fi

if [ ! -f "supabase/functions/cleanup-storage/deno.json" ]; then
    echo -e "${RED}❌ Fichier deno.json manquant${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Tous les fichiers sont présents${NC}"

echo ""
echo "🚀 Étape 5/6 : Déploiement de la fonction"
echo "─────────────────────────────────────────────────────────────────"
supabase functions deploy cleanup-storage

echo ""
echo "🧪 Étape 6/6 : Test de la fonction"
echo "─────────────────────────────────────────────────────────────────"
echo "Test de la fonction cleanup-storage..."
supabase functions invoke cleanup-storage

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║   ✅ DÉPLOIEMENT TERMINÉ                                        ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Prochaines étapes :"
echo "  1. Configure le cron job dans le Dashboard Supabase :"
echo "     https://supabase.com/dashboard/project/$PROJECT_REF/functions"
echo ""
echo "  2. Ajoute un schedule :"
echo "     - Onglet 'Schedules'"
echo "     - Cron : 0 * * * * (toutes les heures)"
echo "     - Timezone : UTC"
echo ""
echo "  3. Vérifie les logs :"
echo "     - Onglet 'Logs' dans la fonction cleanup-storage"
echo ""
