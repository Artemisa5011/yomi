-- RPC para que el admin vincule manualmente servicios y reservas a un cliente portal por cédula.
-- Requiere: 014_servicios_cliente_user_id.sql (columna cliente_user_id en servicios_funerarios)
-- Útil cuando el script 016 no vinculó por diferencias de formato.
-- Uso: SELECT * FROM vincular_servicios_y_reservas_por_cedula('1128405011');

CREATE OR REPLACE FUNCTION public.vincular_servicios_y_reservas_por_cedula(p_cedula TEXT)
RETURNS TABLE(servicios_vinculados INT, reservas_vinculadas INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_user_id UUID;
  v_servicios INT := 0;
  v_reservas INT := 0;
  p_cedula_trim TEXT := NULLIF(TRIM(p_cedula), '');
BEGIN
  IF p_cedula_trim IS NULL THEN
    RAISE EXCEPTION 'Cédula no puede estar vacía';
  END IF;
  IF public.get_user_role() != 666 THEN
    RAISE EXCEPTION 'Solo el admin puede ejecutar esta función';
  END IF;

  -- Buscar usuario portal con esa cédula (rol 3)
  SELECT user_id INTO v_user_id
  FROM user_profiles
  WHERE rol = 3 AND (TRIM(cedula) = p_cedula_trim OR cedula = p_cedula_trim)
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No existe usuario portal (cliente) con cédula %', p_cedula_trim;
  END IF;

  -- Vincular servicios funerarios
  WITH upd AS (
    UPDATE servicios_funerarios s
    SET cliente_user_id = v_user_id
    FROM clientes c
    WHERE s.cliente_id = c.id
      AND s.estado_pago = 'confirmado'
      AND (TRIM(c.cedula) = p_cedula_trim OR c.cedula = p_cedula_trim)
      AND (s.cliente_user_id IS NULL OR s.cliente_user_id != v_user_id)
    RETURNING s.id
  )
  SELECT COUNT(*)::INT INTO v_servicios FROM upd;

  -- Vincular reservas cementerio
  WITH upd AS (
    UPDATE reservas_cementerio r
    SET cliente_user_id = v_user_id
    FROM clientes c
    WHERE r.cliente_id = c.id
      AND r.estado_pago = 'confirmado'
      AND (TRIM(c.cedula) = p_cedula_trim OR c.cedula = p_cedula_trim)
      AND (r.cliente_user_id IS NULL OR r.cliente_user_id != v_user_id)
    RETURNING r.id
  )
  SELECT COUNT(*)::INT INTO v_reservas FROM upd;

  servicios_vinculados := v_servicios;
  reservas_vinculadas := v_reservas;
  RETURN NEXT;
END;
$func$;
