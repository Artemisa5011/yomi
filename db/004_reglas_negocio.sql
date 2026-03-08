-- ============================================
-- Reglas de negocio adicionales (DB)
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Fecha no en el pasado (servicios funerarios)
ALTER TABLE servicios_funerarios
ADD CONSTRAINT chk_fecha_no_pasado
CHECK (fecha >= CURRENT_DATE);

-- 2. Nombre condenado obligatorio cuando pago es "con la vida"
-- servicios_funerarios
ALTER TABLE servicios_funerarios
ADD CONSTRAINT chk_condenado_si_vida_funeraria
CHECK (
  metodo_pago IS DISTINCT FROM 'con_la_vida'
  OR (nombre_condenado IS NOT NULL AND length(btrim(nombre_condenado)) > 0)
);

-- reservas_cementerio
ALTER TABLE reservas_cementerio
ADD CONSTRAINT chk_condenado_si_vida_cementerio
CHECK (
  metodo_pago IS DISTINCT FROM 'con_la_vida'
  OR (nombre_condenado IS NOT NULL AND length(btrim(nombre_condenado)) > 0)
);
