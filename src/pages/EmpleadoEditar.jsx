import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Seccion from '../components/Seccion'
import * as empleadosApi from '../api/empleadosApi'
import toast from 'react-hot-toast'

export default function EmpleadoEditar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ cedula: '', nombre_completo: '', telefono: '', correo: '' })
  const [original, setOriginal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await empleadosApi.getEmpleadoById(id)
        const initial = {
          cedula: data.cedula || '',
          nombre_completo: data.nombre_completo || '',
          telefono: data.telefono || '',
          correo: data.correo || ''
        }
        setForm(initial)
        setOriginal(initial)
      } catch (err) {
        toast.error(err.message)
        navigate('/admin')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.cedula?.trim() || !form.nombre_completo?.trim()) {
      toast.error('Cédula y nombre son obligatorios')
      return
    }
    setSaving(true)
    toast.loading('Guardando...', { id: 'guardar' })
    try {
      await empleadosApi.updateEmpleado(id, {
        cedula: form.cedula.trim(),
        nombre_completo: form.nombre_completo.trim(),
        telefono: form.telefono?.trim() || null,
        correo: form.correo?.trim() || null
      })
      toast.success('Vendedor actualizado', { id: 'guardar' })
      navigate('/admin')
    } catch {
      if (original) setForm({ ...original })
      toast.error('Error al guardar. Cambios revertidos.', { id: 'guardar' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      </Layout>
    )
  }

  return (
    <Layout title="Editar vendedor">
      <div className="mb-4">
        <Link to="/admin" className="text-red-400 hover:underline">
          ← Volver al panel Admin
        </Link>
      </div>
      <Seccion title="♰ Actualizar datos del vendedor ♰">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col gap-4 text-left">
          <div>
            <label className="block text-red-400 mb-1">Cédula</label>
            <input
              name="cedula"
              value={form.cedula}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-red-400 mb-1">Nombre completo</label>
            <input
              name="nombre_completo"
              value={form.nombre_completo}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-red-400 mb-1">Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-red-400 mb-1">Correo</label>
            <input
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-full py-2 bg-red-900/80 hover:bg-red-800 text-white font-bold disabled:opacity-50"
            >
              GUARDAR
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="rounded-full py-2 px-6 border border-red-600 text-red-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Seccion>
    </Layout>
  )
}
