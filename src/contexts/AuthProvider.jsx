import { useEffect, useState } from 'react'
import { AuthContext } from './authContext'
import { supabase } from '../lib/supabase'

/* Retornar el provider de autenticacion iniciar/cerrar */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rol, setRol] = useState(null)

  /* Cargar el usuario */
  useEffect(() => {
    const cargarPerfil = async (u) => {
      if (!u) {
        setRol(null)
        return
      }
      const { data, error } = await supabase
        .from('user_profiles')
        .select('rol')
        .eq('user_id', u.id)
        .single()
      if (error) {
        // Fallback: si aún no ejecutaste db/007_roles_portal.sql
        setRol(2)
        return
      }
      setRol(data?.rol ?? 2)
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      await cargarPerfil(u)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      cargarPerfil(u).finally(() => setLoading(false))
    })
    return () => subscription?.unsubscribe()
  }, [])

  /* Iniciar sesion */
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  /* Registrar un usuario */
  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
    if (error) throw error
    return data
  }

  /* Cerrar sesion */
  const signOut = async () => {
    await supabase.auth.signOut()
  }

  /* Retornar el valor del contexto */
  const value = {
    user,
    loading,
    rol,
    isAdmin: rol === 666,
    isVendedor: rol === 2 || rol === 666,
    isCliente: rol === 3,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  }
  
  /* Retornar el contexto de autenticacion */
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
