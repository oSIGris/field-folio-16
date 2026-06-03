-- =====================================================================
-- SOLID MULTI-TENANT FOUNDATION: PAC FIELDS, SOFT DELETE AND SOCIO PORTAL
-- =====================================================================
-- This migration keeps the Lovable block-1 schema compatible while moving
-- the ERP toward the real Access/PAC workflow and a safe farmer portal model.

-- ---------------------------------------------------------------------
-- Socios: Access/PAC-style columns and operational metadata
-- ---------------------------------------------------------------------
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS nif_cif TEXT;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS telefono_1 TEXT;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS telefono_2 TEXT;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS fecha_aviso DATE;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS subvencion BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS alta BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS baja BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS traspaso BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS p6_p7 TEXT;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS finaliza BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS registra BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS cuaderno BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS ayudas_borras BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS cooperativa_codigo TEXT;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS observaciones TEXT;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS observaciones_2025 TEXT;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS poblacion TEXT;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Backfill the new working columns from Lovable's initial generic fields.
UPDATE public.socios
SET
  nif_cif = COALESCE(NULLIF(nif_cif, ''), nif),
  telefono_1 = COALESCE(NULLIF(telefono_1, ''), telefono),
  poblacion = COALESCE(NULLIF(poblacion, ''), municipio),
  observaciones = COALESCE(NULLIF(observaciones, ''), notas)
WHERE
  nif_cif IS NULL
  OR telefono_1 IS NULL
  OR poblacion IS NULL
  OR observaciones IS NULL;

-- Stable constraints/indexes for 3000+ row grids and imports.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'socios_id_cooperative_unique'
      AND conrelid = 'public.socios'::regclass
  ) THEN
    ALTER TABLE public.socios
      ADD CONSTRAINT socios_id_cooperative_unique UNIQUE (id, cooperative_id);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_socios_coop_nif_cif_unique
  ON public.socios (cooperative_id, lower(nif_cif))
  WHERE nif_cif IS NOT NULL AND btrim(nif_cif) <> '' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_socios_grid_active
  ON public.socios (cooperative_id, deleted_at, baja, alta, subvencion);
CREATE INDEX IF NOT EXISTS idx_socios_poblacion
  ON public.socios (cooperative_id, poblacion)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_socios_fecha_aviso
  ON public.socios (cooperative_id, fecha_aviso)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_socios_updated_at
  ON public.socios (cooperative_id, updated_at DESC)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------
-- Farmer/socio portal access
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'socio_user_status'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.socio_user_status AS ENUM ('active', 'invited', 'disabled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.socio_user_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cooperative_id UUID NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  socio_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.socio_user_status NOT NULL DEFAULT 'active',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, socio_id),
  CONSTRAINT socio_user_access_socio_coop_fkey
    FOREIGN KEY (socio_id, cooperative_id)
    REFERENCES public.socios(id, cooperative_id)
    ON DELETE CASCADE
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.socio_user_access TO authenticated;
GRANT ALL ON public.socio_user_access TO service_role;

CREATE INDEX IF NOT EXISTS idx_socio_user_access_user
  ON public.socio_user_access (user_id, status);
CREATE INDEX IF NOT EXISTS idx_socio_user_access_coop
  ON public.socio_user_access (cooperative_id, socio_id, status);

CREATE TRIGGER trg_socio_user_access_updated
  BEFORE UPDATE ON public.socio_user_access
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.socio_user_access ENABLE ROW LEVEL SECURITY;

-- A linked farmer can view only their own access row.
CREATE POLICY "Socio users view own access"
  ON public.socio_user_access FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Internal users can view portal links for cooperatives they manage/work on.
CREATE POLICY "Editors view socio access"
  ON public.socio_user_access FOR SELECT TO authenticated
  USING (public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin','gestor']::public.org_role[]));

-- Only cooperative admins can create/update/delete portal links.
CREATE POLICY "Admins create socio access"
  ON public.socio_user_access FOR INSERT TO authenticated
  WITH CHECK (public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin']::public.org_role[]));

CREATE POLICY "Admins update socio access"
  ON public.socio_user_access FOR UPDATE TO authenticated
  USING (public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin']::public.org_role[]))
  WITH CHECK (public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin']::public.org_role[]));

CREATE POLICY "Admins delete socio access"
  ON public.socio_user_access FOR DELETE TO authenticated
  USING (public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin']::public.org_role[]));

-- Helper used by socios RLS so farmer accounts can read their own ficha only.
CREATE OR REPLACE FUNCTION public.is_socio_user(_user_id UUID, _socio_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.socio_user_access sua
    WHERE sua.user_id = _user_id
      AND sua.socio_id = _socio_id
      AND sua.status = 'active'
  );
$$;

REVOKE ALL ON FUNCTION public.is_socio_user(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_socio_user(uuid, uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- RLS hardening
-- ---------------------------------------------------------------------
-- Prevent users from self-adding to an existing cooperative. Onboarding uses
-- create_cooperative(), a SECURITY DEFINER RPC, so the first admin still works.
DROP POLICY IF EXISTS "Users can create their own first membership" ON public.organization_members;

CREATE POLICY "Admins create memberships"
  ON public.organization_members FOR INSERT TO authenticated
  WITH CHECK (public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin']::public.org_role[]));

-- Socios can be read by internal members OR by the linked farmer account.
DROP POLICY IF EXISTS "Members view socios of their coops" ON public.socios;

CREATE POLICY "Members and linked socios view socios"
  ON public.socios FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      public.is_org_member(auth.uid(), cooperative_id)
      OR public.is_socio_user(auth.uid(), id)
    )
  );

-- Hard deletes are disabled for authenticated users. The app now soft-deletes
-- by setting deleted_at through the UPDATE policy.
DROP POLICY IF EXISTS "Editors delete socios" ON public.socios;
