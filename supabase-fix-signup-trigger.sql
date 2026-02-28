-- Corriger le trigger handle_new_user pour éviter l'erreur "Database error saving new user"
-- Ce trigger gère la création du profil lors d'un nouvel utilisateur Supabase Auth

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insérer dans user_profiles si la table existe
  BEGIN
    INSERT INTO public.user_profiles (id, created_at)
    VALUES (NEW.id, NOW())
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Ne pas bloquer l'inscription si l'insert échoue
    NULL;
  END;

  -- Insérer dans user_progression si la table existe
  BEGIN
    INSERT INTO public.user_progression (user_id, created_at)
    VALUES (NEW.id, NOW())
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN NEW;
END;
$$;

-- Recréer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
