-- Crear empleados para usuarios con rol 2 (vendedor) que no tienen fila en empleados
-- Ejecutar en Supabase SQL Editor
-- Usa metadata del registro (cedula, nombre_completo) si existe; si no, genera valores

INSERT INTO public.empleados (user_id, cedula, nombre_completo, telefono, correo, estado)
SELECT 
  up.user_id,
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'cedula'), ''),
    'V' || REPLACE(SUBSTR(up.user_id::text, 1, 8), '-', '')
  ) AS cedula,
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'nombre_completo'), ''),
    SPLIT_PART(u.email, '@', 1),
    'Vendedor'
  ) AS nombre_completo,
  NULLIF(TRIM(COALESCE(u.raw_user_meta_data->>'telefono', '')), '') AS telefono,
  u.email AS correo,
  'activo'
FROM public.user_profiles up
JOIN auth.users u ON u.id = up.user_id
LEFT JOIN public.empleados e ON e.user_id = up.user_id
WHERE up.rol = 2
  AND e.id IS NULL;

-- Verificar: SELECT u.email, e.nombre_completo, e.cedula FROM empleados e JOIN auth.users u ON u.id = e.user_id;
