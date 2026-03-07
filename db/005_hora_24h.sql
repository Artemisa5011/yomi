-- Migración: pasar horas de medianoche/3am a formato 24h (00:00, 03:00)
-- Ejecutar solo si ya tienes la BD creada con el esquema anterior.

-- 1. Actualizar datos existentes
UPDATE servicios_funerarios SET hora = '00:00' WHERE hora = 'medianoche';
UPDATE servicios_funerarios SET hora = '03:00' WHERE hora = '3am';

-- 2. Eliminar constraint antigua y añadir nueva
ALTER TABLE servicios_funerarios DROP CONSTRAINT IF EXISTS servicios_funerarios_hora_check;
ALTER TABLE servicios_funerarios ADD CONSTRAINT servicios_funerarios_hora_check
  CHECK (hora IN ('00:00', '03:00'));
