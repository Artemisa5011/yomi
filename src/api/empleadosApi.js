import { supabase } from '../lib/supabase' /* Conectar la base de datos */
import { parseError } from './parseError' /* Manejo de Errores */

/* Crear empleado */
export async function createEmpleado(payload) {
  const { error } = await supabase.from('empleados').insert(payload)
  if (error) throw parseError(error, { '23505': 'Ya existe un empleado con esta cédula o correo' })
}

