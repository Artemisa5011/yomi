-- DIAGNÓSTICO: ver por qué el cliente no ve sus servicios
-- Ejecutar en Supabase SQL Editor para revisar el estado.

-- 1) Servicios confirmados SIN vincular (admin los ve, cliente no)
SELECT s.id, s.fecha, s.tipo, s.nombre_difunto, c.cedula as cedula_cliente, c.nombre_completo
FROM servicios_funerarios s
JOIN clientes c ON c.id = s.cliente_id
WHERE s.estado_pago = 'confirmado' AND s.cliente_user_id IS NULL
ORDER BY s.fecha DESC;

-- 2) Usuarios portal (rol 3) con su cédula
SELECT user_id, cedula, LENGTH(cedula) as largo_cedula, LENGTH(TRIM(cedula)) as largo_trim
FROM user_profiles
WHERE rol = 3
ORDER BY cedula;

-- 3) Vincular manualmente (reemplaza 'CEDULA_DEL_CLIENTE' por la cédula real):
-- SELECT * FROM vincular_servicios_y_reservas_por_cedula('CEDULA_DEL_CLIENTE');
