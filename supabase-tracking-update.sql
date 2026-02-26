-- Mise à jour de la table ip_tracking pour le tracking complet du parcours utilisateur
-- À exécuter dans le SQL Editor de Supabase (une seule fois)

ALTER TABLE ip_tracking
  -- Onboarding tracking
  ADD COLUMN IF NOT EXISTS onboarding_started_at      TIMESTAMP,
  ADD COLUMN IF NOT EXISTS onboarding_video_viewed     BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_video_duration   INTEGER,
  ADD COLUMN IF NOT EXISTS onboarding_question_1_at    TIMESTAMP,
  ADD COLUMN IF NOT EXISTS onboarding_question_2_at    TIMESTAMP,
  ADD COLUMN IF NOT EXISTS onboarding_question_3_at    TIMESTAMP,
  ADD COLUMN IF NOT EXISTS onboarding_question_4_at    TIMESTAMP,
  ADD COLUMN IF NOT EXISTS onboarding_question_5_at    TIMESTAMP,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at     TIMESTAMP,
  ADD COLUMN IF NOT EXISTS onboarding_drop_step        VARCHAR(10),
  -- Dashboard tracking
  ADD COLUMN IF NOT EXISTS dashboard_first_visit_at    TIMESTAMP,
  ADD COLUMN IF NOT EXISTS dashboard_last_visit_at     TIMESTAMP,
  ADD COLUMN IF NOT EXISTS dashboard_total_visits      INTEGER DEFAULT 0,
  -- Conversion tracking
  ADD COLUMN IF NOT EXISTS has_subscribed              BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS subscription_plan           VARCHAR(50),
  ADD COLUMN IF NOT EXISTS subscribed_at               TIMESTAMP;

-- Requête d'analyse du funnel (à utiliser dans le SQL Editor)
-- SELECT
--   COUNT(*)                                                          AS total_ips,
--   COUNT(*) FILTER (WHERE onboarding_started_at IS NOT NULL)         AS ont_démarré_onboarding,
--   COUNT(*) FILTER (WHERE onboarding_video_viewed)                   AS ont_regardé_vidéo,
--   COUNT(*) FILTER (WHERE onboarding_question_1_at IS NOT NULL)      AS ont_atteint_q1,
--   COUNT(*) FILTER (WHERE onboarding_question_2_at IS NOT NULL)      AS ont_atteint_q2,
--   COUNT(*) FILTER (WHERE onboarding_question_3_at IS NOT NULL)      AS ont_atteint_q3,
--   COUNT(*) FILTER (WHERE onboarding_question_4_at IS NOT NULL)      AS ont_atteint_q4,
--   COUNT(*) FILTER (WHERE onboarding_question_5_at IS NOT NULL)      AS ont_atteint_q5,
--   COUNT(*) FILTER (WHERE onboarding_completed_at IS NOT NULL)       AS ont_complété,
--   COUNT(*) FILTER (WHERE dashboard_first_visit_at IS NOT NULL)      AS ont_visité_dashboard,
--   COUNT(*) FILTER (WHERE has_used_free_analysis)                    AS ont_utilisé_analyse,
--   COUNT(*) FILTER (WHERE has_subscribed)                            AS ont_souscrit
-- FROM ip_tracking;
