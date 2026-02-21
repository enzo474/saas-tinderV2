-- ============================================
-- SCRIPT DE NETTOYAGE (CLEANUP)
-- ============================================
-- À utiliser si vous avez déjà tenté d'exécuter l'ancienne migration
-- et que vous voulez repartir de zéro

-- ATTENTION : Ce script supprime toutes les données des tables !
-- Utilisez-le uniquement en développement ou si vous êtes sûr.

-- ============================================
-- 1. SUPPRIMER LES TABLES
-- ============================================

DROP TABLE IF EXISTS generated_images CASCADE;
DROP TABLE IF EXISTS generated_bios CASCADE;
DROP TABLE IF EXISTS photo_styles CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ============================================
-- 2. SUPPRIMER LES FONCTIONS
-- ============================================

DROP FUNCTION IF EXISTS check_user_credits(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS deduct_credits(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS add_credits(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS update_user_profiles_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_photo_styles_updated_at() CASCADE;

-- ============================================
-- 3. SUPPRIMER LES TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS trigger_photo_styles_updated_at ON photo_styles;

-- ============================================
-- 4. VÉRIFICATION
-- ============================================

-- Vérifier que tout est supprimé
SELECT 'Tables restantes' as type, COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'generated_images', 'generated_bios', 'photo_styles')
UNION ALL
SELECT 'Fonctions restantes', COUNT(*)
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('check_user_credits', 'deduct_credits', 'add_credits', 'create_user_profile', 'update_user_profiles_updated_at', 'update_photo_styles_updated_at');

-- Résultat attendu : 0 pour les deux lignes
