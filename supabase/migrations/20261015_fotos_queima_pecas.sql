-- Colunas para armazenar as URLs das imagens enviadas no detalhe da O.S.
ALTER TABLE public.ordens_servico
  ADD COLUMN IF NOT EXISTS fotos_queima text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS fotos_pecas_danificadas text[] DEFAULT '{}';

-- Garante o bucket (já usado em CreateOSForm) como público
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos_queima', 'fotos_queima', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso ao bucket para usuários autenticados
DROP POLICY IF EXISTS "fotos_queima_select" ON storage.objects;
CREATE POLICY "fotos_queima_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'fotos_queima');

DROP POLICY IF EXISTS "fotos_queima_insert" ON storage.objects;
CREATE POLICY "fotos_queima_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'fotos_queima');

DROP POLICY IF EXISTS "fotos_queima_delete" ON storage.objects;
CREATE POLICY "fotos_queima_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'fotos_queima');
