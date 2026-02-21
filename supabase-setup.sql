-- Table analyses
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'complete', 'paid')),

  -- Onboarding partie 1
  current_matches TEXT,
  tinder_seniority TEXT,
  selfie_url TEXT,

  -- Métriques fausses calculées (partie 1)
  visual_potential NUMERIC,
  current_exploitation NUMERIC,
  inexploited_percent NUMERIC,

  -- Onboarding partie 2
  target_matches TEXT,
  photos_urls TEXT[],
  current_bio TEXT,
  relationship_goal TEXT,
  target_women TEXT[],
  height INTEGER,
  job TEXT,
  sport TEXT,
  lifestyle TEXT[],
  vibe TEXT[],
  anecdotes TEXT[],
  passions TEXT[],

  -- Scores calculés (faux — basés sur current_matches)
  photo_score NUMERIC,
  bio_score NUMERIC,
  coherence_score NUMERIC,
  total_score NUMERIC,
  positioning_percent NUMERIC,

  -- Résultat Claude (post-paiement)
  full_plan JSONB,

  -- Paiement
  stripe_session_id TEXT,
  product_type TEXT,
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Policy: users can only access their own analyses
CREATE POLICY "user_own" ON analyses
  USING (user_id = auth.uid());

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket configuration
-- Execute in Supabase Storage UI:
-- 1. Create bucket "uploads" (private)
-- 2. Add policies for authenticated users to upload/read their own files
