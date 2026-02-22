-- ============================================================
-- CrushTalk Subscriptions — à exécuter dans Supabase SQL Editor
-- ============================================================

-- Ajout des colonnes d'abonnement sur crushtalk_credits
ALTER TABLE crushtalk_credits
  ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT NULL,         -- 'chill' | 'charo' | NULL
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT NULL,        -- 'active' | 'canceled' | 'past_due'
  ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ DEFAULT NULL;

-- Index sur subscription_id pour les lookups webhook
CREATE INDEX IF NOT EXISTS idx_ct_credits_sub_id ON crushtalk_credits(stripe_subscription_id);
