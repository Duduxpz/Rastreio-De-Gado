-- Migration: suporte a múltiplas espécies, nome do animal, created_at e
-- configurações persistentes por usuário (fazenda).
-- Execute no SQL Editor do Supabase (ou via CLI de migrations) do projeto.

-- 1) Tabela "animais": adicionar espécie, nome e created_at ------------------
ALTER TABLE animais
  ADD COLUMN IF NOT EXISTS especie TEXT NOT NULL DEFAULT 'bovino',
  ADD COLUMN IF NOT EXISTS nome TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Backfill created_at para linhas antigas que não tinham a coluna
UPDATE animais SET created_at = updated_at WHERE created_at IS NULL;

-- Restringe a espécie a um conjunto conhecido
ALTER TABLE animais DROP CONSTRAINT IF EXISTS animais_especie_check;
ALTER TABLE animais
  ADD CONSTRAINT animais_especie_check
  CHECK (especie IN ('bovino', 'equino', 'ovino', 'caprino', 'suino', 'ave'));

-- A antiga constraint de categoria só previa categorias de bovino.
-- Agora cada espécie tem seu próprio conjunto de categorias válidas.
ALTER TABLE animais DROP CONSTRAINT IF EXISTS animais_categoria_check;
ALTER TABLE animais
  ADD CONSTRAINT animais_categoria_check
  CHECK (
    categoria IS NULL OR (
      (especie = 'bovino' AND categoria IN ('bezerro','novilha','vaca','touro','boi','outro')) OR
      (especie = 'equino' AND categoria IN ('potro','potranca','egua','garanhao','castrado','outro')) OR
      (especie = 'ovino'  AND categoria IN ('cordeiro','borrega','ovelha','carneiro','outro')) OR
      (especie = 'caprino' AND categoria IN ('cabrito','caprina','cabra','bode','outro')) OR
      (especie = 'suino'  AND categoria IN ('leitao','marra','porca','cachaco','outro')) OR
      (especie = 'ave'    AND categoria IN ('pintainho','frango','poedeira','matriz','reprodutor','outro'))
    )
  );

CREATE INDEX IF NOT EXISTS idx_animais_especie ON animais(especie);
CREATE INDEX IF NOT EXISTS idx_animais_nome ON animais(nome);
CREATE INDEX IF NOT EXISTS idx_animais_created_at ON animais(created_at);

-- 2) Tabela "profiles": garantir que existe e adicionar configurações -------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL DEFAULT 'Minha Fazenda',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS configuracoes JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Cria o profile automaticamente quando um novo usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, farm_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'farm_name', 'Minha Fazenda')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Mantém updated_at em dia a cada alteração do profile
CREATE OR REPLACE FUNCTION public.set_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_profiles_updated_at();
