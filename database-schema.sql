-- Tabelas principais do projeto Rastreabilidade de Gado

-- Tabela de fazendas
CREATE TABLE fazendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  plano TEXT DEFAULT 'starter' CHECK (plano IN ('starter','fazenda','enterprise')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de animais (com suporte a múltiplas espécies via migration 004)
CREATE TABLE animais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id UUID REFERENCES fazendas(id) ON DELETE CASCADE,
  brinco TEXT NOT NULL,
  nome TEXT,
  especie TEXT NOT NULL DEFAULT 'bovino',
  raca TEXT,
  sexo TEXT CHECK (sexo IN ('M','F')),
  data_nascimento DATE,
  peso_atual NUMERIC(6,2),
  lote TEXT,
  pasto TEXT,
  categoria TEXT,
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (fazenda_id, brinco),
  CONSTRAINT animais_especie_check CHECK (especie IN ('bovino', 'equino', 'ovino', 'caprino', 'suino', 'ave')),
  CONSTRAINT animais_categoria_check CHECK (
    categoria IS NULL OR (
      (especie = 'bovino' AND categoria IN ('bezerro','novilha','vaca','touro','boi','outro')) OR
      (especie = 'equino' AND categoria IN ('potro','potranca','egua','garanhao','castrado','outro')) OR
      (especie = 'ovino'  AND categoria IN ('cordeiro','borrega','ovelha','carneiro','outro')) OR
      (especie = 'caprino' AND categoria IN ('cabrito','caprina','cabra','bode','outro')) OR
      (especie = 'suino'  AND categoria IN ('leitao','marra','porca','cachaco','outro')) OR
      (especie = 'ave'    AND categoria IN ('pintainho','frango','poedeira','matriz','reprodutor','outro'))
    )
  )
);

-- Índices para performance (migração 004)
CREATE INDEX IF NOT EXISTS idx_animais_especie ON animais(especie);
CREATE INDEX IF NOT EXISTS idx_animais_nome ON animais(nome);
CREATE INDEX IF NOT EXISTS idx_animais_created_at ON animais(created_at);
CREATE INDEX IF NOT EXISTS idx_animais_fazenda_id ON animais(fazenda_id);

-- Tabela de vacinações
CREATE TABLE vacinacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
  vacina TEXT NOT NULL,
  data DATE NOT NULL,
  dose TEXT,
  veterinario TEXT,
  proxima_dose DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de pesagens
CREATE TABLE pesagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
  peso NUMERIC(6,2) NOT NULL,
  data DATE NOT NULL,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE fazendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacinacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesagens ENABLE ROW LEVEL SECURITY;

-- Policies - Fazendas
CREATE POLICY "rls_fazendas_select" ON fazendas
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "rls_fazendas_insert" ON fazendas
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Policies - Animais
CREATE POLICY "rls_animais_select" ON animais
  FOR SELECT USING (
    fazenda_id IN (SELECT id FROM fazendas WHERE owner_id = auth.uid())
  );

CREATE POLICY "rls_animais_insert" ON animais
  FOR INSERT WITH CHECK (
    fazenda_id IN (SELECT id FROM fazendas WHERE owner_id = auth.uid())
  );

CREATE POLICY "rls_animais_update" ON animais
  FOR UPDATE USING (
    fazenda_id IN (SELECT id FROM fazendas WHERE owner_id = auth.uid())
  );

-- Policies - Vacinações
CREATE POLICY "rls_vacinacoes_select" ON vacinacoes
  FOR SELECT USING (
    animal_id IN (
      SELECT id FROM animais WHERE fazenda_id IN (
        SELECT id FROM fazendas WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "rls_vacinacoes_insert" ON vacinacoes
  FOR INSERT WITH CHECK (
    animal_id IN (
      SELECT id FROM animais WHERE fazenda_id IN (
        SELECT id FROM fazendas WHERE owner_id = auth.uid()
      )
    )
  );

-- Policies - Pesagens
CREATE POLICY "rls_pesagens_select" ON pesagens
  FOR SELECT USING (
    animal_id IN (
      SELECT id FROM animais WHERE fazenda_id IN (
        SELECT id FROM fazendas WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "rls_pesagens_insert" ON pesagens
  FOR INSERT WITH CHECK (
    animal_id IN (
      SELECT id FROM animais WHERE fazenda_id IN (
        SELECT id FROM fazendas WHERE owner_id = auth.uid()
      )
    )
  );

-- Índices para performance
CREATE INDEX idx_animais_fazenda_id ON animais(fazenda_id);
CREATE INDEX idx_animais_ativo ON animais(ativo);
CREATE INDEX idx_vacinacoes_animal_id ON vacinacoes(animal_id);
CREATE INDEX idx_pesagens_animal_id ON pesagens(animal_id);

-- Access logs for audit and security tracking
CREATE TABLE access_logs (
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

CREATE POLICY "rls_access_logs_select" ON access_logs
  FOR SELECT
  USING (
    fazenda_id IN (SELECT id FROM fazendas WHERE owner_id = auth.uid())
  );

CREATE POLICY "rls_access_logs_insert" ON access_logs
  FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX idx_access_logs_fazenda_id ON access_logs(fazenda_id);
CREATE INDEX idx_access_logs_created_at ON access_logs(created_at);
