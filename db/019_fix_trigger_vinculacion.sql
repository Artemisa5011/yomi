-- Evitar que el trigger de "max 3 servicios/día" bloquee al vincular cliente_user_id.
-- Al actualizar solo cliente_user_id (vinculación portal), no aplica la regla de negocio.

CREATE OR REPLACE FUNCTION fn_max_servicios_por_dia()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  cuenta INT;
BEGIN
  -- Si es UPDATE y solo cambió cliente_user_id, omitir la validación
  IF TG_OP = 'UPDATE' AND
     OLD.cliente_id IS NOT DISTINCT FROM NEW.cliente_id AND
     OLD.fecha IS NOT DISTINCT FROM NEW.fecha AND
     OLD.hora IS NOT DISTINCT FROM NEW.hora AND
     OLD.tipo IS NOT DISTINCT FROM NEW.tipo AND
     OLD.nombre_difunto IS NOT DISTINCT FROM NEW.nombre_difunto THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO cuenta
  FROM servicios_funerarios
  WHERE cliente_id = NEW.cliente_id
    AND fecha = NEW.fecha
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  IF cuenta >= 3 THEN
    RAISE EXCEPTION 'Un cliente puede contratar máximo 3 servicios por día.';
  END IF;
  RETURN NEW;
END;
$$;
