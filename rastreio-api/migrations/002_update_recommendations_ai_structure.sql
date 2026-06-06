-- Migration: Update recommendations table to new AI structure
-- Adds new columns: titulo, sugestao, analiseIA, status (status updated_at)
-- Removes: motivo->descricao, acknowledged->status

BEGIN;

-- Add new columns to recommendations
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS titulo TEXT;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS sugestao TEXT;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS analiseIA TEXT;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'RECONHECIDA', 'RESOLVIDA'));
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Update prioridade to be TEXT instead of INTEGER (for backwards compatibility, map old values)
-- This is complex in Postgres, so we add new column and copy data
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS prioridade_new TEXT;

-- Map old numeric priorities to new string format
UPDATE recommendations 
SET prioridade_new = CASE 
  WHEN prioridade = 1 THEN 'ALTA'
  WHEN prioridade = 2 THEN 'ALTA'
  WHEN prioridade = 3 THEN 'MEDIA'
  WHEN prioridade = 4 THEN 'BAIXA'
  WHEN prioridade = 5 THEN 'INFORMATIVA'
  ELSE 'MEDIA'
END
WHERE prioridade_new IS NULL;

-- Drop old column and rename new one
ALTER TABLE recommendations DROP COLUMN IF EXISTS prioridade;
ALTER TABLE recommendations RENAME COLUMN prioridade_new TO prioridade;
ALTER TABLE recommendations ALTER COLUMN prioridade SET NOT NULL;

-- Backfill titulo and sugestao from motivo if they exist
UPDATE recommendations
SET titulo = motivo
WHERE titulo IS NULL AND motivo IS NOT NULL;

-- Map acknowledged to status
UPDATE recommendations
SET status = CASE
  WHEN acknowledged = true THEN 'RECONHECIDA'
  ELSE 'PENDENTE'
END
WHERE status = 'PENDENTE';

-- Drop old columns
ALTER TABLE recommendations DROP COLUMN IF EXISTS motivo;
ALTER TABLE recommendations DROP COLUMN IF EXISTS acknowledged;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_prioridade ON recommendations(prioridade);

COMMIT;
