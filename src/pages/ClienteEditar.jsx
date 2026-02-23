import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Seccion from '../components/Seccion'
import * as clientesApi from '../api/clientesApi'
import toast from 'react-hot-toast'
/* funcion para retornar el layout de la pagina de cliente editar */
export default function ClienteEditar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ telefono: '', correo: '', departamento: '', ciudad: '' }) /* funcion para retornar el formulario de cliente editar */
  const [loading, setLoading] = useState(true) /* funcion para retornar el estado de carga */ 
  const [saving, setSaving] = useState(false) /* funcion para retornar el estado de guardado */
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await clientesApi.getClienteById(id)
        setForm({
          telefono: data.telefono || '',
          correo: data.correo || '',
          departamento: data.departamento || '',
          ciudad: data.ciudad || ''
        })
      } catch (err) {
        toast.error(err.message)
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id, navigate])
  /* funcion para manejar el submit del formulario */
  const handleSubmit = async (e) => {
    e.preventDefault()
    const backup = { ...form }
    setSaving(true)
    toast.loading('Guardando...', { id: 'guardar' })
    try {
      await clientesApi.updateCliente(id, {
        telefono: form.telefono?.trim() || null,
        correo: form.correo?.trim() || null,
        departamento: form.departamento?.trim() || null,
        ciudad: form.ciudad?.trim() || null
      })
      toast.success('Cliente actualizado', { id: 'guardar' })
      navigate('/dashboard')
    } catch {
      setForm(backup)
      toast.error('Error al guardar. Cambios revertidos.', { id: 'guardar' })
    } finally {
      setSaving(false)
    }
  }
  /* funcion para retornar el layout de la pagina de cliente editar */
  if (loading) return (
    <Layout><div className="text-center py-12 text-gray-400">Cargando...</div></Layout>
  )
  /* funcion para retornar el layout de la pagina de cliente editar */
  return (
    <Layout title="Editar cliente">
      <Seccion title="♰ Actualizar contacto (teléfono, correo, departamento, ciudad) ♰">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col gap-4 text-left">
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
            <button type="submit" disabled={saving}
              className="flex-1 rounded-full py-2 bg-red-900/80 hover:bg-red-800 text-white font-bold disabled:opacity-50">
              GUARDAR
            </button>
            /* funcion para retornar el boton de cancelar */
            <button type="button" onClick={() => navigate('/dashboard')}
              className="rounded-full py-2 px-6 border border-red-600 text-red-400">
              Cancelar
            </button>
          </div>
        </form>
      </Seccion>
    </Layout>
  )
}
