-- RPC: obtener el user_id del portal por cédula (solo vendedor/admin)
-- Necesario para vincular reservas con clientes del portal (rol 3) en /mi-cementerio.
-- Ejecutar en Supabase SQL Editor (requiere 007_roles_portal.sql o user_profiles con cedula).

CREATE OR REPLACE FUNCTION public.get_portal_user_id_by_cedula(p_cedula TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID;
BEGIN
  IF public.get_user_role() NOT IN (2, 666) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  SELECT user_id INTO uid
  FROM public.user_profiles
  WHERE rol = 3
    AND cedula = NULLIF(TRIM(p_cedula), '')
  LIMIT 1;

  RETURN uid;
END;
$$;
