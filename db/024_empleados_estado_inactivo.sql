-- Estado activo/inactivo para vendedores - no elimina ventas, solo bloquea acceso
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.empleados
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo' 
CHECK (estado IN ('activo', 'inactivo'));

-- Si la columna ya existe sin constraint, actualizar registros existentes
UPDATE public.empleados SET estado = 'activo' WHERE estado IS NULL;
