-- ============================================
-- CRÉER UN PROFIL ADMIN
-- ============================================
-- À exécuter dans Supabase SQL Editor
-- Remplacer 'votre@email.com' par votre email réel

-- 1. Créer le profil s'il n'existe pas (ou mettre à jour si existe)
INSERT INTO user_profiles (id, credits, role)
SELECT id, 999999, 'admin'  -- 999999 = crédits illimités symboliques
FROM auth.users
WHERE email = 'enzo.ambrosiano38920@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  credits = 999999;

-- 2. Vérifier que tout est correct
SELECT u.email, p.role, p.credits, p.created_at
FROM auth.users u
JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'enzo.ambrosiano38920@gmail.com';

-- Résultat attendu:
-- email: enzo.ambrosiano38920@gmail.com
-- role: admin
-- credits: 999999
