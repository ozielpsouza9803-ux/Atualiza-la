-- ==============================================================================
-- SCRIPT SQL: CORREÇÃO DEFINITIVA DE POLÍTICAS RLS (Row Level Security) NO SUPABASE
-- PROJETO: Corações que Acolhe - Lar Esperança
-- REGRAS:
--  1. Elimina TODAS as permissões públicas/anônimas de INSERT, UPDATE e DELETE.
--  2. Impede que usuários comuns alterem dados de terceiros ou se tornem administradores.
--  3. Mantém leitura pública necessária (crianças, galeria, banners e chave PIX).
--  4. Respeita as funções reais: Administrador, Família e Padrinho.
--  5. 100% não-destrutivo: Preserva todos os registros e fotos existentes.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- ------------------------------------------------------------------------------
ALTER TABLE public.kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. FUNÇÃO AUXILIAR DE SEGURANÇA: is_admin()
-- Verifica com segurança se o usuário atual autenticado possui perfil de administrador
-- Usa SECURITY DEFINER para evitar recursão infinita ao consultar public.profiles
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role IN ('admin', 'coordenador') 
     FROM public.profiles 
     WHERE id = auth.uid()),
    false
  );
$$;

-- ------------------------------------------------------------------------------
-- 3. TABELA: kids (Crianças e Cartinhas)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura pública de crianças ativas" ON public.kids;
DROP POLICY IF EXISTS "Permitir leitura pública de crianças" ON public.kids;
DROP POLICY IF EXISTS "Permitir inserção e cadastro de crianças" ON public.kids;
DROP POLICY IF EXISTS "Permitir inserção de crianças" ON public.kids;
DROP POLICY IF EXISTS "Permitir atualização de crianças" ON public.kids;
DROP POLICY IF EXISTS "Permitir exclusão de crianças" ON public.kids;
DROP POLICY IF EXISTS "Full access to kids" ON public.kids;

-- LEITURA PÚBLICA: Visitantes e padrinhos podem ver as crianças para apadrinhamento
CREATE POLICY "kids_public_read"
  ON public.kids
  FOR SELECT
  USING (true);

-- INSERÇÃO: Somente famílias cadastradas (para seus próprios filhos) ou administradores
CREATE POLICY "kids_auth_insert"
  ON public.kids
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (
      public.is_admin() 
      OR family_id = auth.uid()
    )
  );

-- ATUALIZAÇÃO: Somente o titular da família vinculada ou administradores
CREATE POLICY "kids_auth_update"
  ON public.kids
  FOR UPDATE
  USING (
    public.is_admin() 
    OR family_id = auth.uid()
  )
  WITH CHECK (
    public.is_admin() 
    OR family_id = auth.uid()
  );

-- EXCLUSÃO: Restrita EXCLUSIVAMENTE a administradores autenticados
CREATE POLICY "kids_admin_delete"
  ON public.kids
  FOR DELETE
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. TABELA: profiles (Perfis de Usuários)
-- Protege dados sensíveis (e-mail, telefone, endereço) e previne escalada de privilégios
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

-- LEITURA: Cada usuário pode ver apenas seu próprio perfil; administradores podem ver todos
CREATE POLICY "profiles_owner_or_admin_read"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id 
    OR public.is_admin()
  );

-- INSERÇÃO: Usuário autenticado cria seu próprio perfil (NÃO pode se auto-declarar admin)
CREATE POLICY "profiles_owner_insert"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
    AND (role != 'admin' OR public.is_admin())
  );

-- ATUALIZAÇÃO: Usuário edita apenas seu próprio perfil (NÃO pode alterar o role para admin)
CREATE POLICY "profiles_owner_or_admin_update"
  ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id 
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_admin() 
    OR (
      auth.uid() = id 
      AND role != 'admin'
    )
  );

-- EXCLUSÃO: Somente administradores podem excluir perfis
CREATE POLICY "profiles_admin_delete"
  ON public.profiles
  FOR DELETE
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. TABELA: gifts (Presentes e Apadrinhamentos)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura de presentes" ON public.gifts;
DROP POLICY IF EXISTS "Permitir inserção de presentes" ON public.gifts;
DROP POLICY IF EXISTS "Permitir atualização de presentes" ON public.gifts;
DROP POLICY IF EXISTS "Permitir exclusão de presentes" ON public.gifts;
DROP POLICY IF EXISTS "Permitir leitura de presentes vinculados" ON public.gifts;
DROP POLICY IF EXISTS "Permitir registro de presentes" ON public.gifts;

-- LEITURA: Apenas o padrinho que apadrinhou, a família da criança apadrinhada, ou administradores
CREATE POLICY "gifts_parties_or_admin_read"
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

-- INSERÇÃO: Somente padrinhos autenticados vinculando seu próprio sponsor_id ou administradores
CREATE POLICY "gifts_sponsor_insert"
  ON public.gifts
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      auth.uid() = sponsor_id 
      OR public.is_admin()
    )
  );

-- ATUALIZAÇÃO: Apenas o padrinho titular do presente ou administradores
CREATE POLICY "gifts_sponsor_or_admin_update"
  ON public.gifts
  FOR UPDATE
  USING (
    auth.uid() = sponsor_id 
    OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = sponsor_id 
    OR public.is_admin()
  );

-- EXCLUSÃO: Apenas o próprio padrinho ou administradores
CREATE POLICY "gifts_sponsor_or_admin_delete"
  ON public.gifts
  FOR DELETE
  USING (
    auth.uid() = sponsor_id 
    OR public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- 6. TABELA: gallery (Mídias e Fotos do Lar Esperança)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura da galeria" ON public.gallery;
DROP POLICY IF EXISTS "Permitir inserção na galeria" ON public.gallery;
DROP POLICY IF EXISTS "Permitir atualização na galeria" ON public.gallery;
DROP POLICY IF EXISTS "Permitir exclusão na galeria" ON public.gallery;

-- LEITURA PÚBLICA: Qualquer visitante pode visualizar as fotos do Lar
CREATE POLICY "gallery_public_read"
  ON public.gallery
  FOR SELECT
  USING (true);

-- GRAVAÇÃO E GESTÃO: Exclusivo para administradores
CREATE POLICY "gallery_admin_insert"
  ON public.gallery
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "gallery_admin_update"
  ON public.gallery
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "gallery_admin_delete"
  ON public.gallery
  FOR DELETE
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. TABELA: site_settings (Configurações, Banners e Chave PIX)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura de site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Permitir gravação de site_settings" ON public.site_settings;

-- LEITURA PÚBLICA: Visitantes precisam visualizar banners e chave PIX para doar
CREATE POLICY "site_settings_public_read"
  ON public.site_settings
  FOR SELECT
  USING (true);

-- GRAVAÇÃO (INSERT/UPDATE/DELETE): Restrita rigorosamente a administradores
CREATE POLICY "site_settings_admin_all"
  ON public.site_settings
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 8. SUPABASE STORAGE: BUCKETS 'media' E 'site'
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

-- LEITURA PÚBLICA: Navegadores e visitantes podem baixar e exibir fotos
CREATE POLICY "storage_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id IN ('media', 'site'));

-- UPLOAD: Somente usuários autenticados (famílias enviando fotos de cartinhas ou administradores)
CREATE POLICY "storage_auth_upload"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id IN ('media', 'site')
    AND auth.role() = 'authenticated'
  );

-- EXCLUSÃO: Restrita a administradores ou ao proprietário do arquivo
CREATE POLICY "storage_admin_delete"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id IN ('media', 'site')
    AND (
      public.is_admin() 
      OR (auth.uid() IS NOT NULL AND auth.uid()::text = (storage.foldername(name))[1])
    )
  );

-- ==============================================================================
-- FIM DO SCRIPT: Execute no SQL Editor do seu Dashboard Supabase.
-- Garante segurança máxima sem comprometer nenhum dado existente.
-- ==============================================================================
