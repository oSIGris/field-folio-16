-- =====================================================================
-- SOCIO ATTACHMENTS + WHATSAPP PHONE FOUNDATION
-- =====================================================================
-- Attachments are stored in a private Supabase Storage bucket and indexed in
-- public.attachments. The bucket path format is:
--   {cooperative_id}/{socio_id}/{attachment_id}/{file_name}

-- ---------------------------------------------------------------------
-- Future WhatsApp lookup foundation
-- ---------------------------------------------------------------------
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS whatsapp_phone_e164 TEXT;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS whatsapp_opt_in_at TIMESTAMPTZ;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS whatsapp_last_interaction_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_socios_whatsapp_phone_e164
  ON public.socios (whatsapp_phone_e164)
  WHERE whatsapp_phone_e164 IS NOT NULL AND deleted_at IS NULL;

COMMENT ON COLUMN public.socios.whatsapp_phone_e164 IS
  'Future WhatsApp lookup number in E.164 format, for example +34600111222.';
COMMENT ON COLUMN public.socios.whatsapp_opt_in IS
  'Explicit consent flag for future WhatsApp interactions.';

-- ---------------------------------------------------------------------
-- Document types
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cooperative_id UUID REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT document_types_code_not_empty CHECK (btrim(code) <> ''),
  CONSTRAINT document_types_name_not_empty CHECK (btrim(name) <> '')
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_types TO authenticated;
GRANT ALL ON public.document_types TO service_role;

CREATE UNIQUE INDEX IF NOT EXISTS idx_document_types_global_code_unique
  ON public.document_types (lower(code))
  WHERE cooperative_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_types_coop_code_unique
  ON public.document_types (cooperative_id, lower(code))
  WHERE cooperative_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_document_types_visible
  ON public.document_types (cooperative_id, active, sort_order);

DROP TRIGGER IF EXISTS trg_document_types_updated ON public.document_types;
CREATE TRIGGER trg_document_types_updated
  BEFORE UPDATE ON public.document_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members view document types" ON public.document_types;
CREATE POLICY "Members view document types"
  ON public.document_types FOR SELECT TO authenticated
  USING (
    cooperative_id IS NULL
    OR public.is_org_member(auth.uid(), cooperative_id)
  );

DROP POLICY IF EXISTS "Admins create document types" ON public.document_types;
CREATE POLICY "Admins create document types"
  ON public.document_types FOR INSERT TO authenticated
  WITH CHECK (
    cooperative_id IS NOT NULL
    AND public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin']::public.org_role[])
  );

DROP POLICY IF EXISTS "Admins update document types" ON public.document_types;
CREATE POLICY "Admins update document types"
  ON public.document_types FOR UPDATE TO authenticated
  USING (
    cooperative_id IS NOT NULL
    AND public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin']::public.org_role[])
  )
  WITH CHECK (
    cooperative_id IS NOT NULL
    AND public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin']::public.org_role[])
  );

DROP POLICY IF EXISTS "Admins delete document types" ON public.document_types;
CREATE POLICY "Admins delete document types"
  ON public.document_types FOR DELETE TO authenticated
  USING (
    cooperative_id IS NOT NULL
    AND public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin']::public.org_role[])
  );

INSERT INTO public.document_types (code, name, sort_order)
SELECT v.code, v.name, v.sort_order
FROM (VALUES
  ('dni_nif', 'DNI/NIF', 10),
  ('certificado', 'Certificado', 20),
  ('pac', 'Documento PAC', 30),
  ('ayuda', 'Documento de ayuda', 40),
  ('contrato', 'Contrato', 50),
  ('factura', 'Factura', 60),
  ('otro', 'Otro', 999)
) AS v(code, name, sort_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.document_types dt
  WHERE dt.cooperative_id IS NULL
    AND lower(dt.code) = lower(v.code)
);

-- ---------------------------------------------------------------------
-- Attachments metadata
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cooperative_id UUID NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  socio_id UUID NOT NULL,
  document_type_id UUID REFERENCES public.document_types(id) ON DELETE SET NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'socio-attachments',
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT attachments_socio_coop_fkey
    FOREIGN KEY (socio_id, cooperative_id)
    REFERENCES public.socios(id, cooperative_id)
    ON DELETE CASCADE,
  CONSTRAINT attachments_bucket_check CHECK (storage_bucket = 'socio-attachments'),
  CONSTRAINT attachments_file_name_not_empty CHECK (btrim(file_name) <> ''),
  CONSTRAINT attachments_storage_path_not_empty CHECK (btrim(storage_path) <> '')
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.attachments TO authenticated;
GRANT ALL ON public.attachments TO service_role;

CREATE UNIQUE INDEX IF NOT EXISTS idx_attachments_storage_path_unique
  ON public.attachments (storage_bucket, storage_path);
CREATE INDEX IF NOT EXISTS idx_attachments_socio_active
  ON public.attachments (cooperative_id, socio_id, uploaded_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_attachments_document_type
  ON public.attachments (document_type_id)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_attachments_updated ON public.attachments;
CREATE TRIGGER trg_attachments_updated
  BEFORE UPDATE ON public.attachments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members and linked socios view attachments" ON public.attachments;
CREATE POLICY "Members and linked socios view attachments"
  ON public.attachments FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      public.is_org_member(auth.uid(), cooperative_id)
      OR public.is_socio_user(auth.uid(), socio_id)
    )
  );

DROP POLICY IF EXISTS "Editors create attachments" ON public.attachments;
CREATE POLICY "Editors create attachments"
  ON public.attachments FOR INSERT TO authenticated
  WITH CHECK (
    deleted_at IS NULL
    AND uploaded_by = auth.uid()
    AND public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin','gestor']::public.org_role[])
  );

DROP POLICY IF EXISTS "Editors update attachments" ON public.attachments;
CREATE POLICY "Editors update attachments"
  ON public.attachments FOR UPDATE TO authenticated
  USING (public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin','gestor']::public.org_role[]))
  WITH CHECK (public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin','gestor']::public.org_role[]));

-- No hard-delete policy. Important documents are hidden with deleted_at.

-- ---------------------------------------------------------------------
-- Storage bucket and object policies
-- ---------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'socio-attachments',
  'socio-attachments',
  false,
  26214400,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE OR REPLACE FUNCTION public.uuid_or_null(_value TEXT)
RETURNS UUID
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN _value::uuid;
EXCEPTION WHEN invalid_text_representation THEN
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.uuid_or_null(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.uuid_or_null(text) TO authenticated;

DROP POLICY IF EXISTS "Editors upload socio attachments" ON storage.objects;
CREATE POLICY "Editors upload socio attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'socio-attachments'
    AND public.has_org_role(
      auth.uid(),
      public.uuid_or_null((storage.foldername(name))[1]),
      ARRAY['admin','gestor']::public.org_role[]
    )
  );

DROP POLICY IF EXISTS "Users read permitted socio attachments" ON storage.objects;
CREATE POLICY "Users read permitted socio attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'socio-attachments'
    AND EXISTS (
      SELECT 1
      FROM public.attachments a
      WHERE a.storage_bucket = storage.objects.bucket_id
        AND a.storage_path = storage.objects.name
        AND a.deleted_at IS NULL
        AND (
          public.is_org_member(auth.uid(), a.cooperative_id)
          OR public.is_socio_user(auth.uid(), a.socio_id)
        )
    )
  );
