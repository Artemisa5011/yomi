import { useContext } from 'react'
import { AuthContext } from './authContext'
/* funcion para retornar el contexto de autenticacion */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider') /* funcion para retornar el error */
  return ctx
}
