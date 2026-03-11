-- YOMI NO HANA - Restricción: No eliminar cliente con servicios o reservas
-- Cuando un cliente pasa a 'verdugo' tiene servicios contratados.
-- Regla de negocio: NO se debe poder eliminar un cliente que ya tiene servicios/reservas.
-- Ejecutar en Supabase SQL Editor después de 001_schema.sql

-- 1) servicios_funerarios: cambiar CASCADE a RESTRICT
ALTER TABLE public.servicios_funerarios
  DROP CONSTRAINT IF EXISTS servicios_funerarios_cliente_id_fkey;

ALTER TABLE public.servicios_funerarios
  ADD CONSTRAINT servicios_funerarios_cliente_id_fkey
  FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE RESTRICT;

-- 2) reservas_cementerio: cambiar CASCADE a RESTRICT
ALTER TABLE public.reservas_cementerio
  DROP CONSTRAINT IF EXISTS reservas_cementerio_cliente_id_fkey;

ALTER TABLE public.reservas_cementerio
  ADD CONSTRAINT reservas_cementerio_cliente_id_fkey
  FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE RESTRICT;
