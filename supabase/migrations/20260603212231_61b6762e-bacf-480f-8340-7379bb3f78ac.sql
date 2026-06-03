
-- ============ ENUMS ============
DO $$ BEGIN
  CREATE TYPE public.aid_application_status AS ENUM (
    'pendiente','en_revision','falta_documentacion','presentado',
    'subsanacion','aprobado','rechazado','finalizado'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.custom_field_scope AS ENUM ('socio','aid_application');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.custom_field_type AS ENUM (
    'text','number','date','boolean','select','multiselect',
    'currency','percentage','long_text'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============ aid_campaigns ============
CREATE TABLE IF NOT EXISTS public.aid_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cooperative_id uuid NOT NULL,
  name text NOT NULL,
  year integer,
  starts_on date,
  ends_on date,
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  archived_by uuid,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aid_campaigns TO authenticated;
GRANT ALL ON public.aid_campaigns TO service_role;
ALTER TABLE public.aid_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view campaigns" ON public.aid_campaigns
  FOR SELECT TO authenticated
  USING (is_org_member(auth.uid(), cooperative_id));
CREATE POLICY "Editors create campaigns" ON public.aid_campaigns
  FOR INSERT TO authenticated
  WITH CHECK (has_org_role(auth.uid(), cooperative_id, ARRAY['admin'::org_role,'gestor'::org_role]));
CREATE POLICY "Editors update campaigns" ON public.aid_campaigns
  FOR UPDATE TO authenticated
  USING (has_org_role(auth.uid(), cooperative_id, ARRAY['admin'::org_role,'gestor'::org_role]))
  WITH CHECK (has_org_role(auth.uid(), cooperative_id, ARRAY['admin'::org_role,'gestor'::org_role]));

CREATE TRIGGER trg_aid_campaigns_updated
  BEFORE UPDATE ON public.aid_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_aid_campaigns_coop ON public.aid_campaigns(cooperative_id);

-- ============ aid_types ============
CREATE TABLE IF NOT EXISTS public.aid_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cooperative_id uuid NOT NULL,
  code text,
  name text NOT NULL,
  description text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  archived_by uuid,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aid_types TO authenticated;
GRANT ALL ON public.aid_types TO service_role;
ALTER TABLE public.aid_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view aid types" ON public.aid_types
  FOR SELECT TO authenticated
  USING (is_org_member(auth.uid(), cooperative_id));
CREATE POLICY "Editors create aid types" ON public.aid_types
  FOR INSERT TO authenticated
  WITH CHECK (has_org_role(auth.uid(), cooperative_id, ARRAY['admin'::org_role,'gestor'::org_role]));
CREATE POLICY "Editors update aid types" ON public.aid_types
  FOR UPDATE TO authenticated
  USING (has_org_role(auth.uid(), cooperative_id, ARRAY['admin'::org_role,'gestor'::org_role]))
  WITH CHECK (has_org_role(auth.uid(), cooperative_id, ARRAY['admin'::org_role,'gestor'::org_role]));

CREATE TRIGGER trg_aid_types_updated
  BEFORE UPDATE ON public.aid_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_aid_types_coop ON public.aid_types(cooperative_id);

-- ============ aid_applications ============
CREATE TABLE IF NOT EXISTS public.aid_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cooperative_id uuid NOT NULL,
  socio_id uuid NOT NULL,
  campaign_id uuid,
  aid_type_id uuid,
  title text,
  status public.aid_application_status NOT NULL DEFAULT 'pendiente',
  assigned_to uuid,
  due_date date,
  submitted_at timestamptz,
  resolved_at timestamptz,
  notes text,
  created_by uuid,
  updated_by uuid,
  archived_by uuid,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aid_applications TO authenticated;
GRANT ALL ON public.aid_applications TO service_role;
ALTER TABLE public.aid_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members and linked socios view applications" ON public.aid_applications
  FOR SELECT TO authenticated
  USING (
    is_org_member(auth.uid(), cooperative_id)
    OR is_socio_user(auth.uid(), socio_id)
  );
CREATE POLICY "Editors create applications" ON public.aid_applications
  FOR INSERT TO authenticated
  WITH CHECK (has_org_role(auth.uid(), cooperative_id, ARRAY['admin'::org_role,'gestor'::org_role]));
CREATE POLICY "Editors update applications" ON public.aid_applications
  FOR UPDATE TO authenticated
  USING (has_org_role(auth.uid(), cooperative_id, ARRAY['admin'::org_role,'gestor'::org_role]))
  WITH CHECK (has_org_role(auth.uid(), cooperative_id, ARRAY['admin'::org_role,'gestor'::org_role]));

CREATE TRIGGER trg_aid_applications_updated
  BEFORE UPDATE ON public.aid_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_aid_applications_coop ON public.aid_applications(cooperative_id);
CREATE INDEX IF NOT EXISTS idx_aid_applications_socio ON public.aid_applications(socio_id);

-- ============ custom_fields ============
CREATE TABLE IF NOT EXISTS public.custom_fields (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cooperative_id uuid NOT NULL,
  scope public.custom_field_scope NOT NULL,
  name text NOT NULL,
  key text NOT NULL,
  field_type public.custom_field_type NOT NULL DEFAULT 'text',
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  required boolean NOT NULL DEFAULT false,
  visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  description text,
  created_by uuid,
  archived_by uuid,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cooperative_id, scope, key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_fields TO authenticated;
GRANT ALL ON public.custom_fields TO service_role;
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view custom fields" ON public.custom_fields
  FOR SELECT TO authenticated
  USING (is_org_member(auth.uid(), cooperative_id));
CREATE POLICY "Editors create custom fields" ON public.custom_fields
  FOR INSERT TO authenticated
  WITH CHECK (has_org_role(auth.uid(), cooperative_id, ARRAY['admin'::org_role,'gestor'::org_role]));
CREATE POLICY "Editors update custom fields" ON public.custom_fields
  FOR UPDATE TO authenticated
  USING (has_org_role(auth.uid(), cooperative_id, ARRAY['admin'::org_role,'gestor'::org_role]))
  WITH CHECK (has_org_role(auth.uid(), cooperative_id, ARRAY['admin'::org_role,'gestor'::org_role]));

CREATE TRIGGER trg_custom_fields_updated
  BEFORE UPDATE ON public.custom_fields
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_custom_fields_coop ON public.custom_fields(cooperative_id, scope);

-- ============ custom_field_values ============
CREATE TABLE IF NOT EXISTS public.custom_field_values (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cooperative_id uuid NOT NULL,
  custom_field_id uuid NOT NULL,
  socio_id uuid,
  aid_application_id uuid,
  value_text text,
  value_number numeric,
  value_date date,
  value_boolean boolean,
  value_json jsonb,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (custom_field_id, socio_id),
  UNIQUE (custom_field_id, aid_application_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_field_values TO authenticated;
GRANT ALL ON public.custom_field_values TO service_role;
ALTER TABLE public.custom_field_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members and linked socios view field values" ON public.custom_field_values
  FOR SELECT TO authenticated
  USING (
    is_org_member(auth.uid(), cooperative_id)
    OR (socio_id IS NOT NULL AND is_socio_user(auth.uid(), socio_id))
  );
CREATE POLICY "Editors create field values" ON public.custom_field_values
  FOR INSERT TO authenticated
  WITH CHECK (has_org_role(auth.uid(), cooperative_id, ARRAY['admin'::org_role,'gestor'::org_role]));
CREATE POLICY "Editors update field values" ON public.custom_field_values
  FOR UPDATE TO authenticated
  USING (has_org_role(auth.uid(), cooperative_id, ARRAY['admin'::org_role,'gestor'::org_role]))
  WITH CHECK (has_org_role(auth.uid(), cooperative_id, ARRAY['admin'::org_role,'gestor'::org_role]));

CREATE TRIGGER trg_custom_field_values_updated
  BEFORE UPDATE ON public.custom_field_values
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_cfv_coop ON public.custom_field_values(cooperative_id);
CREATE INDEX IF NOT EXISTS idx_cfv_socio ON public.custom_field_values(socio_id);
CREATE INDEX IF NOT EXISTS idx_cfv_application ON public.custom_field_values(aid_application_id);

-- ============ saved_views ============
CREATE TABLE IF NOT EXISTS public.saved_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cooperative_id uuid NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL,
  table_key text NOT NULL,
  shared_with_cooperative boolean NOT NULL DEFAULT false,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_views TO authenticated;
GRANT ALL ON public.saved_views TO service_role;
ALTER TABLE public.saved_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own or shared saved views" ON public.saved_views
  FOR SELECT TO authenticated
  USING (
    is_org_member(auth.uid(), cooperative_id)
    AND (user_id = auth.uid() OR shared_with_cooperative = true)
  );
CREATE POLICY "Create own saved views" ON public.saved_views
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_org_member(auth.uid(), cooperative_id));
CREATE POLICY "Update own saved views" ON public.saved_views
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Delete own saved views" ON public.saved_views
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER trg_saved_views_updated
  BEFORE UPDATE ON public.saved_views
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_saved_views_coop ON public.saved_views(cooperative_id, table_key);
