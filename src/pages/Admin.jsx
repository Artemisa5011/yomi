import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Seccion from '../components/Seccion'
import * as adminApi from '../api/adminApi'
import toast from 'react-hot-toast'

export default function Admin() {
  const [cedulaVincular, setCedulaVincular] = useState('')
  const [loading, setLoading] = useState(false)

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
