-- Solicitudes de contacto (formulario Inicio)
-- Público puede insertar. Solo admin puede leer.
-- La cédula permite vincular con clientes y portal.

CREATE TABLE IF NOT EXISTS solicitudes_contacto (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  cedula VARCHAR(20) NOT NULL,
  telefono VARCHAR(50),
  correo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_solicitudes_cedula ON solicitudes_contacto(cedula);
CREATE INDEX idx_solicitudes_created ON solicitudes_contacto(created_at DESC);

ALTER TABLE solicitudes_contacto ENABLE ROW LEVEL SECURITY;

-- Cualquiera (anon o authenticated) puede enviar
CREATE POLICY "solicitudes_insert_public"
ON solicitudes_contacto FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Solo admin puede leer
CREATE POLICY "solicitudes_select_admin"
ON solicitudes_contacto FOR SELECT
TO authenticated
USING (public.is_admin());

-- RPC: lista solicitudes con estado (cliente existe? portal existe?) - solo admin
CREATE OR REPLACE FUNCTION public.admin_listar_solicitudes_contacto()
RETURNS TABLE (
  id UUID,
  nombre VARCHAR(255),
  cedula VARCHAR(20),
  telefono VARCHAR(50),
  correo VARCHAR(255),
  mensaje TEXT,
  created_at TIMESTAMPTZ,
  existe_cliente BOOLEAN,
  existe_portal BOOLEAN
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT
    s.id,
    s.nombre,
    s.cedula,
    s.telefono,
    s.correo,
    s.mensaje,
    s.created_at,
    EXISTS (SELECT 1 FROM public.clientes c WHERE c.cedula = s.cedula) AS existe_cliente,
    EXISTS (
      SELECT 1 FROM auth.users u
      JOIN public.user_profiles p ON p.user_id = u.id AND p.rol = 3
      WHERE (u.raw_user_meta_data->>'cedula')::text = s.cedula
    ) AS existe_portal
  FROM solicitudes_contacto s
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
