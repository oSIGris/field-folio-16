-- =====================================================================
-- ENUMS
-- =====================================================================
CREATE TYPE public.org_role AS ENUM ('admin', 'gestor', 'consulta');
CREATE TYPE public.socio_tipo AS ENUM ('persona_fisica', 'persona_juridica');

-- =====================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================================
-- TABLE: cooperatives (tenant / empresa)
-- =====================================================================
CREATE TABLE public.cooperatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  cif TEXT,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  municipio TEXT,
  provincia TEXT,
  codigo_postal TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cooperatives TO authenticated;
GRANT ALL ON public.cooperatives TO service_role;

-- =====================================================================
-- TABLE: profiles
-- =====================================================================
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- =====================================================================
-- TABLE: organization_members (user <-> cooperative + role)
-- =====================================================================
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cooperative_id UUID NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  role public.org_role NOT NULL DEFAULT 'consulta',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, cooperative_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_members TO authenticated;
GRANT ALL ON public.organization_members TO service_role;

CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_coop ON public.organization_members(cooperative_id);

-- =====================================================================
-- SECURITY DEFINER HELPERS (avoid RLS recursion)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _cooperative_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND cooperative_id = _cooperative_id
  );
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(_user_id UUID, _cooperative_id UUID, _roles public.org_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id
      AND cooperative_id = _cooperative_id
      AND role = ANY(_roles)
  );
$$;

-- =====================================================================
-- TABLE: socios
-- =====================================================================
CREATE TABLE public.socios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cooperative_id UUID NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  codigo_socio TEXT,
  tipo public.socio_tipo NOT NULL DEFAULT 'persona_fisica',
  nif TEXT,
  nombre TEXT,
  apellidos TEXT,
  razon_social TEXT,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  municipio TEXT,
  provincia TEXT,
  codigo_postal TEXT,
  iban TEXT,
  fecha_alta DATE,
  fecha_baja DATE,
  activo BOOLEAN NOT NULL DEFAULT true,
  notas TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.socios TO authenticated;
GRANT ALL ON public.socios TO service_role;

CREATE INDEX idx_socios_coop ON public.socios(cooperative_id);
CREATE INDEX idx_socios_activo ON public.socios(cooperative_id, activo);
CREATE INDEX idx_socios_codigo ON public.socios(cooperative_id, codigo_socio);
CREATE INDEX idx_socios_nif ON public.socios(cooperative_id, nif);

-- =====================================================================
-- UPDATED_AT TRIGGERS
-- =====================================================================
CREATE TRIGGER trg_coops_updated BEFORE UPDATE ON public.cooperatives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_org_members_updated BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_socios_updated BEFORE UPDATE ON public.socios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', NEW.raw_user_meta_data ->> 'full_name'),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- ENABLE RLS
-- =====================================================================
ALTER TABLE public.cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.socios ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- RLS POLICIES: profiles
-- =====================================================================
CREATE POLICY "Users manage own profile"
  ON public.profiles FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =====================================================================
-- RLS POLICIES: cooperatives
-- =====================================================================
CREATE POLICY "Members view their cooperatives"
  ON public.cooperatives FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), id));

CREATE POLICY "Authenticated can create cooperatives"
  ON public.cooperatives FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins update their cooperatives"
  ON public.cooperatives FOR UPDATE TO authenticated
  USING (public.has_org_role(auth.uid(), id, ARRAY['admin']::public.org_role[]))
  WITH CHECK (public.has_org_role(auth.uid(), id, ARRAY['admin']::public.org_role[]));

CREATE POLICY "Admins delete their cooperatives"
  ON public.cooperatives FOR DELETE TO authenticated
  USING (public.has_org_role(auth.uid(), id, ARRAY['admin']::public.org_role[]));

-- =====================================================================
-- RLS POLICIES: organization_members
-- =====================================================================
CREATE POLICY "Members view memberships in their coops"
  ON public.organization_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_org_member(auth.uid(), cooperative_id));

CREATE POLICY "Users can create their own first membership"
  ON public.organization_members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin']::public.org_role[])
  );

CREATE POLICY "Admins update memberships"
  ON public.organization_members FOR UPDATE TO authenticated
  USING (public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin']::public.org_role[]))
  WITH CHECK (public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin']::public.org_role[]));

CREATE POLICY "Admins delete memberships"
  ON public.organization_members FOR DELETE TO authenticated
  USING (public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin']::public.org_role[]));

-- =====================================================================
-- RLS POLICIES: socios
-- =====================================================================
CREATE POLICY "Members view socios of their coops"
  ON public.socios FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), cooperative_id));

CREATE POLICY "Editors create socios"
  ON public.socios FOR INSERT TO authenticated
  WITH CHECK (public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin','gestor']::public.org_role[]));

CREATE POLICY "Editors update socios"
  ON public.socios FOR UPDATE TO authenticated
  USING (public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin','gestor']::public.org_role[]))
  WITH CHECK (public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin','gestor']::public.org_role[]));

CREATE POLICY "Editors delete socios"
  ON public.socios FOR DELETE TO authenticated
  USING (public.has_org_role(auth.uid(), cooperative_id, ARRAY['admin','gestor']::public.org_role[]));