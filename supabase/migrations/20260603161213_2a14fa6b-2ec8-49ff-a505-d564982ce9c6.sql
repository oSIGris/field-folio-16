CREATE OR REPLACE FUNCTION public.create_cooperative(_nombre text, _cif text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _coop_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  IF _nombre IS NULL OR length(trim(_nombre)) = 0 THEN
    RAISE EXCEPTION 'El nombre es obligatorio';
  END IF;

  INSERT INTO public.cooperatives (nombre, cif, created_by)
  VALUES (trim(_nombre), NULLIF(trim(coalesce(_cif, '')), ''), _uid)
  RETURNING id INTO _coop_id;

  INSERT INTO public.organization_members (user_id, cooperative_id, role)
  VALUES (_uid, _coop_id, 'admin');

  RETURN _coop_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_cooperative(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_cooperative(text, text) TO authenticated;