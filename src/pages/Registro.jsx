import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import * as empleadosApi from '../api/empleadosApi'
import toast from 'react-hot-toast'
/* funcion para retornar el layout de la pagina de registro */
export default function Registro() {
  const [form, setForm] = useState({
    cedula: '',
    nombre_completo: '',
    telefono: '',
    correo: '',
    password: ''
  })
  const [loading, setLoading] = useState(false) /* funcion para retornar el estado de carga */
  const { signUp } = useAuth()
  const navigate = useNavigate()
  /* funcion para manejar el cambio de formulario */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  /* funcion para manejar el submit del formulario */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.cedula || !form.nombre_completo || !form.correo || !form.password) {
      toast.error('⛧ Completa todos los campos obligatorios')
      return
    }
    setLoading(true) /* funcion para cargar el formulario */
    try {
      const { data, error } = await signUp(form.correo, form.password, {
        cedula: form.cedula,
        nombre_completo: form.nombre_completo,
        telefono: form.telefono
      })
      if (error) throw error
      /* funcion para crear el empleado */
      if (data?.user) {
        try {
          /* funcion para crear el empleado */
          await empleadosApi.createEmpleado({
            user_id: data.user.id,
            cedula: form.cedula.trim(),
            nombre_completo: form.nombre_completo.trim(),
            telefono: form.telefono?.trim() || null,
            correo: form.correo.trim()
          })
        } catch (empError) {
          if (empError.code === '23505') toast.error('Ya existe un vendedor con esa cédula')
          else throw empError
        }
      }/* funcion para mostrar el mensaje de exito */
      toast.success('⸸ Registro completado. Inicia sesión ⸸')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }
  /* funcion para retornar el layout de la pagina de registro */
  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="w-full max-w-md mx-4 p-8 rounded-3xl border-4 border-red-900/60 bg-black/80 shadow-[0_-5px_25px_rgba(255,0,0,0.3)]">
        <div className="flex justify-center mb-4">
          <img src="/logo.jpg" alt="Yomi No Hana" className="h-16 w-16 object-contain mix-blend-screen" />
        </div>
        <h1 className="text-xl text-center text-red-400 mb-2">⸸ Registrar Vendedor ⸸</h1>
        <h2 className="text-lg text-center text-white mb-6">♰ Nuevo empleado ♰</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="cedula" placeholder="Cédula" value={form.cedula} onChange={handleChange}
            className="bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-3 text-white" required />
          <input name="nombre_completo" placeholder="Nombre completo" value={form.nombre_completo} onChange={handleChange}
            className="bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-3 text-white" required />
          <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange}
            className="bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-3 text-white" />
          <input name="correo" type="email" placeholder="Correo electrónico" value={form.correo} onChange={handleChange}
            className="bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-3 text-white" required />
          <input name="password" type="password" placeholder="Contraseña (mín. 6)" value={form.password} onChange={handleChange}
            className="bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-3 text-white" required minLength={6} />
          <button type="submit" disabled={loading}
            className="rounded-full py-3 px-6 bg-red-900/80 hover:bg-red-800 text-white font-bold disabled:opacity-50">
            {loading ? 'Registrando...' : 'REGISTRAR'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400 text-sm">
          <Link to="/login" className="text-red-400 hover:underline">Ya tengo cuenta</Link>
        </p>
      </div>
    </div>
  )
}
