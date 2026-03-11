-- Obtener el nombre para mostrar del usuario logueado (admin, vendedor, cliente)
-- Ejecutar en Supabase SQL Editor después de 007_roles_portal.sql

CREATE OR REPLACE FUNCTION public.get_display_name(p_user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rol INT;
  v_cedula TEXT;
  v_nombre TEXT;
BEGIN
  -- Solo permite consultar el propio perfil
  IF p_user_id IS NULL OR p_user_id <> auth.uid() THEN
    RETURN NULL;
  END IF;

  -- Obtener rol
  SELECT rol INTO v_rol FROM public.user_profiles WHERE user_id = p_user_id;

  -- Admin o Vendedor: nombre desde empleados
  IF v_rol IN (2, 666) THEN
    SELECT nombre_completo INTO v_nombre FROM public.empleados WHERE user_id = p_user_id LIMIT 1;
    RETURN COALESCE(v_nombre, '');
  END IF;

  -- Cliente (rol 3): nombre desde clientes por cédula
  IF v_rol = 3 THEN
    SELECT cedula INTO v_cedula FROM public.user_profiles WHERE user_id = p_user_id;
    IF v_cedula IS NOT NULL THEN
      SELECT nombre_completo INTO v_nombre FROM public.clientes
        WHERE TRIM(cedula) = TRIM(v_cedula)
        LIMIT 1;
    END IF;
    RETURN COALESCE(v_nombre, '');
  END IF;

  RETURN '';
END;
$$;
