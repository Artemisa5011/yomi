-- Actualizar empleados con datos reales desde la metadata del registro (auth.users.raw_user_meta_data)
-- Ejecutar en Supabase SQL Editor
-- Corrige empleados creados con placeholders (NOMBRE_REAL, CÉDULA_REAL, etc.)

UPDATE public.empleados e
SET 
  cedula = COALESCE(NULLIF(TRIM(u.raw_user_meta_data->>'cedula'), ''), e.cedula),
  nombre_completo = COALESCE(NULLIF(TRIM(u.raw_user_meta_data->>'nombre_completo'), ''), e.nombre_completo),
  telefono = COALESCE(NULLIF(TRIM(u.raw_user_meta_data->>'telefono'), ''), e.telefono)
FROM auth.users u
WHERE e.user_id = u.id
  AND (
    u.raw_user_meta_data->>'cedula' IS NOT NULL
    OR u.raw_user_meta_data->>'nombre_completo' IS NOT NULL
  );

-- Si la metadata está vacía, actualiza manualmente (reemplaza con los datos reales):
-- UPDATE public.empleados e SET cedula = '123456789', nombre_completo = 'Juan Pérez'
-- FROM auth.users u WHERE e.user_id = u.id AND u.email = 'contactoinfernal_2@yominohana.com';

-- Verificar: SELECT e.nombre_completo, e.cedula, e.correo FROM empleados e JOIN auth.users u ON u.id = e.user_id;
