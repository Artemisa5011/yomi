import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
/* F. Retornar el layout de la pagina de login */
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  useEffect(() => {
    const reason = sessionStorage.getItem('logout_reason')
    if (reason === 'cuenta_desactivada') {
      sessionStorage.removeItem('logout_reason')
      toast.error('Tu cuenta ha sido desactivada. Contacta al administrador.')
    }
  }, [])
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('⛧ Ingresa email y contraseña')
      return
    }
    setLoading(true)
    try {
      const { data: authData } = await signIn(email, password)
      const { data: profile } = await supabase.from('user_profiles').select('rol').eq('user_id', authData?.user?.id).single()
      const rol = profile?.rol ?? 2
      /* Vendedor inactivo: bloquear acceso */
      if (rol === 2) {
        const { data: emp } = await supabase.from('empleados').select('estado').eq('user_id', authData?.user?.id).single()
        if (emp?.estado === 'inactivo') {
          await supabase.auth.signOut()
          toast.error('Tu cuenta ha sido desactivada. Contacta al administrador.')
          setLoading(false)
          return
        }
      }
      toast.success('⸸ Bienvenido al templo ⸸')
      const destino = from || (rol === 3 ? '/mi-cementerio' : '/dashboard')
      navigate(destino, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }
  /* F. Layout de la pagina de login */
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-4 p-8 rounded-3xl border-4 border-red-900/60 bg-black/80 shadow-[0_-5px_25px_rgba(255,0,0,0.3)]">
        <div className="flex justify-center mb-4">
          <img src="/logo.jpg" alt="Yomi No Hana" className="h-20 w-20 object-contain mix-blend-screen" />
        </div>
        <h1 className="text-2xl text-center text-red-400 mb-2">⸸ TEMPLO FÚNEBRE YOMI NO HANA ⸸</h1>
        <h2 className="text-xl text-center text-white mb-6">♰ Iniciar sesión ♰</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-600 focus:border-transparent"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-600 focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full py-3 px-6 bg-red-900/80 hover:bg-red-800 text-white font-bold border border-red-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Entrando...' : 'ENTRAR'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400 text-sm space-y-2">
          <span className="block">¿No tienes cuenta?</span>
          <span>
            <Link to="/registro-cliente" className="text-red-400 hover:underline font-medium">Regístrate como cliente</Link>
            {' · '}
            <Link to="/registro" className="text-red-400 hover:underline">Regístrate como vendedor</Link>
          </span>
        </p>
      </div>
    </div>
  )
}
