-- Ajouter colonne ab_variant pour A/B testing onboarding
ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS ab_variant TEXT CHECK (ab_variant IN ('A', 'B'));

-- ab_variant : 'A' = onboarding long, 'B' = onboarding court
