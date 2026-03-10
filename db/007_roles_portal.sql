-- Roles + Portal Cliente (Opción recomendada)
-- - Admin: rol 666
-- - Vendedor: rol 2 (default)
-- - Cliente portal: rol 3 (registro público)
--
-- Ejecutar después de:
-- 001_schema.sql, 002_rls.sql, 003_realtime.sql, 004_reglas_negocio.sql
-- (y después de 006_valor_total.sql si lo usas)


-- 1) Tabla de perfiles/roles (no depende de app_metadata editable)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rol INT NOT NULL DEFAULT 2 CHECK (rol IN (2, 3, 666)),
  cedula VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_cedula_unique
ON public.user_profiles (cedula)
WHERE cedula IS NOT NULL;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2) Helpers para RLS
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS INT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT rol FROM public.user_profiles WHERE user_id = auth.uid()),
    2
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT public.get_user_role() = 666;
$$;

-- 3) Proteger cambios de rol (solo admin puede cambiar roles; SQL Editor sin JWT sí puede, para crear el primer admin)
CREATE OR REPLACE FUNCTION public.trg_prevent_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.user_id <> OLD.user_id THEN
    RAISE EXCEPTION 'No se puede cambiar el user_id del perfil.';
  END IF;

  -- Permitir cambio si no hay usuario de app (ej. SQL Editor / migración) o si quien hace el cambio es admin
  IF NEW.rol <> OLD.rol AND auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'No puedes cambiar tu rol.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_change ON public.user_profiles;
CREATE TRIGGER trg_prevent_role_change
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.trg_prevent_role_change();

-- 4) Backfill para usuarios existentes:
-- - Si existe en empleados => vendedor (2)
-- - Si no => cliente portal (3) (puedes ajustar manualmente si aplica)
INSERT INTO public.user_profiles (user_id, rol)
SELECT
  u.id,
  CASE WHEN EXISTS (SELECT 1 FROM public.empleados e WHERE e.user_id = u.id) THEN 2 ELSE 3 END
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- 5) Trigger al registrarse: crea perfil con rol automático.
-- - Por defecto: vendedor (2)
-- - Si metadata.registro_tipo='cliente' => rol 3 y guarda cedula
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tipo TEXT;
  ced TEXT;
BEGIN
  tipo := NEW.raw_user_meta_data->>'registro_tipo';
  ced := NEW.raw_user_meta_data->>'cedula';

  INSERT INTO public.user_profiles (user_id, rol, cedula)
  VALUES (
    NEW.id,
    CASE WHEN tipo = 'cliente' THEN 3 ELSE 2 END,
    CASE WHEN tipo = 'cliente' THEN NULLIF(ced, '') ELSE NULL END
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_profile();

-- 6) Políticas RLS para user_profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.user_profiles;

CREATE POLICY "profiles_select_own"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_select_admin"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "profiles_update_admin"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 7) Portal: vincular reservas a usuario cliente (rol 3)
ALTER TABLE public.reservas_cementerio
ADD COLUMN IF NOT EXISTS cliente_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reservas_cliente_user_id
ON public.reservas_cementerio(cliente_user_id);

-- RPC: obtener el user_id del portal por cédula (solo vendedor/admin)
CREATE OR REPLACE FUNCTION public.get_portal_user_id_by_cedula(p_cedula TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
BEGIN
  IF public.get_user_role() NOT IN (2, 666) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  SELECT user_id INTO uid
  FROM public.user_profiles
  WHERE rol = 3
    AND cedula = NULLIF(TRIM(p_cedula), '')
  LIMIT 1;

  RETURN uid;
END;
$$;

-- 8) Ajuste RLS: reservas_cementerio
-- Mantiene políticas actuales (por user_id vendedor) y agrega:
-- - admin ve todo
-- - cliente ve solo reservas donde cliente_user_id = auth.uid()
DROP POLICY IF EXISTS "reservas_select_admin" ON public.reservas_cementerio;
DROP POLICY IF EXISTS "reservas_modify_admin" ON public.reservas_cementerio;
DROP POLICY IF EXISTS "reservas_select_portal_cliente" ON public.reservas_cementerio;

CREATE POLICY "reservas_select_admin"
ON public.reservas_cementerio
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "reservas_modify_admin"
ON public.reservas_cementerio
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "reservas_select_portal_cliente"
ON public.reservas_cementerio
FOR SELECT
TO authenticated
USING (public.get_user_role() = 3 AND cliente_user_id = auth.uid());

-- 9) Ajuste RLS: lotes (cliente portal NO ve catálogo completo)
-- Reemplaza la política select-all por una select controlada.
DROP POLICY IF EXISTS "lotes_select_all" ON public.lotes;
DROP POLICY IF EXISTS "lotes_select_by_role" ON public.lotes;

CREATE POLICY "lotes_select_by_role"
ON public.lotes
FOR SELECT
TO authenticated
USING (
  public.get_user_role() IN (2, 666)
  OR EXISTS (
    SELECT 1
    FROM public.reservas_cementerio r
    WHERE r.lote_id = lotes.id
      AND r.cliente_user_id = auth.uid()
  )
);

-- 10) Admin en empleados/clientes/servicios (políticas adicionales)
DROP POLICY IF EXISTS "empleados_admin_all" ON public.empleados;
CREATE POLICY "empleados_admin_all"
ON public.empleados
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "clientes_admin_all" ON public.clientes;
CREATE POLICY "clientes_admin_all"
ON public.clientes
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "servicios_admin_all" ON public.servicios_funerarios;
CREATE POLICY "servicios_admin_all"
ON public.servicios_funerarios
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());