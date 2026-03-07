-- Migración: agregar valor_total para guardar el monto total pagado
-- Ejecutar solo si ya tienes la BD creada.

ALTER TABLE servicios_funerarios ADD COLUMN IF NOT EXISTS valor_total DECIMAL(12,2);
ALTER TABLE reservas_cementerio ADD COLUMN IF NOT EXISTS valor_total DECIMAL(12,2);
