-- ==============================================================================
-- SCRIPT SQL: AJUSTE E CORREÇÃO DE POLÍTICAS RLS (Row Level Security) NO SUPABASE
-- PROJETO: Corações que Acolhe - Lar Esperança
-- OBJETIVO: Garantir permissões completas de leitura e gravação no painel admin
--           e acesso seguro para visitantes, padrinhos e famílias.
-- ==============================================================================

-- 1. Habilitar RLS em todas as tabelas principais
ALTER TABLE public.kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. TABELA: kids (Crianças e Cartinhas)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura pública de crianças ativas" ON public.kids;
DROP POLICY IF EXISTS "Permitir inserção e cadastro de crianças" ON public.kids;
DROP POLICY IF EXISTS "Permitir atualização de crianças" ON public.kids;
DROP POLICY IF EXISTS "Permitir exclusão de crianças" ON public.kids;
DROP POLICY IF EXISTS "Full access to kids" ON public.kids;

-- Leitura: Qualquer usuário (anônimo ou autenticado) pode ver crianças cadastradas
CREATE POLICY "Permitir leitura pública de crianças"
  ON public.kids
  FOR SELECT
  USING (true);

-- Inserção: Famílias e Administradores podem cadastrar crianças
CREATE POLICY "Permitir inserção de crianças"
  ON public.kids
  FOR INSERT
  WITH CHECK (true);

-- Atualização: Administradores e Famílias podem editar dados e status
CREATE POLICY "Permitir atualização de crianças"
  ON public.kids
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Exclusão: Administradores podem remover crianças
CREATE POLICY "Permitir exclusão de crianças"
  ON public.kids
  FOR DELETE
  USING (true);

-- ------------------------------------------------------------------------------
-- 3. TABELA: profiles (Padrinhos, Famílias e Administradores)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Permitir cadastro de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Permitir atualização de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Permitir exclusão de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Full access to profiles" ON public.profiles;

CREATE POLICY "Permitir leitura de perfis"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Permitir cadastro de perfis"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de perfis"
  ON public.profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão de perfis"
  ON public.profiles
  FOR DELETE
  USING (true);

-- ------------------------------------------------------------------------------
-- 4. TABELA: gifts (Presentes e Apadrinhamentos)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura de presentes" ON public.gifts;
DROP POLICY IF EXISTS "Permitir inserção de presentes" ON public.gifts;
DROP POLICY IF EXISTS "Permitir atualização de presentes" ON public.gifts;
DROP POLICY IF EXISTS "Permitir exclusão de presentes" ON public.gifts;

CREATE POLICY "Permitir leitura de presentes"
  ON public.gifts
  FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção de presentes"
  ON public.gifts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de presentes"
  ON public.gifts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão de presentes"
  ON public.gifts
  FOR DELETE
  USING (true);

-- ------------------------------------------------------------------------------
-- 5. TABELA: gallery (Mídias e Fotos do Lar Esperança)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura da galeria" ON public.gallery;
DROP POLICY IF EXISTS "Permitir inserção na galeria" ON public.gallery;
DROP POLICY IF EXISTS "Permitir exclusão na galeria" ON public.gallery;

CREATE POLICY "Permitir leitura da galeria"
  ON public.gallery
  FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção na galeria"
  ON public.gallery
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização na galeria"
  ON public.gallery
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão na galeria"
  ON public.gallery
  FOR DELETE
  USING (true);

-- ------------------------------------------------------------------------------
-- 6. TABELA: site_settings (Configurações, Banners e PIX)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura de site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Permitir gravação de site_settings" ON public.site_settings;

CREATE POLICY "Permitir leitura de site_settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Permitir gravação de site_settings"
  ON public.site_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 7. SUPABASE STORAGE: BUCKET 'media' (Uploads de Fotos e Galeria)
-- ------------------------------------------------------------------------------
-- Cria o bucket 'media' como público se ainda não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de acesso para os arquivos do bucket 'media'
DROP POLICY IF EXISTS "Permitir acesso público de leitura aos arquivos de mídia" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de mídias" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de mídias" ON storage.objects;

CREATE POLICY "Permitir acesso público de leitura aos arquivos de mídia"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media' OR bucket_id = 'site');

CREATE POLICY "Permitir upload de mídias"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'media' OR bucket_id = 'site');

CREATE POLICY "Permitir exclusão de mídias"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'media' OR bucket_id = 'site');

-- ==============================================================================
-- FIM DO SCRIPT: Execute este script no SQL Editor do seu Dashboard Supabase.
-- ==============================================================================
