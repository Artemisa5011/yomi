import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Seccion from '../components/Seccion'
import * as clientesApi from '../api/clientesApi'
import toast from 'react-hot-toast'
/* funcion para retornar el layout de la pagina de dashboard */
export default function Dashboard() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true) /* funcion para retornar el estado de carga */
  const [cedulaBuscar, setCedulaBuscar] = useState('')
  const [clienteEncontrado, setClienteEncontrado] = useState(null) /* funcion para retornar el cliente encontrado */
  const [deletingId, setDeletingId] = useState(null) /* funcion para retornar el id de eliminacion */
  /* funcion para cargar los clientes */
  useEffect(() => {
    cargarClientes()
  }, [])
  /* funcion para cargar los clientes */
  const cargarClientes = async () => {
    try {
      const data = await clientesApi.listClientes()
      setClientes(data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }
  /* funcion para buscar el cliente */
  const buscarCliente = async (e) => {
    e?.preventDefault()
    if (!cedulaBuscar.trim()) return
    try {
      const { data, notFound } = await clientesApi.getClienteByCedula(cedulaBuscar)
      if (notFound) {
        setClienteEncontrado(null)
        toast('Cliente no encontrado. Puedes registrarlo.')
      } else {
        setClienteEncontrado(data)
        toast.success('Cliente encontrado')
      }
    } catch (err) {
      toast.error(err.message)
    }
  }
  /* funcion para eliminar el cliente */
  const handleDeleteCliente = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar cliente "${nombre}"? No se puede deshacer.`)) return
    setDeletingId(id)
    try {
      await clientesApi.deleteCliente(id)
      setClientes((prev) => prev.filter((c) => c.id !== id))
      if (clienteEncontrado?.id === id) setClienteEncontrado(null)
      toast.success('Cliente eliminado')
    } catch (err) {
      if (err?.code === '23503') {
        toast.error('No se puede eliminar: tiene servicios o reservas asociados.')
      } else {
        toast.error(err.message)
      }
    } finally {
      setDeletingId(null)
    }
  }
  /* funcion para retornar el layout de la pagina de dashboard */
  return (
    <Layout title="DASHBOARD">
      <Seccion title="♰ Panel del Vendedor ♰">
        <p className="text-white/90 mb-6">Gestiona clientes y accede a ventas.</p>
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Link to="/funeraria" className="rounded-full px-6 py-3 bg-red-900/80 hover:bg-red-800 text-white font-bold">
            VENDER FUNERARIA
          </Link>
          <Link to="/cementerio" className="rounded-full px-6 py-3 bg-red-900/80 hover:bg-red-800 text-white font-bold">
            VENDER CEMENTERIO
          </Link>
        </div>
        /* funcion para buscar el cliente */
        <form onSubmit={buscarCliente} className="flex flex-wrap gap-2 justify-center max-w-md mx-auto mb-6">
          <input
            type="text"
            placeholder="Cédula del cliente"
            value={cedulaBuscar}
            onChange={(e) => setCedulaBuscar(e.target.value)}
            className="flex-1 min-w-45 bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white"
          />
          <button type="submit" className="rounded-full px-6 py-2 bg-red-900/80 hover:bg-red-800 text-white font-bold">
            BUSCAR
          </button>
        </form>
        /* funcion para retornar el cliente encontrado */
        {clienteEncontrado && (
          <div className="max-w-md mx-auto p-4 rounded-xl border border-red-900/50 bg-black/60 mb-6">
            <p className="text-red-400 font-bold">{clienteEncontrado.nombre_completo}</p>
            <p className="text-white/80">Cédula: {clienteEncontrado.cedula}</p>
            <p className="text-white/80">Estado: {clienteEncontrado.estado}</p>
            <Link
              to={`/clientes/editar/${clienteEncontrado.id}`}
              className="inline-block mt-2 text-red-400 hover:underline"
            >
              Editar contacto
            </Link>
            <div className="mt-4 flex gap-2">
              <Link
                to={`/funeraria?cedula=${clienteEncontrado.cedula}`}
                className="text-sm rounded px-3 py-1 bg-red-900/60 text-white"
              >
                Vender funeraria
              </Link>
              <Link
                to={`/cementerio?cedula=${clienteEncontrado.cedula}`}
                className="text-sm rounded px-3 py-1 bg-red-900/60 text-white"
              >
                Vender cementerio
              </Link>
            </div>
          </div>
        )}
        /* funcion para retornar el cliente no encontrado */
        {clienteEncontrado === null && cedulaBuscar.trim() && (
          <div className="max-w-md mx-auto p-4 rounded-xl border border-amber-900/50 bg-amber-950/20 mb-6">
            <p className="text-amber-400">Cliente no existe. Regístralo primero:</p>
            <Link
              to={`/clientes/nuevo?cedula=${cedulaBuscar}`}
              className="inline-block mt-2 text-amber-400 hover:underline"
            >
              Registrar cliente
            </Link>
          </div>
        )}
      </Seccion>
      /* funcion para retornar la lista de clientes */
      <Seccion title="📋 Lista de clientes">
        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : clientes.length === 0 ? ( /* funcion para retornar el cliente no encontrado */
          <p className="text-gray-400">No hay clientes registrados.</p>
        ) : ( /* funcion para retornar la lista de clientes */
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id} className="border-b border-red-900/30">
                    <td className="p-2">{c.cedula}</td>
                    <td className="p-2">{c.nombre_completo}</td>
                    <td className="p-2">{c.estado}</td>
                    <td className="p-2">
                      <Link to={`/clientes/editar/${c.id}`} className="text-red-400 hover:underline mr-2">Editar</Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteCliente(c.id, c.nombre_completo)}
                        disabled={deletingId === c.id}
                        className="text-amber-400 hover:underline disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>
    </Layout>
  )
}
