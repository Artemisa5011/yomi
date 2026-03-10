-- Portal cliente: ver servicios funerarios vinculados a su cuenta
-- Ejecutar después de: 007_roles_portal.sql
-- Permite que el cliente portal (rol 3) vea sus servicios cuando el vendedor vincula su cédula

-- 1) Agregar columna cliente_user_id a servicios_funerarios
ALTER TABLE public.servicios_funerarios
ADD COLUMN IF NOT EXISTS cliente_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_servicios_cliente_user_id
ON public.servicios_funerarios(cliente_user_id);

-- 2) Política RLS: cliente portal ve solo sus servicios
CREATE POLICY "servicios_select_portal_cliente"
ON public.servicios_funerarios
FOR SELECT
TO authenticated
USING (public.get_user_role() = 3 AND cliente_user_id = auth.uid());
