-- Table pour tracker les IPs et leur usage de l'analyse gratuite
CREATE TABLE IF NOT EXISTS ip_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address VARCHAR(45) NOT NULL,
  fingerprint TEXT,
  has_used_free_analysis BOOLEAN DEFAULT FALSE,
  free_analysis_used_at TIMESTAMP,
  total_analyses_attempted INTEGER DEFAULT 0,
  last_visit TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_ip_tracking_address ON ip_tracking(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_tracking_free_analysis ON ip_tracking(has_used_free_analysis);

-- RLS : table accessible uniquement via service role (API routes serveur)
ALTER TABLE ip_tracking ENABLE ROW LEVEL SECURITY;

-- Aucune policy publique : toutes les opérations passent par le service role
