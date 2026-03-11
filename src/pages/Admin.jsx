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
  const [deletingId, setDeletingId] = useState(null)
  const [ventasPorEmpleado, setVentasPorEmpleado] = useState({})

  useEffect(() => {
    cargarEmpleados()
  }, [])

  const cargarEmpleados = async () => {
    try {
      const data = await empleadosApi.listEmpleados()
      setEmpleados(data)
      const ventas = {}
      await Promise.all(
        data.map(async (e) => {
          ventas[e.id] = await empleadosApi.empleadoTieneVentas(e.user_id)
        })
      )
      setVentasPorEmpleado(ventas)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoadingEmpleados(false)
    }
  }

  const handleEliminar = async (id, nombre, userId) => {
    const tieneVentas = ventasPorEmpleado[id]
    if (tieneVentas) {
      toast.error('No se puede eliminar: el vendedor tiene ventas. Desactívalo en su lugar.')
      return
    }
    if (!window.confirm(`¿Eliminar vendedor "${nombre}" por completo? Se borrará su cuenta (correo liberado). Esta acción no se puede deshacer.`)) return
    const backup = [...empleados]
    setDeletingId(id)
    setEmpleados((prev) => prev.filter((e) => e.id !== id))
    try {
      await empleadosApi.deleteVendedorCompleto(userId)
      toast.success('Vendedor eliminado por completo (cuenta y correo liberados)')
    } catch (err) {
      setEmpleados(backup)
      toast.error(err.message + ' Cambios revertidos.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleEstado = async (id, nombre, estadoActual) => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo'
    if (!window.confirm(`¿Cambiar estado de "${nombre}" a ${nuevoEstado}? ${nuevoEstado === 'inactivo' ? 'No podrá volver a ingresar.' : 'Podrá acceder de nuevo.'}`)) return
    const backup = [...empleados]
    setTogglingId(id)
    setEmpleados((prev) => prev.map((e) => (e.id === id ? { ...e, estado: nuevoEstado } : e)))
    try {
      await empleadosApi.updateEmpleadoEstado(id, nuevoEstado)
      toast.success(`Estado actualizado a ${nuevoEstado}`)
    } catch (err) {
      setEmpleados(backup)
      toast.error(err.message + ' Cambios revertidos.')
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
            Sin ventas: puede <span className="text-red-400">eliminarse</span>. Con ventas: solo <span className="text-amber-400">Desactivar/Reactivar</span> (no se eliminan las ventas).
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
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/empleados/editar/${e.id}`}
                            className="text-sm rounded px-3 py-1 bg-red-900/50 text-red-400 hover:bg-red-900/70"
                          >
                            Editar
                          </Link>
                          {ventasPorEmpleado[e.id] ? (
                            <button
                              type="button"
                              onClick={() => handleToggleEstado(e.id, e.nombre_completo, e.estado)}
                              disabled={togglingId === e.id}
                              className={`text-sm rounded px-3 py-1 ${e.estado === 'activo' ? 'bg-amber-900/50 text-amber-400 hover:bg-amber-900/70' : 'bg-green-900/50 text-green-400 hover:bg-green-900/70'} disabled:opacity-50`}
                            >
                              {e.estado === 'activo' ? 'Desactivar' : 'Reactivar'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleEliminar(e.id, e.nombre_completo, e.user_id)}
                              disabled={deletingId === e.id}
                              className="text-sm rounded px-3 py-1 bg-red-950/70 text-red-300 hover:bg-red-900/70 disabled:opacity-50"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
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
