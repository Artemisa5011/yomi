-- RPC: verificar si una cédula ya está registrada como cliente portal (rol 3).
-- Llamable por anon para el formulario de registro de clientes.
-- Solo retorna true/false, sin exponer datos.

CREATE OR REPLACE FUNCTION public.cedula_ya_registrada(p_cedula TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE rol = 3 AND cedula = NULLIF(TRIM(p_cedula), '')
  );
END;
$$;

-- Permitir invocar sin autenticación (registro público)
GRANT EXECUTE ON FUNCTION public.cedula_ya_registrada(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.cedula_ya_registrada(TEXT) TO authenticated;
