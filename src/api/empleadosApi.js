import { supabase } from '../lib/supabase' /* Conectar la base de datos */
import { parseError } from './parseError' /* Manejo de Errores */

/* Crear empleado (insert directo) */
export async function createEmpleado(payload) {
  const { error } = await supabase.from('empleados').insert(payload)
  if (error) throw parseError(error, { '23505': 'Ya existe un empleado con esta cédula o correo' })
}

/* Listar empleados (admin ve todos) */
export async function listEmpleados() {
  const { data, error } = await supabase
    .from('empleados')
    .select('id, cedula, nombre_completo, correo, estado, created_at')
    .order('nombre_completo')
  if (error) throw parseError(error)
  return data || []
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

