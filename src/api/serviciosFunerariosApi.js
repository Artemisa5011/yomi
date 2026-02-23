import { supabase } from '../lib/supabase' /* Conectar la base de datos */
import { parseError } from './parseError' /* Manejo de Errores */

/* Listar servicios confirmados */
export async function listServiciosConfirmados() {
  const { data, error } = await supabase
    .from('servicios_funerarios')
    .select('*')
    .eq('estado_pago', 'confirmado')
    .order('fecha')
  if (error) throw parseError(error)
  return data || []
}
/* Crear los servicios */
export async function createServiciosFunerarios(rows) {
  for (const row of rows) {
    const { error } = await supabase.from('servicios_funerarios').insert(row)
    if (error) throw parseError(error, {
      '23503': 'Error al registrar. Verifica cliente, fecha y hora.',
      '23514': 'Fecha u hora no válidas. Revisa las reglas de negocio.'
    })
  }
}
/* Suscribir los servicios funerarios en Realtime */
export function subscribeServiciosFunerariosRealtime(onUpsert, onRemove) {
  const channel = supabase
    .channel('servicios-funerarios-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'servicios_funerarios' },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          onRemove(payload.old?.id)
        } else {
          onUpsert(payload.new)
        }
      }
    )
    .subscribe()
  return () => {
    channel.unsubscribe()
  }
}
