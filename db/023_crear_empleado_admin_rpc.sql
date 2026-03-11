-- RPC: Permitir que el admin cree empleados al registrar vendedores
-- Evita problemas cuando la sesión cambia tras signUp
-- Ejecutar en Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.crear_empleado_por_admin(
  p_user_id UUID,
  p_cedula TEXT,
  p_nombre_completo TEXT,
  p_telefono TEXT DEFAULT NULL,
  p_correo TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Admin puede crear para cualquier usuario; el propio usuario puede crear su empleado (tras signUp)
  IF public.get_user_role() <> 666 AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'No autorizado. Solo el administrador puede registrar vendedores.';
  END IF;

  -- Validar datos
  IF NULLIF(TRIM(p_cedula), '') IS NULL THEN
    RAISE EXCEPTION 'La cédula es obligatoria.';
  END IF;
  IF NULLIF(TRIM(p_nombre_completo), '') IS NULL THEN
    RAISE EXCEPTION 'El nombre completo es obligatorio.';
  END IF;

  INSERT INTO public.empleados (user_id, cedula, nombre_completo, telefono, correo)
  VALUES (
    p_user_id,
    TRIM(p_cedula),
    TRIM(p_nombre_completo),
    NULLIF(TRIM(p_telefono), ''),
    NULLIF(TRIM(p_correo), '')
  )
  RETURNING id INTO v_id;

  -- Crear/actualizar user_profiles con rol 2 (vendedor)
  INSERT INTO public.user_profiles (user_id, rol)
  VALUES (p_user_id, 2)
  ON CONFLICT (user_id) DO UPDATE SET rol = 2;

  RETURN v_id;
END;
$$;
