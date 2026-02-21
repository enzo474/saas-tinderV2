#!/bin/bash

# Guide d'installation Supabase CLI
# Ce script t'aide à installer Supabase CLI sur macOS

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║   Installation Supabase CLI pour macOS                          ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "📋 Vérification de l'environnement..."
echo "─────────────────────────────────────────────────────────────────"
echo ""

# Vérifier Homebrew
if command -v brew &> /dev/null; then
    BREW_VERSION=$(brew --version | head -n 1)
    echo -e "${GREEN}✓ Homebrew est installé${NC}"
    echo "  $BREW_VERSION"
    echo ""
    HAS_BREW=true
else
    echo -e "${RED}✗ Homebrew n'est pas installé${NC}"
    echo ""
    HAS_BREW=false
fi

# Vérifier Supabase CLI
if command -v supabase &> /dev/null; then
    SUPABASE_VERSION=$(supabase --version)
    echo -e "${GREEN}✓ Supabase CLI est déjà installé !${NC}"
    echo "  Version: $SUPABASE_VERSION"
    echo ""
    echo "Tu peux directement lancer le déploiement :"
    echo -e "${BLUE}  bash deploy-cleanup-storage.sh${NC}"
    exit 0
else
    echo -e "${RED}✗ Supabase CLI n'est pas installé${NC}"
    echo ""
fi

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║   Instructions d'installation                                    ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

if [ "$HAS_BREW" = true ]; then
    echo -e "${GREEN}🎉 Homebrew est installé ! C'est parfait.${NC}"
    echo ""
    echo "Pour installer Supabase CLI, copie et colle cette commande :"
    echo ""
    echo -e "${BLUE}brew install supabase/tap/supabase${NC}"
    echo ""
    echo "Puis vérifie l'installation avec :"
    echo -e "${BLUE}supabase --version${NC}"
    echo ""
    echo "Ensuite, lance le déploiement :"
    echo -e "${BLUE}bash deploy-cleanup-storage.sh${NC}"
else
    echo -e "${YELLOW}⚠️  Homebrew n'est pas installé.${NC}"
    echo ""
    echo "Option 1 : Installer Homebrew (recommandé)"
    echo "─────────────────────────────────────────────────────────────"
    echo "Copie et colle cette commande :"
    echo ""
    echo -e "${BLUE}/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"${NC}"
    echo ""
    echo "Puis installe Supabase CLI :"
    echo -e "${BLUE}brew install supabase/tap/supabase${NC}"
    echo ""
    echo ""
    echo "Option 2 : Installer via npm"
    echo "─────────────────────────────────────────────────────────────"
    echo "Si tu préfères npm, copie et colle :"
    echo ""
    echo -e "${BLUE}npm install -g supabase${NC}"
    echo ""
    echo "Note: Si tu vois une erreur de permission, utilise :"
    echo -e "${BLUE}sudo npm install -g supabase${NC}"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║   Résumé des étapes                                              ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "1️⃣  Installe Supabase CLI (choisis une méthode ci-dessus)"
echo ""
echo "2️⃣  Vérifie l'installation :"
echo "   supabase --version"
echo ""
echo "3️⃣  Lance le déploiement :"
echo "   bash deploy-cleanup-storage.sh"
echo ""
