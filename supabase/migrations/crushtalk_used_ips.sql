-- ============================================================
-- Table pour tracker les IPs qui ont déjà eu les crédits gratuits
-- Empêche les multi-comptes pour contourner le paywall
-- ============================================================

CREATE TABLE IF NOT EXISTS crushtalk_used_ips (
  ip_address VARCHAR(45) PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
