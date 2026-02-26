-- Ajout des colonnes de tracking pricing/checkout dans ip_tracking
-- À exécuter dans le SQL Editor de Supabase

ALTER TABLE ip_tracking
  ADD COLUMN IF NOT EXISTS pricing_visited_at    TIMESTAMP,
  ADD COLUMN IF NOT EXISTS pricing_visit_count   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS checkout_started_at   TIMESTAMP,
  ADD COLUMN IF NOT EXISTS checkout_plan         VARCHAR(50);
