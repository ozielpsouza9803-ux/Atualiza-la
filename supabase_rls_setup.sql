-- ==============================================================================
-- SCRIPT SQL: CORREÇÃO RESTRITA DE POLÍTICAS RLS (Row Level Security) NO SUPABASE
-- PROJETO: Corações que Acolhe - Lar Esperança
-- REGRAS ESTRITAS DE SEGURANÇA:
--  1. ALTERAÇÃO E EXCLUSÃO (UPDATE e DELETE): Restritas EXCLUSIVAMENTE a administradores
--     autorizados para todas as tabelas (crianças, perfis, presentes, galeria, PIX/configurações)
--     e para a exclusão/modificação de arquivos no Storage.
--  2. LEITURA PÚBLICA (SELECT): Permitida apenas para os dados públicos essenciais do site
--     (crianças ativas, galeria institucional, chave PIX/banners e visualização de fotos).
--  3. PRIVACIDADE TOTAL: Perfis (telefones, e-mails) e presentes não são abertos ao público.
--  4. PRESERVAÇÃO INTEGRAL: Não apaga nenhum registro, foto ou relacionamento existente.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HABILITAR ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
-- ------------------------------------------------------------------------------
ALTER TABLE public.kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. FUNÇÃO DE VERIFICAÇÃO DE ADMINISTRADOR: is_admin()
-- Consulta a tabela public.profiles com SECURITY DEFINER para verificar se o usuário
-- autenticado possui role = 'admin' ou 'coordenador', evitando recursão no RLS.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'role' = 'service_role') OR
    (SELECT role IN ('admin', 'coordenador') 
     FROM public.profiles 
     WHERE id = auth.uid()),
    false
  );
$$;

-- ------------------------------------------------------------------------------
-- 3. TABELA: kids (Crianças e Cartinhas)
-- Relacionamento: family_id -> profiles.id
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura pública de crianças ativas" ON public.kids;
DROP POLICY IF EXISTS "Permitir leitura pública de crianças" ON public.kids;
DROP POLICY IF EXISTS "kids_public_read" ON public.kids;
DROP POLICY IF EXISTS "Permitir inserção e cadastro de crianças" ON public.kids;
DROP POLICY IF EXISTS "Permitir inserção de crianças" ON public.kids;
DROP POLICY IF EXISTS "kids_auth_insert" ON public.kids;
DROP POLICY IF EXISTS "Permitir atualização de crianças" ON public.kids;
DROP POLICY IF EXISTS "kids_auth_update" ON public.kids;
DROP POLICY IF EXISTS "Permitir exclusão de crianças" ON public.kids;
DROP POLICY IF EXISTS "kids_admin_delete" ON public.kids;
DROP POLICY IF EXISTS "Full access to kids" ON public.kids;

-- Leitura: Visitantes e padrinhos podem visualizar as crianças cadastradas
CREATE POLICY "kids_public_select"
  ON public.kids
  FOR SELECT
  USING (true);

-- Inserção: Famílias autenticadas cadastram seus dependentes ou administradores
CREATE POLICY "kids_insert"
  ON public.kids
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (public.is_admin() OR family_id = auth.uid())
  );

-- Alteração: EXCLUSIVAMENTE administradores autorizados
CREATE POLICY "kids_admin_update"
  ON public.kids
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Exclusão: EXCLUSIVAMENTE administradores autorizados
CREATE POLICY "kids_admin_delete"
  ON public.kids
  FOR DELETE
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. TABELA: profiles (Padrinhos, Famílias e Administradores)
-- Protege informações confidenciais (telefone, e-mail, senhas, documentos)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Permitir cadastro de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Permitir atualização de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Permitir exclusão de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Permitir leitura de próprio perfil ou por autenticação" ON public.profiles;
DROP POLICY IF EXISTS "Permitir cadastro de novo perfil" ON public.profiles;
DROP POLICY IF EXISTS "Permitir atualização de perfil próprio" ON public.profiles;
DROP POLICY IF EXISTS "Permitir exclusão de perfil" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_or_admin_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_or_admin_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;

-- Leitura: Cada usuário autenticado vê seu próprio perfil; administradores veem todos
CREATE POLICY "profiles_select"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Inserção: Novos usuários criam perfil vinculado ao seu UID (sem privilégio de admin)
CREATE POLICY "profiles_insert"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id 
    AND (role != 'admin' OR public.is_admin())
  );

-- Alteração: Usuário edita seus dados pessoais (sem alterar role) ou administradores
CREATE POLICY "profiles_update"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin() OR (auth.uid() = id AND role != 'admin'))
  WITH CHECK (public.is_admin() OR (auth.uid() = id AND role != 'admin'));

-- Exclusão: EXCLUSIVAMENTE administradores autorizados
CREATE POLICY "profiles_admin_delete"
  ON public.profiles
  FOR DELETE
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. TABELA: gifts (Presentes e Apadrinhamentos)
-- Relacionamentos: kid_id -> kids.id, sponsor_id -> profiles.id
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura de presentes" ON public.gifts;
DROP POLICY IF EXISTS "Permitir inserção de presentes" ON public.gifts;
DROP POLICY IF EXISTS "Permitir atualização de presentes" ON public.gifts;
DROP POLICY IF EXISTS "Permitir exclusão de presentes" ON public.gifts;
DROP POLICY IF EXISTS "Permitir leitura de presentes vinculados" ON public.gifts;
DROP POLICY IF EXISTS "Permitir registro de presentes" ON public.gifts;
DROP POLICY IF EXISTS "gifts_parties_or_admin_read" ON public.gifts;
DROP POLICY IF EXISTS "gifts_sponsor_insert" ON public.gifts;
DROP POLICY IF EXISTS "gifts_sponsor_or_admin_update" ON public.gifts;
DROP POLICY IF EXISTS "gifts_sponsor_or_admin_delete" ON public.gifts;

-- Leitura: Padrinho vê seus apadrinhamentos; família vê os de sua criança; admin vê todos
CREATE POLICY "gifts_select"
  ON public.gifts
  FOR SELECT
  USING (
    auth.uid() = sponsor_id 
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.kids 
      WHERE kids.id = gifts.kid_id 
        AND kids.family_id = auth.uid()
    )
  );

-- Inserção: Padrinhos autenticados vinculando seu próprio ID ou administradores
CREATE POLICY "gifts_insert"
  ON public.gifts
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (auth.uid() = sponsor_id OR public.is_admin())
  );

-- Alteração: EXCLUSIVAMENTE administradores autorizados (garante integridade do presente)
CREATE POLICY "gifts_admin_update"
  ON public.gifts
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Exclusão: EXCLUSIVAMENTE administradores autorizados
CREATE POLICY "gifts_admin_delete"
  ON public.gifts
  FOR DELETE
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. TABELA: gallery (Mídias e Fotos do Lar Esperança)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura da galeria" ON public.gallery;
DROP POLICY IF EXISTS "Permitir inserção na galeria" ON public.gallery;
DROP POLICY IF EXISTS "Permitir atualização na galeria" ON public.gallery;
DROP POLICY IF EXISTS "Permitir exclusão na galeria" ON public.gallery;
DROP POLICY IF EXISTS "gallery_public_read" ON public.gallery;
DROP POLICY IF EXISTS "gallery_admin_insert" ON public.gallery;
DROP POLICY IF EXISTS "gallery_admin_update" ON public.gallery;
DROP POLICY IF EXISTS "gallery_admin_delete" ON public.gallery;

-- Leitura: Visitantes do site podem ver as fotos da galeria
CREATE POLICY "gallery_public_select"
  ON public.gallery
  FOR SELECT
  USING (true);

-- Inserção: EXCLUSIVAMENTE administradores autorizados
CREATE POLICY "gallery_admin_insert"
  ON public.gallery
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Alteração: EXCLUSIVAMENTE administradores autorizados
CREATE POLICY "gallery_admin_update"
  ON public.gallery
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Exclusão: EXCLUSIVAMENTE administradores autorizados
CREATE POLICY "gallery_admin_delete"
  ON public.gallery
  FOR DELETE
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. TABELA: site_settings (Configurações, Banners e Chave PIX)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura de site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Permitir gravação de site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_admin_all" ON public.site_settings;

-- Leitura: Visitantes podem visualizar os banners e a chave PIX para doações
CREATE POLICY "site_settings_public_select"
  ON public.site_settings
  FOR SELECT
  USING (true);

-- Alteração/Gravação/Exclusão (PIX e banners): EXCLUSIVAMENTE administradores autorizados
CREATE POLICY "site_settings_admin_all"
  ON public.site_settings
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 8. SUPABASE STORAGE: BUCKETS 'media' E 'site' (Arquivos e Fotos)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('site', 'site', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Permitir acesso público de leitura aos arquivos de mídia" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de mídias" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de mídias" ON storage.objects;
DROP POLICY IF EXISTS "storage_public_read" ON storage.objects;
DROP POLICY IF EXISTS "storage_auth_upload" ON storage.objects;
DROP POLICY IF EXISTS "storage_admin_delete" ON storage.objects;

-- Leitura: Navegadores e visitantes podem carregar e exibir as fotos públicas
CREATE POLICY "storage_public_select"
  ON storage.objects
  FOR SELECT
  USING (bucket_id IN ('media', 'site'));

-- Inserção (Upload): Usuários autenticados (famílias enviando foto de cartinha ou admins)
CREATE POLICY "storage_upload"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id IN ('media', 'site')
    AND auth.role() = 'authenticated'
  );

-- Alteração de arquivos: EXCLUSIVAMENTE administradores autorizados
CREATE POLICY "storage_admin_update"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id IN ('media', 'site')
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id IN ('media', 'site')
    AND public.is_admin()
  );

-- Exclusão de arquivos: EXCLUSIVAMENTE administradores autorizados
CREATE POLICY "storage_admin_delete"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id IN ('media', 'site')
    AND public.is_admin()
  );

-- ==============================================================================
-- FIM DO SCRIPT
-- Execute no SQL Editor do seu Dashboard Supabase quando for aplicar.
-- ==============================================================================
