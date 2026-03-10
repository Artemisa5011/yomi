import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Seccion from '../components/Seccion'
import * as clientesApi from '../api/clientesApi'
import * as serviciosFunerariosApi from '../api/serviciosFunerariosApi'
import * as reservasCementerioApi from '../api/reservasCementerioApi'
import toast from 'react-hot-toast'

/* Formato moneda */
const fmt = (n) => Number(n ?? 0).toLocaleString('es-CO')

export default function ClienteDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [servicios, setServicios] = useState([])
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const [cli, srv, res] = await Promise.all([
          clientesApi.getClienteById(id),
          serviciosFunerariosApi.listServiciosByClienteId(id),
          reservasCementerioApi.listReservasByClienteId(id)
        ])
        setCliente(cli)
        setServicios(srv)
        setReservas(res)
      } catch (err) {
        toast.error(err.message)
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    if (id) cargar()
  }, [id, navigate])

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      </Layout>
    )
  }

  if (!cliente) return null

  return (
    <Layout title="Detalle del cliente">
      <Seccion title={`♰ ${cliente.nombre_completo} ♰`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-red-900/50 bg-black/60">
            <p className="text-red-400 font-bold">Datos del cliente</p>
            <p className="text-white/90 mt-2">Cédula: {cliente.cedula}</p>
            <p className="text-white/90">Estado: {cliente.estado}</p>
            <p className="text-white/90">Teléfono: {cliente.telefono || '-'}</p>
            <p className="text-white/90">Correo: {cliente.correo || '-'}</p>
            <p className="text-white/90">Ubicación: {cliente.ciudad ? `${cliente.ciudad}, ${cliente.departamento || ''}` : '-'}</p>
          </div>
          <div className="flex flex-col justify-center gap-2">
            <Link
              to={`/clientes/editar/${cliente.id}`}
              className="rounded-full py-2 px-4 bg-red-900/80 hover:bg-red-800 text-white font-bold text-center"
            >
              Editar contacto
            </Link>
            <Link
              to={`/funeraria?cedula=${cliente.cedula}`}
              className="rounded-full py-2 px-4 bg-red-900/60 hover:bg-red-800 text-white text-center"
            >
              Vender funeraria
            </Link>
            <Link
              to={`/cementerio?cedula=${cliente.cedula}`}
              className="rounded-full py-2 px-4 bg-red-900/60 hover:bg-red-800 text-white text-center"
            >
              Vender cementerio
            </Link>
          </div>
        </div>
      </Seccion>

      <Seccion title="🕯️ Servicios funerarios">
        {servicios.length === 0 ? (
          <p className="text-gray-400">No tiene servicios funerarios.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-red-400 border-b border-red-900/50">
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Fecha</th>
                  <th className="p-2">Hora</th>
                  <th className="p-2">Difunto</th>
                  <th className="p-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {servicios.map((s) => (
                  <tr key={s.id} className="border-b border-red-900/30">
                    <td className="p-2">{s.tipo}</td>
                    <td className="p-2">{s.fecha}</td>
                    <td className="p-2">{s.hora || '-'}</td>
                    <td className="p-2">{s.nombre_difunto || '-'}</td>
                    <td className="p-2">${fmt(s.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>

      <Seccion title="⸸ Reservas cementerio (lotes)">
        {reservas.length === 0 ? (
          <p className="text-gray-400">No tiene reservas de cementerio.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-red-400 border-b border-red-900/50">
                  <th className="p-2">Lote</th>
                  <th className="p-2">Estado</th>
                  <th className="p-2">Difunto</th>
                  <th className="p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id} className="border-b border-red-900/30">
                    <td className="p-2">{r.lotes?.nombre} ({r.lotes?.codigo})</td>
                    <td className="p-2">{r.estado}</td>
                    <td className="p-2">{r.nombre_difunto || '-'}</td>
                    <td className="p-2">${fmt(r.valor_total ?? (Number(r.valor_base || 0) + Number(r.valor_adicional || 0)))}</td>
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
