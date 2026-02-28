-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION : Analytics A/B onboarding + Dashboard visits
-- À exécuter dans Supabase > SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Enrichir rizz_sessions avec toutes les données du parcours ──
ALTER TABLE rizz_sessions
  ADD COLUMN IF NOT EXISTS selected_tone        TEXT,           -- ton choisi (Direct, Drôle, Mystérieux, Compliment)
  ADD COLUMN IF NOT EXISTS has_uploaded_image   BOOLEAN NOT NULL DEFAULT false, -- test-1 : a importé une photo
  ADD COLUMN IF NOT EXISTS selected_girl        TEXT,           -- test-2 : quelle fille choisie (emma | sarah)
  ADD COLUMN IF NOT EXISTS verdict              TEXT,           -- résultat IA : 'ne_marche_pas' | 'marche'
  ADD COLUMN IF NOT EXISTS completed_at         TIMESTAMPTZ;   -- quand a-t-il vu le résultat débloqué

-- ── 2. Table dashboard_visits : users qui arrivent déjà connectés ──
CREATE TABLE IF NOT EXISTS dashboard_visits (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address  TEXT,
  source      TEXT        NOT NULL DEFAULT 'home',  -- 'home' = vient de /
  visited_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dashboard_visits_user_idx ON dashboard_visits(user_id);
CREATE INDEX IF NOT EXISTS dashboard_visits_date_idx ON dashboard_visits(visited_at);

ALTER TABLE dashboard_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No public access" ON dashboard_visits USING (false);

-- ═══════════════════════════════════════════════════════════════════
-- VUE ANALYTICS : résumé A/B onboarding (pratique pour le dashboard admin)
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW v_ab_funnel AS
SELECT
  flow_type,
  COUNT(*)                                                              AS total_starts,
  COUNT(*) FILTER (WHERE user_message IS NOT NULL)                      AS filled_message,
  COUNT(*) FILTER (WHERE selected_tone IS NOT NULL)                     AS selected_tone_count,
  COUNT(*) FILTER (WHERE user_answer = 'oui')                          AS thought_yes,
  COUNT(*) FILTER (WHERE user_answer = 'non')                          AS thought_no,
  COUNT(*) FILTER (WHERE saw_blurred_result)                            AS saw_result,
  COUNT(*) FILTER (WHERE clicked_unlock)                                AS clicked_unlock,
  COUNT(*) FILTER (WHERE completed_auth)                                AS completed_auth,
  COUNT(*) FILTER (WHERE saw_unblurred_result)                          AS saw_reveal,
  COUNT(*) FILTER (WHERE credit_given)                                  AS credit_given,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE completed_auth) / NULLIF(COUNT(*), 0), 1
  )                                                                     AS conversion_rate_pct
FROM rizz_sessions
GROUP BY flow_type;
