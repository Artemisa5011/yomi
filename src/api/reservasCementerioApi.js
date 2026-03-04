import { supabase } from '../lib/supabase' /* Conectar la base de datos */
import { parseError } from './parseError' /* Manejo de Errores */

/* Listar las reservas confirmadas */
export async function listReservasConfirmadas() {
  const { data, error } = await supabase
    .from('reservas_cementerio')
    .select('*, lotes(nombre, codigo)')
    .eq('estado_pago', 'confirmado')
  if (error) throw parseError(error)
  return data || []
}
/* listar reservas del usuario */
export async function listMisReservas() {
  const { data, error } = await supabase
    .from('reservas_cementerio')
    .select('*, lotes(nombre, codigo)')
    .eq('estado_pago', 'confirmado')
    .order('created_at', { ascending: false })
  if (error) throw parseError(error)
  return data || []
}
/* Obtener el id del usuario del portal por cedula */
export async function getPortalUserIdByCedula(cedula) {
  const { data, error } = await supabase.rpc('get_portal_user_id_by_cedula', { p_cedula: cedula })
  if (error) throw parseError(error)
  return data || null
}
/* Crear una reserva */
export async function createReserva(payload) {
  const { error } = await supabase.from('reservas_cementerio').insert(payload)
  if (error) throw parseError(error, {
    '23503': 'Error al crear reserva. Verifica cliente y lote.',
    '23514': 'Datos no válidos. Revisa método de pago y nombre del condenado.'
  })
}
/* Actualizar reserva */
export async function updateReserva(id, payload) {
  const { error } = await supabase
    .from('reservas_cementerio')
    .update(payload)
    .eq('id', id)
  if (error) throw parseError(error)
}
/* Suscribirse a las reservas de cementerio en tiempo real */
export function subscribeReservasCementerioRealtime(onUpsert, onRemove) {
  const channel = supabase
    .channel('reservas-cementerio-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reservas_cementerio' },
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
