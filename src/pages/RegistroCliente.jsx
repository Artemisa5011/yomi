import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import Logo from '../components/Logo'
import toast from 'react-hot-toast'

/* Retornar la pagina de registro de cliente */
export default function RegistroCliente() {
  const [form, setForm] = useState({ 
    cedula: '', 
    correo: '', 
    password: '' 
  })
  const [loading, setLoading] = useState(false) /* estado para cargar el formulario */
  const { signUp } = useAuth() /* Registrar el cliente */
  const navigate = useNavigate() /* Navegar a la pagina de login */

/* Manejar el cambio del formulario */
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  
/* Manejar el submit del formulario */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.cedula || !form.correo || !form.password) {
      toast.error('Completa cédula, correo y contraseña')
      return
    }
    setLoading(true)
    try {
      // La migración db/007_roles_portal.sql crea rol=3 cuando registro_tipo='cliente'
      await signUp(form.correo, form.password, {
        registro_tipo: 'cliente',
        cedula: form.cedula.trim()
      })
      toast.success('Registro completado. Inicia sesión')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="w-full max-w-md mx-4 p-8 rounded-3xl border-4 border-red-900/60 bg-black/80 shadow-[0_-5px_25px_rgba(255,0,0,0.3)]">
        <div className="flex justify-center mb-4">
          <Logo className="h-16 w-16 object-contain mix-blend-screen" />
        </div>
        <h1 className="text-xl text-center text-red-400 mb-2">Registro Cliente</h1>
        <h2 className="text-lg text-center text-white mb-6">Portal “Mis Difuntos”</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="cedula"
            placeholder="Cédula"
            value={form.cedula}
            onChange={handleChange}
            className="bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-3 text-white"
            required
          />
          <input
            name="correo"
            type="email"
            placeholder="Correo electrónico"
            value={form.correo}
            onChange={handleChange}
            className="bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-3 text-white"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña (mín. 6)"
            value={form.password}
            onChange={handleChange}
            className="bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-3 text-white"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full py-3 px-6 bg-red-900/80 hover:bg-red-800 text-white font-bold disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'REGISTRARME'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400 text-sm">
          <Link to="/login" className="text-red-400 hover:underline">Ya tengo cuenta</Link>
        </p>
      </div>
    </div>
  )
}