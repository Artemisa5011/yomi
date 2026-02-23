import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Seccion from '../components/Seccion'
import * as clientesApi from '../api/clientesApi'
import { useAuth } from '../contexts/useAuth'
import toast from 'react-hot-toast'
/* funcion para retornar el layout de la pagina de cliente nuevo */
export default function ClienteNuevo() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const cedulaParam = searchParams.get('cedula') || ''
  const navigate = useNavigate()
  const [form, setForm] = useState({
    cedula: cedulaParam,
    nombre_completo: '',
    telefono: '',
    correo: '',
    departamento: '',
    ciudad: ''
  })
  const [loading, setLoading] = useState(false) /* funcion para retornar el estado de carga */
  /* funcion para cargar el cliente */
  useEffect(() => {
    if (cedulaParam) setForm((f) => ({ ...f, cedula: cedulaParam }))
  }, [cedulaParam])
  /* funcion para manejar el cambio de formulario */
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  /* funcion para manejar el submit del formulario */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.cedula?.trim() || !form.nombre_completo?.trim()) {
      toast.error('Cédula y nombre son obligatorios')
      return
    }
    setLoading(true) /* funcion para cargar el cliente */
    try {
      await clientesApi.createCliente({
        user_id: user.id,
        cedula: form.cedula.trim(),
        nombre_completo: form.nombre_completo.trim(),
        telefono: form.telefono?.trim() || null,
        correo: form.correo?.trim() || null,
        departamento: form.departamento?.trim() || null,
        ciudad: form.ciudad?.trim() || null,
        estado: 'activo'
      })
      toast.success('Cliente registrado')
      navigate('/dashboard')
    } catch (err) {
      if (err.code === '23505') toast.error('Ya existe un cliente con esa cédula')
      else toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }
  /* funcion para retornar el layout de la pagina de cliente nuevo */
  return (
    <Layout title="Registrar cliente">
      <Seccion title="♰ Nuevo cliente ♰">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col gap-4 text-left">
          <div>
            <label className="block text-red-400 mb-1">Cédula *</label>
            <input name="cedula" value={form.cedula} onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white" required />
          </div>
          <div>
            <label className="block text-red-400 mb-1">Nombre completo *</label>
            <input name="nombre_completo" value={form.nombre_completo} onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white" required />
          </div>
          <div>
            <label className="block text-red-400 mb-1">Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white" />
          </div>
          <div>
            <label className="block text-red-400 mb-1">Correo</label>
            <input name="correo" type="email" value={form.correo} onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white" />
          </div>
          <div>
            <label className="block text-red-400 mb-1">Departamento</label>
            <input name="departamento" value={form.departamento} onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white" />
          </div>
          <div>
            <label className="block text-red-400 mb-1">Ciudad</label>
            <input name="ciudad" value={form.ciudad} onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white" />
          </div>
          <div className="flex gap-2 pt-4">
            <button type="submit" disabled={loading}
              className="flex-1 rounded-full py-2 bg-red-900/80 hover:bg-red-800 text-white font-bold disabled:opacity-50">
              REGISTRAR
            </button>
            <button type="button" onClick={() => navigate('/dashboard')}
              className="rounded-full py-2 px-6 border border-red-600 text-red-400 hover:bg-red-900/30">
              Cancelar
            </button>
          </div>
        </form>
      </Seccion>
    </Layout>
  )
}
