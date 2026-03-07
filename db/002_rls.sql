
-- RLS - Row Level Security
-- Todas las tablas aisladas por user_id


ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY; -- catálogo: leer todos, modificar nadie desde app
ALTER TABLE servicios_funerarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas_cementerio ENABLE ROW LEVEL SECURITY;

-- lotes: solo lectura para usuarios autenticados (catálogo)
CREATE POLICY "lotes_select_all" ON lotes FOR SELECT TO authenticated USING (true);
CREATE POLICY "lotes_no_insert" ON lotes FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "lotes_no_update" ON lotes FOR UPDATE TO authenticated USING (false);
CREATE POLICY "lotes_no_delete" ON lotes FOR DELETE TO authenticated USING (false);

-- Nota: capacidad_ocupada se actualiza por trigger, necesita bypass en el trigger
-- El trigger corre con SECURITY DEFINER o el owner puede modificar. 
-- Para lotes, la capacidad_ocupada se actualiza desde el trigger de reservas.
-- Necesitamos permitir UPDATE en lotes solo para el trigger. Crearemos una función SECURITY DEFINER.
DROP TRIGGER IF EXISTS trg_confirmar_reserva_cementerio ON reservas_cementerio;
DROP FUNCTION IF EXISTS fn_confirmar_reserva_cementerio();

CREATE OR REPLACE FUNCTION fn_confirmar_reserva_cementerio()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado_pago = 'confirmado' AND (OLD IS NULL OR OLD.estado_pago != 'confirmado') THEN
    UPDATE lotes
    SET capacidad_ocupada = capacidad_ocupada + 1
    WHERE id = NEW.lote_id
      AND capacidad_ocupada < capacidad_total;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No hay capacidad disponible en el lote.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_confirmar_reserva_cementerio
  BEFORE INSERT OR UPDATE ON reservas_cementerio
  FOR EACH ROW
  EXECUTE PROCEDURE fn_confirmar_reserva_cementerio();

-- empleados
CREATE POLICY "empleados_select_own" ON empleados FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "empleados_insert_own" ON empleados FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "empleados_update_own" ON empleados FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "empleados_delete_own" ON empleados FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- clientes
CREATE POLICY "clientes_select_own" ON clientes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "clientes_insert_own" ON clientes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clientes_update_own" ON clientes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "clientes_delete_own" ON clientes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- servicios_funerarios
CREATE POLICY "servicios_select_own" ON servicios_funerarios FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "servicios_insert_own" ON servicios_funerarios FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "servicios_update_own" ON servicios_funerarios FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "servicios_delete_own" ON servicios_funerarios FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- reservas_cementerio
CREATE POLICY "reservas_select_own" ON reservas_cementerio FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "reservas_insert_own" ON reservas_cementerio FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reservas_update_own" ON reservas_cementerio FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "reservas_delete_own" ON reservas_cementerio FOR DELETE TO authenticated USING (auth.uid() = user_id);
