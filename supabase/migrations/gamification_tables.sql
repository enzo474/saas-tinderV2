-- ============================================
-- TABLE 1 : MEUFS IA (Configuration)
-- ============================================

CREATE TABLE training_girls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  personality_type VARCHAR(100) NOT NULL,
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
  required_xp INTEGER NOT NULL DEFAULT 0,
  badge_color VARCHAR(20) NOT NULL,
  badge_text VARCHAR(20) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  conversation_style JSONB NOT NULL DEFAULT '{
    "response_rate": 80,
    "friendliness": 70,
    "challenge_level": 30,
    "avg_response_length": 40,
    "topics": [],
    "green_flags": [],
    "red_flags": [],
    "response_patterns": {}
  }'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_training_girls_difficulty ON training_girls(difficulty_level);
CREATE INDEX idx_training_girls_required_xp ON training_girls(required_xp);

-- ============================================
-- TABLE 2 : CONVERSATIONS TRAINING
-- ============================================

CREATE TABLE training_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  girl_id UUID NOT NULL REFERENCES training_girls(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_rizz INTEGER DEFAULT 50 CHECK (current_rizz BETWEEN 0 AND 100),
  final_score INTEGER CHECK (final_score BETWEEN 1 AND 5),
  final_rizz_percentage INTEGER CHECK (final_rizz_percentage BETWEEN 0 AND 100),
  xp_earned INTEGER DEFAULT 0,
  date_obtained BOOLEAN DEFAULT FALSE,
  feedback_summary JSONB DEFAULT '{"strengths": [], "weaknesses": [], "improvement_tips": []}'::jsonb,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  is_completed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_training_conversations_user ON training_conversations(user_id);
CREATE INDEX idx_training_conversations_girl ON training_conversations(girl_id);
CREATE INDEX idx_training_conversations_completed ON training_conversations(is_completed);
CREATE INDEX idx_training_conversations_user_completed ON training_conversations(user_id, is_completed);

-- ============================================
-- TABLE 3 : PROGRESSION UTILISATEUR
-- ============================================

CREATE TABLE user_progression (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level INTEGER DEFAULT 0 CHECK (current_level BETWEEN 0 AND 6),
  total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
  unlocked_girls UUID[] DEFAULT ARRAY[]::UUID[],
  total_conversations INTEGER DEFAULT 0,
  total_completed_conversations INTEGER DEFAULT 0,
  total_dates_obtained INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0 CHECK (best_score BETWEEN 0 AND 5),
  average_rizz DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_progression_user ON user_progression(user_id);
CREATE INDEX idx_user_progression_level ON user_progression(current_level);

-- ============================================
-- TABLE 4 : HISTORIQUE XP
-- ============================================

CREATE TABLE xp_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source VARCHAR(50) NOT NULL,
  conversation_id UUID REFERENCES training_conversations(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_xp_history_user ON xp_history(user_id);
CREATE INDEX idx_xp_history_created ON xp_history(created_at);

-- ============================================
-- TRIGGERS : AUTO updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_training_girls_updated_at
  BEFORE UPDATE ON training_girls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progression_updated_at
  BEFORE UPDATE ON user_progression
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER : AUTO-INIT PROGRESSION NOUVEAUX USERS
-- ============================================

CREATE OR REPLACE FUNCTION initialize_user_progression()
RETURNS TRIGGER AS $$
DECLARE
  first_girl_id UUID;
BEGIN
  SELECT id INTO first_girl_id
  FROM training_girls
  WHERE required_xp = 0
  ORDER BY difficulty_level ASC
  LIMIT 1;

  INSERT INTO user_progression (user_id, unlocked_girls)
  VALUES (
    NEW.id,
    CASE WHEN first_girl_id IS NOT NULL THEN ARRAY[first_girl_id] ELSE ARRAY[]::UUID[] END
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_progression();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE training_girls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view training girls"
  ON training_girls FOR SELECT USING (true);

ALTER TABLE training_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own conversations"
  ON training_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own conversations"
  ON training_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own conversations"
  ON training_conversations FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE user_progression ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own progression"
  ON user_progression FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own progression"
  ON user_progression FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own XP history"
  ON xp_history FOR SELECT USING (auth.uid() = user_id);
