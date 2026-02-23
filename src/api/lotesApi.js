import { supabase } from '../lib/supabase' /* Conectar la base de datos */
import { parseError } from './parseError' /* Manejo de Errores */

/* Listar lotes */
export async function listLotes(){
    const { data, error} = await supabase.from('lotes').select('*')
    if(error) throw parseError(error)
    return data || []
}