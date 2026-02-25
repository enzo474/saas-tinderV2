-- ============================================================
-- FIX : Triggers "Database error saving new user"
-- À exécuter dans Supabase → SQL Editor
-- ============================================================

-- 1. Recréer create_user_profile() avec gestion d'erreur
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.user_profiles (id, credits, role)
    VALUES (NEW.id, 0, 'user')
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Ne jamais bloquer la création de l'utilisateur
    NULL;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recréer initialize_user_progression() avec gestion d'erreur
CREATE OR REPLACE FUNCTION initialize_user_progression()
RETURNS TRIGGER AS $$
DECLARE
  first_girl_id UUID;
BEGIN
  BEGIN
    SELECT id INTO first_girl_id
    FROM public.training_girls
    WHERE required_xp = 0
    ORDER BY difficulty_level ASC
    LIMIT 1;

    INSERT INTO public.user_progression (user_id, unlocked_girls)
    VALUES (
      NEW.id,
      CASE WHEN first_girl_id IS NOT NULL THEN ARRAY[first_girl_id] ELSE ARRAY[]::UUID[] END
    )
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Ne jamais bloquer la création de l'utilisateur
    NULL;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. S'assurer que les triggers existent (recrée si absent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

DROP TRIGGER IF EXISTS on_user_created ON auth.users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_progression();
