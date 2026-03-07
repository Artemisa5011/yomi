-- Test de la Sombra Absoluta
-- - Guarda resultado espiritual por reserva
-- - Bloquea cambio de lote después del "juicio"

ALTER TABLE public.reservas_cementerio
ADD COLUMN IF NOT EXISTS sombra_pecado VARCHAR(20),
ADD COLUMN IF NOT EXISTS sombra_puntajes JSONB,
ADD COLUMN IF NOT EXISTS sombra_bloqueado BOOLEAN DEFAULT FALSE;

-- Evitar cambiar lote después de tener resultado de sombra
CREATE OR REPLACE FUNCTION public.fn_prevent_lote_change_after_sombra()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (OLD.sombra_pecado IS NOT NULL OR OLD.sombra_bloqueado IS TRUE)
     AND NEW.lote_id IS DISTINCT FROM OLD.lote_id THEN
    RAISE EXCEPTION 'No se puede cambiar el lote después del juicio de la sombra.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_lote_change_after_sombra ON public.reservas_cementerio;
CREATE TRIGGER trg_prevent_lote_change_after_sombra
  BEFORE UPDATE ON public.reservas_cementerio
  FOR EACH ROW
  EXECUTE PROCEDURE public.fn_prevent_lote_change_after_sombra();

