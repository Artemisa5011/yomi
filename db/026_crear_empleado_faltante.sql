-- Crear empleado faltante para un vendedor que se registró pero no tiene fila en empleados
-- (Ocurre si el registro no creó el empleado correctamente)
-- Ejecutar en Supabase SQL Editor
--
-- OPCIÓN A: Ejecutar primero 028_actualizar_empleados_desde_metadata.sql para intentar
--           recuperar datos desde la metadata del registro.
--
-- OPCIÓN B: Usar este script reemplazando por datos REALES (no dejes los placeholders):

INSERT INTO public.empleados (user_id, cedula, nombre_completo, telefono, correo, estado)
SELECT 
  u.id,
  'TU_CEDULA_REAL',     -- ← REEMPLAZA: la cédula que usaste al registrarlo
  'TU_NOMBRE_REAL',     -- ← REEMPLAZA: el nombre completo
  NULL,
  u.email,
  'activo'
FROM auth.users u
LEFT JOIN public.empleados e ON e.user_id = u.id
WHERE u.email = 'contactoinfernal_2@yominohana.com'
  AND e.id IS NULL;

INSERT INTO public.user_profiles (user_id, rol)
SELECT id, 2 FROM auth.users WHERE email = 'contactoinfernal_2@yominohana.com'
ON CONFLICT (user_id) DO UPDATE SET rol = 2;
