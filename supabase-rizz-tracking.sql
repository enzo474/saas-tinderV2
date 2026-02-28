-- Table pour tracker les sessions des onboardings rizz test
CREATE TABLE IF NOT EXISTS rizz_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address          TEXT,
  flow_type           TEXT,            -- 'test-1' | 'test-2'
  user_message        TEXT,
  user_answer         TEXT,            -- 'oui' | 'non'
  saw_blurred_result  BOOLEAN NOT NULL DEFAULT false,
  clicked_unlock      BOOLEAN NOT NULL DEFAULT false,
  completed_auth      BOOLEAN NOT NULL DEFAULT false,
  saw_unblurred_result BOOLEAN NOT NULL DEFAULT false,
  credit_given        BOOLEAN NOT NULL DEFAULT false,
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rizz_sessions_ip_idx   ON rizz_sessions(ip_address);
CREATE INDEX IF NOT EXISTS rizz_sessions_user_idx ON rizz_sessions(user_id);

ALTER TABLE rizz_sessions ENABLE ROW LEVEL SECURITY;

-- Uniquement accessible via service role (backend)
CREATE POLICY "No public access" ON rizz_sessions USING (false);
