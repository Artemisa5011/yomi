-- Vincular reservas y servicios existentes a usuarios del portal (rol 3)
-- Ejecutar en Supabase SQL Editor cuando un cliente ya tiene reservas/servicios
-- pero aún no ve nada en "Mis Difuntos" porque fueron creados antes de su registro.
--
-- Requiere: 007_roles_portal.sql, 014_servicios_cliente_user_id.sql

-- 1) Vincular reservas de cementerio (cédula coincide con TRIM por si hay espacios)
UPDATE reservas_cementerio r
SET cliente_user_id = up.user_id
FROM clientes c
JOIN user_profiles up ON TRIM(COALESCE(up.cedula, '')) = TRIM(COALESCE(c.cedula, '')) AND up.rol = 3
WHERE r.cliente_id = c.id
  AND r.cliente_user_id IS NULL
  AND r.estado_pago = 'confirmado';

-- 2) Vincular servicios funerarios: misma lógica
UPDATE servicios_funerarios s
SET cliente_user_id = up.user_id
FROM clientes c
JOIN user_profiles up ON TRIM(COALESCE(up.cedula, '')) = TRIM(COALESCE(c.cedula, '')) AND up.rol = 3
WHERE s.cliente_id = c.id
  AND s.cliente_user_id IS NULL
  AND s.estado_pago = 'confirmado';

-- Consulta para verificar: servicios con cliente pero sin vincular (diagnóstico)
-- SELECT c.cedula, c.nombre_completo, COUNT(s.id) as servicios_sin_vincular
-- FROM clientes c
-- JOIN servicios_funerarios s ON s.cliente_id = c.id AND s.estado_pago = 'confirmado' AND s.cliente_user_id IS NULL
-- GROUP BY c.id, c.cedula, c.nombre_completo;
