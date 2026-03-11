import { useEffect, useState } from 'react'
import { AuthContext } from './authContext'
import { supabase } from '../lib/supabase'

/* Retornar el provider de autenticacion iniciar/cerrar */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rol, setRol] = useState(null)
  const [nombreCompleto, setNombreCompleto] = useState('')

  /* Cargar el usuario */
  useEffect(() => {
    const cargarPerfil = async (u) => {
      if (!u) {
        setRol(null)
        setNombreCompleto('')
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
        setNombreCompleto('')
        return
      }
      setRol(data?.rol ?? 2)

      /* Obtener nombre para mostrar (RPC o empleados) */
      let nombre = ''
      try {
        const { data: nombreRpc } = await supabase.rpc('get_display_name')
        if (nombreRpc && typeof nombreRpc === 'string' && nombreRpc.trim()) {
          nombre = nombreRpc.trim()
        }
      } catch {
        /* RPC no existe o falló */
      }
      /* Vendedor (rol 2): verificar estado activo y obtener nombre */
      if (data?.rol === 2) {
        const { data: emp } = await supabase
          .from('empleados')
          .select('nombre_completo, estado')
          .eq('user_id', u.id)
          .single()
        if (emp?.estado === 'inactivo') {
          sessionStorage.setItem('logout_reason', 'cuenta_desactivada')
          await supabase.auth.signOut()
          setUser(null)
          setRol(null)
          setNombreCompleto('')
          setLoading(false)
          return
        }
        if (emp?.nombre_completo?.trim()) nombre = emp.nombre_completo.trim()
      }
      /* Admin (rol 666): obtener nombre desde empleados si existe */
      if (!nombre && data?.rol === 666) {
        const { data: emp } = await supabase
          .from('empleados')
          .select('nombre_completo')
          .eq('user_id', u.id)
          .single()
        if (emp?.nombre_completo?.trim()) nombre = emp.nombre_completo.trim()
      }
      setNombreCompleto(nombre || u.email || '')
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
    nombreCompleto: nombreCompleto || user?.email || '',
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
