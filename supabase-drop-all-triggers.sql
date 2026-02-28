-- ============================================================
-- SOLUTION DÉFINITIVE : Supprimer tous les triggers auth.users
-- Les profils sont créés directement dans le code Next.js
-- À exécuter dans Supabase → SQL Editor
-- ============================================================

-- Supprimer tous les triggers sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_profile ON auth.users;
DROP TRIGGER IF EXISTS new_user_profile ON auth.users;

-- Vérifier qu'il ne reste plus aucun trigger (résultat doit être vide)
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';
