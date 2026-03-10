import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'
import toast from 'react-hot-toast'

/* Retornar la pagina de registro de cliente */
export default function RegistroCliente() {
  const [form, setForm] = useState({ 
    cedula: '', 
    correo: '', 
    password: '' 
  })
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  /* Validar contraseña según política de Supabase (mayúscula, minúscula, número, símbolo) */
  const validarPassword = (pwd) => {
    if (!pwd || pwd.length < 6) return { ok: false, msg: 'Mínimo 6 caracteres' }
    if (!/[a-z]/.test(pwd)) return { ok: false, msg: 'Al menos una letra minúscula' }
    if (!/[A-Z]/.test(pwd)) return { ok: false, msg: 'Al menos una letra mayúscula' }
    if (!/[0-9]/.test(pwd)) return { ok: false, msg: 'Al menos un número' }
    if (!/[!@#$%^&*()_+\-=[\]{};':"|,.<>/?~`]/.test(pwd)) return { ok: false, msg: 'Al menos un símbolo (!@#$%...)' }
    return { ok: true }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.cedula || !form.correo || !form.password) {
      toast.error('Completa cédula, correo y contraseña')
      return
    }
    const pwdCheck = validarPassword(form.password)
    if (!pwdCheck.ok) {
      toast.error(`La contraseña debe tener: ${pwdCheck.msg}`)
      return
    }
    setLoading(true)
    try {
      const { data: yaExiste } = await supabase.rpc('cedula_ya_registrada', { p_cedula: form.cedula.trim() })
      if (yaExiste) {
        toast.error('Esta cédula ya está registrada. Si ya tienes cuenta, inicia sesión.')
        setLoading(false)
        return
      }
      await signUp(form.correo, form.password, {
        registro_tipo: 'cliente',
        cedula: form.cedula.trim()
      })
      toast.success('Registro completado. Inicia sesión')
      navigate('/login')
    } catch (err) {
      const msg = err?.message || ''
      if (msg.includes('already registered') || msg.includes('already exists')) {
        toast.error('Este correo ya tiene cuenta. Inicia sesión o recupera tu contraseña.')
      } else {
        toast.error(msg || 'Error al registrarse')
      }
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
          <div>
            <input
              name="password"
              type="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              className="bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-3 text-white w-full"
              required
              minLength={6}
            />
            <p className="text-gray-500 text-xs mt-1">
              Mín. 6 caracteres: mayúscula, minúscula, número y símbolo (!@#$...)
            </p>
          </div>
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