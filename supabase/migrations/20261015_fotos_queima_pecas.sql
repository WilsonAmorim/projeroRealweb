-- 1. Garante as colunas na tabela ordens_servico
ALTER TABLE public.ordens_servico
  ADD COLUMN IF NOT EXISTS fotos_queima text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS fotos_pecas_danificadas text[] DEFAULT '{}';

-- 2. Garante o bucket fotos_queima como público
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos_queima', 'fotos_queima', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Remove políticas antigas que possam estar bloqueando o upload
DROP POLICY IF EXISTS "fotos_queima_select" ON storage.objects;
DROP POLICY IF EXISTS "fotos_queima_insert" ON storage.objects;
DROP POLICY IF EXISTS "fotos_queima_update" ON storage.objects;
DROP POLICY IF EXISTS "fotos_queima_delete" ON storage.objects;

-- 4. Cria políticas públicas permissivas para o bucket fotos_queima (permite upload e visualização para todos)
CREATE POLICY "fotos_queima_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'fotos_queima');

CREATE POLICY "fotos_queima_insert" ON storage.objects
  FOR INSERT TO public
  WITH CHECK (bucket_id = 'fotos_queima');

CREATE POLICY "fotos_queima_update" ON storage.objects
  FOR UPDATE TO public
  USING (bucket_id = 'fotos_queima')
  WITH CHECK (bucket_id = 'fotos_queima');

CREATE POLICY "fotos_queima_delete" ON storage.objects
  FOR DELETE TO public
  USING (bucket_id = 'fotos_queima');
