import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import toast from 'react-hot-toast'
/* funcion para retornar el layout de la pagina de login */
export default function Login() {
  const [email, setEmail] = useState('') /* funcion para retornar el email */
  const [password, setPassword] = useState('') /* funcion para retornar la contraseña */
  const [loading, setLoading] = useState(false) /* funcion para retornar el estado de carga */
  const { signIn } = useAuth() /* funcion para retornar el signIn */
  const navigate = useNavigate()
  /* funcion para manejar el submit del formulario */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('⛧ Ingresa email y contraseña')
      return
    }
    setLoading(true)
    try {
      await signIn(email, password)
      toast.success('⸸ Bienvenido al templo ⸸')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }
  /* funcion para retornar el layout de la pagina de login */
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
        <p className="mt-4 text-center text-gray-400 text-sm">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-red-400 hover:underline">Regístrate como vendedor</Link>
        </p>
      </div>
    </div>
  )
}
