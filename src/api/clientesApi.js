import { supabase } from '../lib/supabase' /* Conectar la base de datos */
import { parseError } from './parseError' /* Manejo de Errores */
/* Listar los clientes */
export async function listClientes() {
  const { data, error } = await supabase
  .from('clientes')
  .select('*')
  .order('created_at', { ascending: false })
  if (error) throw parseError(error)
  return data || []
}
/* Obtener un cliente por cedula */
export async function getClienteByCedula(cedula) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('cedula', cedula.trim())
    .single()
  if (error && error.code !== 'PGRST116') throw parseError(error)
  return { data, notFound: error?.code === 'PGRST116' }
}
/* Por id */
export async function getClienteById(id) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw parseError(error, { PGRST116: 'Cliente no encontrado' })
  return data
}
/* Crear un cliente */
export async function createCliente(payload) {
  const { error } = await supabase.from('clientes').insert(payload)
  if (error) throw parseError(error, { '23505': 'Ya existe un cliente con esta cédula' })
}
/* Actualizar un cliente */
export async function updateCliente(id, payload) {
  const { error } = await supabase.from('clientes').update(payload).eq('id', id)
  if (error) throw parseError(error)
}
/* Eliminar un cliente */
export async function deleteCliente(id) {
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) throw parseError(error, { '23503': 'No se puede eliminar. El cliente tiene servicios o reservas asociados.' })
}
