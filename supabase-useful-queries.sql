-- ============================================
-- REQUÊTES UTILES POUR LA GESTION
-- ============================================
-- Collection de requêtes SQL pratiques pour gérer l'application

-- ============================================
-- GESTION DES UTILISATEURS
-- ============================================

-- Voir tous les utilisateurs avec leurs crédits et rôle
SELECT 
  u.email,
  p.credits,
  p.role,
  p.created_at as profile_created,
  u.created_at as user_created
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 20;

-- Utilisateurs sans profil (à corriger)
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Créer des profils pour les utilisateurs existants
INSERT INTO user_profiles (id, credits, role)
SELECT id, 0, 'user'
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles);

-- Promouvoir un utilisateur en admin
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'EMAIL_ICI');

-- Rétrograder un admin en user
UPDATE user_profiles 
SET role = 'user' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'EMAIL_ICI');

-- ============================================
-- GESTION DES CRÉDITS
-- ============================================

-- Voir les utilisateurs avec le plus de crédits
SELECT u.email, p.credits, p.role
FROM user_profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.credits DESC
LIMIT 10;

-- Voir les utilisateurs sans crédits
SELECT u.email, p.credits, p.role
FROM user_profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.credits = 0
ORDER BY p.created_at DESC;

-- Ajouter des crédits à un utilisateur spécifique
SELECT add_credits(
  (SELECT id FROM auth.users WHERE email = 'EMAIL_ICI')::uuid,
  100  -- Montant de crédits à ajouter
);

-- Ajouter des crédits à tous les utilisateurs (promotion)
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM user_profiles
  LOOP
    PERFORM add_credits(user_record.id::uuid, 50);
  END LOOP;
END $$;

-- Réinitialiser les crédits d'un utilisateur
UPDATE user_profiles 
SET credits = 130 
WHERE id = (SELECT id FROM auth.users WHERE email = 'EMAIL_ICI');

-- ============================================
-- STATISTIQUES
-- ============================================

-- Nombre total d'utilisateurs
SELECT COUNT(*) as total_users FROM user_profiles;

-- Nombre d'admins
SELECT COUNT(*) as total_admins FROM user_profiles WHERE role = 'admin';

-- Crédits totaux en circulation
SELECT SUM(credits) as total_credits FROM user_profiles;

-- Moyenne de crédits par utilisateur
SELECT AVG(credits)::INTEGER as avg_credits FROM user_profiles;

-- ============================================
-- IMAGES GÉNÉRÉES
-- ============================================

-- Voir les images générées récemment
SELECT 
  u.email,
  gi.photo_number,
  gi.generation_type,
  gi.created_at,
  LEFT(gi.image_url, 50) as url_preview
FROM generated_images gi
JOIN auth.users u ON gi.user_id = u.id
ORDER BY gi.created_at DESC
LIMIT 20;

-- Nombre d'images par utilisateur
SELECT 
  u.email,
  COUNT(*) as nb_images,
  COUNT(*) * 10 as credits_depenses
FROM generated_images gi
JOIN auth.users u ON gi.user_id = u.id
GROUP BY u.email
ORDER BY nb_images DESC;

-- Images par type
SELECT 
  generation_type,
  COUNT(*) as count
FROM generated_images
GROUP BY generation_type;

-- Supprimer toutes les images d'un utilisateur
DELETE FROM generated_images 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'EMAIL_ICI');

-- ============================================
-- BIOS GÉNÉRÉES
-- ============================================

-- Voir les bios générées récemment
SELECT 
  u.email,
  gb.tone,
  LEFT(gb.bio_text, 100) as bio_preview,
  gb.created_at
FROM generated_bios gb
JOIN auth.users u ON gb.user_id = u.id
ORDER BY gb.created_at DESC
LIMIT 20;

-- Nombre de bios par utilisateur
SELECT 
  u.email,
  COUNT(*) as nb_bios,
  COUNT(*) * 2 as credits_depenses
FROM generated_bios gb
JOIN auth.users u ON gb.user_id = u.id
GROUP BY u.email
ORDER BY nb_bios DESC;

-- Bios par ton
SELECT 
  tone,
  COUNT(*) as count
FROM generated_bios
GROUP BY tone
ORDER BY count DESC;

-- ============================================
-- STYLES DE PHOTOS
-- ============================================

-- Voir tous les styles actifs
SELECT 
  photo_number,
  style_name,
  is_active,
  display_order
FROM photo_styles
WHERE is_active = true
ORDER BY photo_number, display_order;

-- Nombre de styles par photo
SELECT 
  photo_number,
  COUNT(*) as nb_styles,
  COUNT(*) FILTER (WHERE is_active) as nb_actifs
FROM photo_styles
GROUP BY photo_number
ORDER BY photo_number;

-- Activer tous les styles
UPDATE photo_styles SET is_active = true;

-- Désactiver un style spécifique
UPDATE photo_styles 
SET is_active = false 
WHERE style_name = 'NOM_DU_STYLE';

-- Réorganiser l'ordre des styles pour une photo
UPDATE photo_styles SET display_order = 1 WHERE id = 'UUID_STYLE_1';
UPDATE photo_styles SET display_order = 2 WHERE id = 'UUID_STYLE_2';
UPDATE photo_styles SET display_order = 3 WHERE id = 'UUID_STYLE_3';

-- ============================================
-- ANALYSES
-- ============================================

-- Utilisateurs ayant payé
SELECT 
  u.email,
  a.paid_at,
  a.status,
  p.credits
FROM analyses a
JOIN auth.users u ON a.user_id = u.id
JOIN user_profiles p ON u.id = p.id
WHERE a.paid_at IS NOT NULL
ORDER BY a.paid_at DESC;

-- Utilisateurs avec analyse mais n'ayant pas payé
SELECT 
  u.email,
  a.status,
  a.created_at
FROM analyses a
JOIN auth.users u ON a.user_id = u.id
WHERE a.paid_at IS NULL
ORDER BY a.created_at DESC;

-- ============================================
-- NETTOYAGE / MAINTENANCE
-- ============================================

-- Supprimer les analyses non payées de plus de 30 jours
DELETE FROM analyses 
WHERE paid_at IS NULL 
AND created_at < NOW() - INTERVAL '30 days';

-- Supprimer les images orphelines (sans user)
DELETE FROM generated_images 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Supprimer les bios orphelines (sans user)
DELETE FROM generated_bios 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Vacuum des tables (optimisation)
VACUUM ANALYZE user_profiles;
VACUUM ANALYZE generated_images;
VACUUM ANALYZE generated_bios;
VACUUM ANALYZE photo_styles;

-- ============================================
-- DEBUGGING
-- ============================================

-- Vérifier les RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Vérifier les triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- Tester les fonctions de crédits
SELECT check_user_credits(
  (SELECT id FROM auth.users WHERE email = 'EMAIL_ICI')::uuid,
  50
) as has_enough_credits;

SELECT deduct_credits(
  (SELECT id FROM auth.users WHERE email = 'EMAIL_ICI')::uuid,
  10
) as deduction_success;
