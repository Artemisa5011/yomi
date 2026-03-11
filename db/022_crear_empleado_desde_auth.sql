-- Crear empleado para usuario que existe en auth pero no en empleados
-- Ejecutar en Supabase SQL Editor
-- Reemplaza 'contactoInfernal_01@yominohana.com' por tu email si es diferente

-- 1) DIAGNÓSTICO: Ver tu usuario en auth y si tienes empleado
SELECT 
  u.id as user_id,
  u.email,
  p.rol,
  e.id as empleado_id,
  e.nombre_completo as empleado_nombre
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.user_id = u.id
LEFT JOIN public.empleados e ON e.user_id = u.id
WHERE u.email ILIKE '%contactoInfernal%' OR u.email ILIKE '%yominohana%';

-- 2) CREAR EMPLEADO: Si empleado_id es NULL arriba, ejecuta esto
-- Ajusta cedula, nombre_completo y correo como prefieras
-- Cedula única por usuario (EMP + 10 chars del UUID) para evitar conflicto con 0000000
INSERT INTO public.empleados (user_id, cedula, nombre_completo, correo)
SELECT 
  u.id,
  'EMP' || substring(replace(u.id::text, '-', '') from 1 for 10),
  'Contacto Infernal',  -- ← Cambia por tu nombre real
  u.email
FROM auth.users u
WHERE u.email ILIKE '%contactoinfernal%'
  AND NOT EXISTS (SELECT 1 FROM public.empleados e WHERE e.user_id = u.id);
