-- Calendario: vendedores y admins ven TODOS los servicios confirmados
--
-- Por defecto, servicios_select_own solo muestra filas donde user_id = auth.uid().
-- Este script agrega una política para que vendedores (rol 2) y admins (rol 666)
-- puedan ver todos los servicios confirmados en el calendario.
-- Ejecutar en Supabase SQL Editor (después de 010_fix_stack_depth_rls.sql).

DROP POLICY IF EXISTS "servicios_select_staff" ON public.servicios_funerarios;
CREATE POLICY "servicios_select_staff"
ON public.servicios_funerarios
FOR SELECT
TO authenticated
USING (
  public.get_user_role() IN (2, 666)
  AND estado_pago = 'confirmado'
);
