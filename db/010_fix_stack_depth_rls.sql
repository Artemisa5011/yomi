-- Fix: "stack depth limit exceeded" al insertar en servicios_funerarios
-- 
-- CAUSA: La función get_user_role() lee de user_profiles. Las políticas RLS
-- de user_profiles usan is_admin() que llama a get_user_role(). Eso crea
-- recursión infinita al evaluar permisos.
--
-- SOLUCIÓN: SECURITY DEFINER en get_user_role() para que lea user_profiles
-- sin disparar RLS (evita la recursión).
-- Ejecutar en Supabase SQL Editor.

-- 1) get_user_role: debe ejecutarse con privilegios del creador para
--    leer user_profiles sin evaluar RLS
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT rol FROM public.user_profiles WHERE user_id = auth.uid()),
    2
  );
$$;

-- 2) is_admin: también con SECURITY DEFINER para consistencia
--    (llama a get_user_role que ya no provoca recursión, pero esto
--     evita problemas si se usa en otros contextos)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_role() = 666;
$$;
