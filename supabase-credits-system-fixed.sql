-- ============================================
-- SYSTÈME DE CRÉDITS ET DASHBOARD V2 (FIXED)
-- ============================================
-- À exécuter dans Supabase SQL Editor
-- Version corrigée : utilise user_profiles au lieu de auth.users

-- ============================================
-- 1. TABLE user_profiles (credits et role)
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER DEFAULT 0 NOT NULL,
  role TEXT DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les requetes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_credits ON user_profiles(credits);

-- Trigger pour auto-update du updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_updated_at();

-- Trigger pour creer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, credits, role)
  VALUES (NEW.id, 0, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_user_profile();

-- RLS pour user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================
-- 2. TABLE photo_styles (styles de photos - admin panel)
-- ============================================

CREATE TABLE IF NOT EXISTS photo_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_number INTEGER NOT NULL CHECK (photo_number BETWEEN 1 AND 5),
  style_name TEXT NOT NULL,
  style_description TEXT,
  preview_image_url TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour récupérer rapidement les styles par photo
CREATE INDEX IF NOT EXISTS idx_photo_styles_number ON photo_styles(photo_number, display_order);
CREATE INDEX IF NOT EXISTS idx_photo_styles_active ON photo_styles(is_active) WHERE is_active = true;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_photo_styles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_photo_styles_updated_at
BEFORE UPDATE ON photo_styles
FOR EACH ROW
EXECUTE FUNCTION update_photo_styles_updated_at();

-- RLS pour photo_styles
ALTER TABLE photo_styles ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les styles actifs
CREATE POLICY "Anyone can view active photo styles"
ON photo_styles
FOR SELECT
TO authenticated
USING (is_active = true);

-- Seul l'admin peut modifier les styles
CREATE POLICY "Admin can manage photo styles"
ON photo_styles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- 3. TABLE generated_images (historique images générées)
-- ============================================

CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  photo_number INTEGER CHECK (photo_number BETWEEN 1 AND 5),
  style_id UUID REFERENCES photo_styles(id) ON DELETE SET NULL,
  prompt_used TEXT,
  generation_type TEXT CHECK (generation_type IN ('initial', 'regeneration', 'custom')) DEFAULT 'initial',
  nanobanana_task_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_generated_images_user ON generated_images(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_images_analysis ON generated_images(analysis_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_task ON generated_images(nanobanana_task_id) WHERE nanobanana_task_id IS NOT NULL;

-- RLS pour generated_images
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generated images"
ON generated_images
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role can insert generated images"
ON generated_images
FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================
-- 4. TABLE generated_bios (historique bios générées)
-- ============================================

CREATE TABLE IF NOT EXISTS generated_bios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  bio_text TEXT NOT NULL,
  tone TEXT, -- 'direct', 'intrigant', 'humoristique', 'aventurier'
  generation_type TEXT CHECK (generation_type IN ('initial', 'custom')) DEFAULT 'initial',
  input_data JSONB, -- Stocke les données du formulaire (prénom, job, hobbies, etc.)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_generated_bios_user ON generated_bios(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_bios_analysis ON generated_bios(analysis_id);

-- RLS pour generated_bios
ALTER TABLE generated_bios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generated bios"
ON generated_bios
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role can insert generated bios"
ON generated_bios
FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================
-- 5. SEED INITIAL DES STYLES (exemples de base)
-- ============================================

-- Photo 1: 3 styles
INSERT INTO photo_styles (photo_number, style_name, style_description, preview_image_url, prompt_template, display_order) VALUES
(1, 'Urban Lifestyle', 'Style urbain moderne et décontracté', 'https://placeholder.com/preview-urban.jpg', 'Photorealistic smartphone photo in urban outdoor setting. Golden hour lighting, modern casual outfit, natural relaxed pose, city background slightly blurred.', 1),
(1, 'Professional Portrait', 'Portrait professionnel et élégant', 'https://placeholder.com/preview-pro.jpg', 'Professional portrait style. Clean background, business casual attire, confident expression, studio-quality lighting.', 2),
(1, 'Casual Outdoor', 'Décontracté en extérieur naturel', 'https://placeholder.com/preview-casual.jpg', 'Casual outdoor lifestyle photo. Natural environment, relaxed clothing, genuine smile, soft natural lighting.', 3);

-- Photo 2: 4 styles
INSERT INTO photo_styles (photo_number, style_name, style_description, preview_image_url, prompt_template, display_order) VALUES
(2, 'Sport/Activité', 'En pleine action sportive', 'https://placeholder.com/preview-sport.jpg', 'Active sports lifestyle photo. Athletic wear, mid-action pose, gym or outdoor sports setting, dynamic energy.', 1),
(2, 'Voyage/Aventure', 'Esprit aventurier et voyageur', 'https://placeholder.com/preview-travel.jpg', 'Travel adventure photo. Scenic location, explorer vibe, casual travel outfit, natural outdoor setting.', 2),
(2, 'Social/Soirée', 'Ambiance conviviale et sociale', 'https://placeholder.com/preview-social.jpg', 'Social gathering atmosphere. Smart casual outfit, warm ambient lighting, relaxed social setting.', 3),
(2, 'Créatif/Artistique', 'Créativité et originalité', 'https://placeholder.com/preview-creative.jpg', 'Creative artistic photo. Unique composition, artistic background, creative personality visible.', 4);

-- Photos 3, 4, 5: 1 style par défaut chacune
INSERT INTO photo_styles (photo_number, style_name, style_description, preview_image_url, prompt_template, display_order) VALUES
(3, 'Indoor Personality', 'Intérieur chaleureux avec personnalité', 'https://placeholder.com/preview-indoor.jpg', 'Indoor personality photo. Cozy interior setting, warm ambient lighting, casual comfortable outfit, books or plants in background.', 1),
(4, 'Minimal Chill', 'Minimaliste et décontracté', 'https://placeholder.com/preview-minimal.jpg', 'Minimal outdoor photo. Clean simple background, relaxed seated or standing pose, chill energy, soft lighting.', 1),
(5, 'Evening Smart Casual', 'Soirée chic et approchable', 'https://placeholder.com/preview-evening.jpg', 'Evening smart casual photo. Upscale setting, blazer without tie, soft bokeh city lights, sophisticated yet approachable.', 1);

-- ============================================
-- 6. FONCTIONS HELPER POUR CRÉDITS
-- ============================================

-- Fonction pour vérifier si l'utilisateur a assez de crédits
CREATE OR REPLACE FUNCTION check_user_credits(user_id_param UUID, cost INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  user_credits INTEGER;
BEGIN
  SELECT credits INTO user_credits
  FROM public.user_profiles
  WHERE id = user_id_param;
  
  RETURN COALESCE(user_credits, 0) >= cost;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour décompter les crédits (transaction atomique)
CREATE OR REPLACE FUNCTION deduct_credits(user_id_param UUID, cost INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  user_credits INTEGER;
BEGIN
  -- Lock la ligne pour éviter les race conditions
  SELECT credits INTO user_credits
  FROM public.user_profiles
  WHERE id = user_id_param
  FOR UPDATE;
  
  IF COALESCE(user_credits, 0) < cost THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.user_profiles
  SET credits = credits - cost
  WHERE id = user_id_param;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajouter des crédits
CREATE OR REPLACE FUNCTION add_credits(user_id_param UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_profiles (id, credits)
  VALUES (user_id_param, amount)
  ON CONFLICT (id) 
  DO UPDATE SET credits = user_profiles.credits + amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. VÉRIFICATION FINALE
-- ============================================

-- Vérifier que les tables sont créées
SELECT 
  'user_profiles' as table_name, 
  COUNT(*) as count 
FROM user_profiles
UNION ALL
SELECT 
  'photo_styles', 
  COUNT(*) 
FROM photo_styles
UNION ALL
SELECT 
  'generated_images', 
  COUNT(*) 
FROM generated_images
UNION ALL
SELECT 
  'generated_bios', 
  COUNT(*) 
FROM generated_bios;

-- Vérifier la structure de user_profiles
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles' 
  AND column_name IN ('credits', 'role');
