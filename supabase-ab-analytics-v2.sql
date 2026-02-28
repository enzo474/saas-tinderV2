-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION v2 : Tracking complet du parcours onboarding A/B
-- À exécuter dans Supabase > SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ── Timestamps de chaque étape (null = étape pas atteinte) ──────────
ALTER TABLE rizz_sessions
  ADD COLUMN IF NOT EXISTS arrived_at          TIMESTAMPTZ,   -- arrivée sur la page
  ADD COLUMN IF NOT EXISTS image_uploaded_at   TIMESTAMPTZ,   -- test-1 : photo importée
  ADD COLUMN IF NOT EXISTS girl_selected_at    TIMESTAMPTZ,   -- test-2 : fille choisie
  ADD COLUMN IF NOT EXISTS tone_selected_at    TIMESTAMPTZ,   -- a sélectionné un ton
  ADD COLUMN IF NOT EXISTS submitted_at        TIMESTAMPTZ,   -- a cliqué OUI/NON → analyse lancée
  ADD COLUMN IF NOT EXISTS saw_result_at       TIMESTAMPTZ,   -- a vu le résultat flouté
  ADD COLUMN IF NOT EXISTS clicked_unlock_at   TIMESTAMPTZ,   -- a cliqué "Voir le football"
  ADD COLUMN IF NOT EXISTS auth_completed_at   TIMESTAMPTZ,   -- a finalisé la connexion
  ADD COLUMN IF NOT EXISTS saw_reveal_at       TIMESTAMPTZ,   -- a vu la page de révélation
  ADD COLUMN IF NOT EXISTS copied_at           TIMESTAMPTZ,   -- a copié le football

-- ── Données contextuelles ────────────────────────────────────────────
  ADD COLUMN IF NOT EXISTS message_length      INT,           -- nb de caractères du message
  ADD COLUMN IF NOT EXISTS copied_result       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS device_type         TEXT,          -- 'mobile' | 'desktop'
  ADD COLUMN IF NOT EXISTS ab_variant          TEXT;          -- 'test-1' | 'test-2' (cookie)

-- ── Vue de funnel mise à jour avec les timestamps ────────────────────
CREATE OR REPLACE VIEW v_ab_funnel AS
SELECT
  flow_type,
  COUNT(*)                                                                  AS total_visits,
  COUNT(*) FILTER (WHERE submitted_at IS NOT NULL)                         AS submitted_message,
  COUNT(*) FILTER (WHERE selected_tone IS NOT NULL)                        AS selected_tone_count,
  COUNT(*) FILTER (WHERE user_answer = 'oui')                             AS thought_yes,
  COUNT(*) FILTER (WHERE user_answer = 'non')                             AS thought_no,
  COUNT(*) FILTER (WHERE saw_blurred_result)                               AS saw_blurred_result,
  COUNT(*) FILTER (WHERE clicked_unlock)                                   AS clicked_unlock,
  COUNT(*) FILTER (WHERE completed_auth)                                   AS completed_auth,
  COUNT(*) FILTER (WHERE saw_unblurred_result)                             AS saw_reveal,
  COUNT(*) FILTER (WHERE copied_result)                                    AS copied,
  -- Taux de conversion par étape
  ROUND(100.0 * COUNT(*) FILTER (WHERE submitted_at IS NOT NULL)
    / NULLIF(COUNT(*), 0), 1)                                              AS pct_submitted,
  ROUND(100.0 * COUNT(*) FILTER (WHERE saw_blurred_result)
    / NULLIF(COUNT(*) FILTER (WHERE submitted_at IS NOT NULL), 0), 1)     AS pct_saw_result,
  ROUND(100.0 * COUNT(*) FILTER (WHERE clicked_unlock)
    / NULLIF(COUNT(*) FILTER (WHERE saw_blurred_result), 0), 1)           AS pct_clicked_unlock,
  ROUND(100.0 * COUNT(*) FILTER (WHERE completed_auth)
    / NULLIF(COUNT(*) FILTER (WHERE clicked_unlock), 0), 1)               AS pct_converted,
  -- Durée moyenne (en secondes) entre arrivée et soumission
  ROUND(AVG(EXTRACT(EPOCH FROM (submitted_at - arrived_at)))
    FILTER (WHERE submitted_at IS NOT NULL AND arrived_at IS NOT NULL))    AS avg_seconds_to_submit,
  -- Device split
  COUNT(*) FILTER (WHERE device_type = 'mobile')                          AS mobile_visits,
  COUNT(*) FILTER (WHERE device_type = 'desktop')                         AS desktop_visits
FROM rizz_sessions
GROUP BY flow_type;
