import { useContext } from 'react'
import { AuthContext } from './authContext'
/* F. Retornar el contexto de autenticacion */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider') /* F. Retornar el error */
  return ctx
}
