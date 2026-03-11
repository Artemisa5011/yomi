import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Seccion from '../components/Seccion'
import * as adminApi from '../api/adminApi'
import * as empleadosApi from '../api/empleadosApi'
import toast from 'react-hot-toast'

export default function Admin() {
  const [cedulaVincular, setCedulaVincular] = useState('')
  const [loading, setLoading] = useState(false)
  const [empleados, setEmpleados] = useState([])
  const [loadingEmpleados, setLoadingEmpleados] = useState(true)
  const [togglingId, setTogglingId] = useState(null)

  useEffect(() => {
    cargarEmpleados()
  }, [])

  const cargarEmpleados = async () => {
    try {
      const data = await empleadosApi.listEmpleados()
      setEmpleados(data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoadingEmpleados(false)
    }
  }

  const handleToggleEstado = async (id, nombre, estadoActual) => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo'
    if (!window.confirm(`¿Cambiar estado de "${nombre}" a ${nuevoEstado}? ${nuevoEstado === 'inactivo' ? 'No podrá volver a ingresar.' : 'Podrá acceder de nuevo.'}`)) return
    setTogglingId(id)
    try {
      await empleadosApi.updateEmpleadoEstado(id, nuevoEstado)
      setEmpleados((prev) => prev.map((e) => (e.id === id ? { ...e, estado: nuevoEstado } : e)))
      toast.success(`Estado actualizado a ${nuevoEstado}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setTogglingId(null)
    }
  }

  const handleVincular = async (e) => {
    e.preventDefault()
    if (!cedulaVincular?.trim()) {
      toast.error('Ingresa la cédula del cliente')
      return
    }
    setLoading(true)
    try {
      const { servicios, reservas } = await adminApi.vincularServiciosPorCedula(cedulaVincular)
      toast.success(`Vinculados: ${servicios} servicios, ${reservas} reservas. El cliente puede ver sus datos en Mis Difuntos.`)
      setCedulaVincular('')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Admin">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-red-400">⸸ Panel de administración ⸸</h1>
        <p className="text-gray-300">
          Como administrador puedes gestionar vendedores y acceder a todas las funciones del sistema.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/registro"
            className="inline-block rounded-lg px-6 py-3 bg-red-900/80 hover:bg-red-800 text-white font-bold transition-colors"
          >
            Registrar vendedor
          </Link>
          <Link
            to="/dashboard"
            className="inline-block rounded-lg px-6 py-3 border border-red-900/60 hover:bg-red-900/30 text-white font-bold transition-colors"
          >
            Dashboard
          </Link>
        </div>

        <Seccion title="👥 Vendedores">
          <p className="text-gray-400 text-sm mb-4">
            Cambia el estado a <span className="text-amber-400">inactivo</span> si un vendedor renuncia o es despedido. No podrá volver a ingresar, pero sus ventas se conservan.
          </p>
          {loadingEmpleados ? (
            <p className="text-gray-400">Cargando vendedores...</p>
          ) : empleados.length === 0 ? (
            <p className="text-gray-400">No hay vendedores registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-red-900/50">
                    <th className="text-left py-2 text-gray-400">Nombre</th>
                    <th className="text-left py-2 text-gray-400">Cédula</th>
                    <th className="text-left py-2 text-gray-400">Correo</th>
                    <th className="text-left py-2 text-gray-400">Estado</th>
                    <th className="text-left py-2 text-gray-400">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {empleados.map((e) => (
                    <tr key={e.id} className="border-b border-red-900/30">
                      <td className="py-2">{e.nombre_completo}</td>
                      <td className="py-2">{e.cedula}</td>
                      <td className="py-2 text-gray-400">{e.correo || '-'}</td>
                      <td className="py-2">
                        <span className={e.estado === 'activo' ? 'text-green-400' : 'text-amber-400'}>
                          {e.estado}
                        </span>
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => handleToggleEstado(e.id, e.nombre_completo, e.estado)}
                          disabled={togglingId === e.id}
                          className={`text-sm rounded px-3 py-1 ${e.estado === 'activo' ? 'bg-amber-900/50 text-amber-400 hover:bg-amber-900/70' : 'bg-green-900/50 text-green-400 hover:bg-green-900/70'} disabled:opacity-50`}
                        >
                          {e.estado === 'activo' ? 'Desactivar' : 'Reactivar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Seccion>
        <Seccion title="🔗 Vincular cliente portal">
          <p className="text-gray-400 text-sm mb-4">
            Si un cliente tiene servicios o reservas pero no los ve en &quot;Mis Difuntos&quot;, ingresa su cédula para vincularlos.
          </p>
          <form onSubmit={handleVincular} className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Cédula del cliente"
              value={cedulaVincular}
              onChange={(e) => setCedulaVincular(e.target.value)}
              className="flex-1 min-w-[180px] bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-full px-6 py-2 bg-red-900/80 hover:bg-red-800 text-white font-bold disabled:opacity-50"
            >
              {loading ? 'Vinculando...' : 'VINCULAR'}
            </button>
          </form>
        </Seccion>
      </div>
    </Layout>
  )
}
