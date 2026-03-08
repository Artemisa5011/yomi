-- ============================================
-- Opcional: solo si ya ejecutaste 007_roles_portal.sql antes
-- y al asignar el primer admin en SQL Editor sale:
--   "No puedes cambiar tu rol. CONTEXT: trg_prevent_role_change()"
-- Ejecuta este archivo una vez en SQL Editor, luego vuelve a ejecutar
-- el INSERT que asigna rol 666 a tu usuario.
-- ============================================

CREATE OR REPLACE FUNCTION public.trg_prevent_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.user_id <> OLD.user_id THEN
    RAISE EXCEPTION 'No se puede cambiar el user_id del perfil.';
  END IF;

  IF NEW.rol <> OLD.rol AND auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'No puedes cambiar tu rol.';
  END IF;

  RETURN NEW;
END;
$$;
