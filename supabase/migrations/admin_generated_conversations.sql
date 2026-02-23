-- ============================================================
-- Table pour les conversations virales générées par l'admin
-- Outil interne pour créer du contenu TikTok/Instagram
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_generated_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_image_url TEXT,
  context TEXT,
  style VARCHAR(50) NOT NULL,
  length VARCHAR(20) NOT NULL,
  conversation JSONB NOT NULL,
  hook_explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_conversations_created
  ON admin_generated_conversations(created_at DESC);
