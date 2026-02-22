-- ============================================================
-- CrushTalk Tables — à exécuter dans Supabase SQL Editor
-- ============================================================

-- Crédits CrushTalk (séparés des crédits photos)
CREATE TABLE IF NOT EXISTS crushtalk_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance INTEGER NOT NULL DEFAULT 20,
  used_total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Onboarding CrushTalk (1 entrée par user)
CREATE TABLE IF NOT EXISTS crushtalk_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  gender VARCHAR(20),
  age_range VARCHAR(20),
  looking_for VARCHAR(50),
  dating_apps TEXT[],
  matches_per_day VARCHAR(50),
  match_quality VARCHAR(50),
  satisfaction VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historique des générations
CREATE TABLE IF NOT EXISTS crushtalk_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message_type VARCHAR(20) NOT NULL, -- 'accroche' ou 'reponse'
  selected_tones TEXT[],
  context_message TEXT,
  profile_analysis JSONB,
  generated_messages JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_ct_credits_user ON crushtalk_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_ct_onboarding_user ON crushtalk_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_ct_generations_user ON crushtalk_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ct_generations_created ON crushtalk_generations(user_id, created_at DESC);

-- RLS
ALTER TABLE crushtalk_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE crushtalk_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE crushtalk_generations ENABLE ROW LEVEL SECURITY;

-- Policies (lecture/écriture pour le user concerné)
CREATE POLICY "Users can read own crushtalk_credits"
  ON crushtalk_credits FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own crushtalk_onboarding"
  ON crushtalk_onboarding FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own crushtalk_generations"
  ON crushtalk_generations FOR SELECT USING (auth.uid() = user_id);

-- Fonction RPC pour déduire les crédits de manière atomique
CREATE OR REPLACE FUNCTION deduct_crushtalk_credits(user_id_param UUID, cost INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT balance INTO current_balance
  FROM crushtalk_credits
  WHERE user_id = user_id_param
  FOR UPDATE;

  IF current_balance IS NULL OR current_balance < cost THEN
    RETURN FALSE;
  END IF;

  UPDATE crushtalk_credits
  SET balance = balance - cost,
      used_total = used_total + cost,
      updated_at = NOW()
  WHERE user_id = user_id_param;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
