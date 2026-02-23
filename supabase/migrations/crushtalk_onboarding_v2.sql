-- ============================================================
-- CrushTalk Onboarding v2 — Nouvel onboarding 6 questions
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- Supprimer les anciennes colonnes
ALTER TABLE crushtalk_onboarding
DROP COLUMN IF EXISTS gender,
DROP COLUMN IF EXISTS age_range,
DROP COLUMN IF EXISTS looking_for,
DROP COLUMN IF EXISTS dating_apps,
DROP COLUMN IF EXISTS matches_per_day,
DROP COLUMN IF EXISTS match_quality,
DROP COLUMN IF EXISTS satisfaction;

-- Ajouter les nouvelles colonnes
ALTER TABLE crushtalk_onboarding
ADD COLUMN IF NOT EXISTS struggle_point VARCHAR(100),
ADD COLUMN IF NOT EXISTS matching_behaviors TEXT[],
ADD COLUMN IF NOT EXISTS response_rate VARCHAR(50),
ADD COLUMN IF NOT EXISTS goals TEXT[],
ADD COLUMN IF NOT EXISTS preferred_style VARCHAR(100),
ADD COLUMN IF NOT EXISTS usage_preference VARCHAR(100);
