-- Migration: add access_logs audit table for authenticated access tracking

CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  fazenda_id UUID REFERENCES fazendas(id) ON DELETE SET NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  action TEXT,
  ip TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "rls_access_logs_select" ON access_logs
  FOR SELECT
  USING (
    fazenda_id IN (SELECT id FROM fazendas WHERE owner_id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "rls_access_logs_insert" ON access_logs
  FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_fazenda_id ON access_logs(fazenda_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);
