import { supabase } from '../lib/supabase' /* Conectar la base de datos */
import { FunctionsHttpError } from '@supabase/supabase-js'
import { parseError } from './parseError' /* Manejo de Errores */

/* Crear empleado (insert directo) - nuevas cuentas quedan activas */
export async function createEmpleado(payload) {
  const { error } = await supabase.from('empleados').insert({ ...payload, estado: payload.estado ?? 'activo' })
  if (error) throw parseError(error, { '23505': 'Ya existe un empleado con esta cédula o correo' })
}

/* Listar empleados (admin ve todos) */
export async function listEmpleados() {
  const { data, error } = await supabase
    .from('empleados')
    .select('id, user_id, cedula, nombre_completo, telefono, correo, estado, created_at')
    .order('nombre_completo')
  if (error) throw parseError(error)
  return data || []
}

/* Verificar si el empleado tiene ventas (servicios o reservas) */
export async function empleadoTieneVentas(userId) {
  const [serv, res] = await Promise.all([
    supabase.from('servicios_funerarios').select('id').eq('user_id', userId).limit(1),
    supabase.from('reservas_cementerio').select('id').eq('user_id', userId).limit(1)
  ])
  return (serv.data?.length ?? 0) > 0 || (res.data?.length ?? 0) > 0
}

/* Eliminar empleado (solo si no tiene ventas) - borrado suave, solo tabla empleados */
export async function deleteEmpleado(id) {
  const { error } = await supabase.from('empleados').delete().eq('id', id)
  if (error) throw parseError(error, { '23503': 'No se puede eliminar. El vendedor tiene ventas (servicios o reservas).' })
}

/* Eliminar vendedor por completo: cuenta auth + empleado + user_profile (solo si no tiene ventas) */
export async function deleteVendedorCompleto(userId) {
  const { data, error } = await supabase.functions.invoke('delete-vendedor-auth', {
    body: { user_id: userId }
  })
  if (error) {
    if (error instanceof FunctionsHttpError && error.context) {
      try {
        const text = await error.context.text()
        const body = text ? JSON.parse(text) : null
        if (body?.error) throw new Error(body.error)
      } catch (e) {
        if (e instanceof Error && !(e instanceof SyntaxError)) throw e
      }
    }
    throw new Error(error.message || 'Error al eliminar vendedor')
  }
  if (data?.error) throw new Error(data.error)
  return data
}

/* Obtener empleado por id */
export async function getEmpleadoById(id) {
  const { data, error } = await supabase
    .from('empleados')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw parseError(error, { PGRST116: 'Empleado no encontrado' })
  return data
}

/* Actualizar empleado (solo admin) */
export async function updateEmpleado(id, payload) {
  const { error } = await supabase
    .from('empleados')
    .update(payload)
    .eq('id', id)
  if (error) throw parseError(error, { '23505': 'Ya existe un empleado con esa cédula' })
}

/* Actualizar estado del empleado (solo admin) */
export async function updateEmpleadoEstado(id, estado) {
  const { error } = await supabase
    .from('empleados')
    .update({ estado })
    .eq('id', id)
  if (error) throw parseError(error)
}

/* Crear empleado via RPC - evita problemas de sesión al registrar vendedor (ejecuta db/023_crear_empleado_admin_rpc.sql) */
export async function createEmpleadoRpc(payload) {
  const { data, error } = await supabase.rpc('crear_empleado_por_admin', {
    p_user_id: payload.user_id,
    p_cedula: payload.cedula,
    p_nombre_completo: payload.nombre_completo,
    p_telefono: payload.telefono || null,
    p_correo: payload.correo || null
  })
  if (error) throw parseError(error, { '23505': 'Ya existe un vendedor con esa cédula' })
  return data
}

